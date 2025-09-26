const { ObjectId } = require("mongodb");
const { response_sender } = require("../../hooks/respose_sender");
const {
  attendance_collection,
  leave_collection,
  office_hours_collection
} = require("../../../collection/collections/hrm/employees");
const { user_collection } = require("../../../collection/collections/auth");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// --- Extend Dayjs ---
dayjs.extend(utc);
dayjs.extend(timezone);

// --- Authentication helper ---
const authenticateUser = async (req) => {
  try {
    const userId = req.headers.authorization;
    if (!userId) return null;
    const user = await user_collection.findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (err) {
    return null;
  }
};

// --- Helper: Safe Dayjs object in Dhaka timezone ---
const safeDayjs = (hour, minute, second = 0) => {
  const h = Number.isInteger(hour) ? hour : 15;
  const m = Number.isInteger(minute) ? minute : 0;
  return dayjs().tz("Asia/Dhaka").hour(h).minute(m).second(second);
};

// --- Get workspace office hours ---
const getWorkspaceOfficeHours = async (workspace_id) => {
  const config = await office_hours_collection.findOne({ workspace_id });

  const defaultHours = {
    startHour: 15, // 3:00 PM
    startMinute: 0,
    endHour: 22, // 10:00 PM
    endMinute: 0
  };

  const hours = config?.hours || defaultHours;

  return {
    startHour: Number.isInteger(hours.startHour) ? hours.startHour : defaultHours.startHour,
    startMinute: Number.isInteger(hours.startMinute) ? hours.startMinute : defaultHours.startMinute,
    endHour: Number.isInteger(hours.endHour) ? hours.endHour : defaultHours.endHour,
    endMinute: Number.isInteger(hours.endMinute) ? hours.endMinute : defaultHours.endMinute
  };
};

// --- Check attendance window ---
const isWithinAttendanceWindow = (officeHours) => {
  const start = safeDayjs(officeHours.startHour, officeHours.startMinute);
  const end = start.add(10, "minute");
  const current = dayjs().tz("Asia/Dhaka");

  return current.isAfter(start) && current.isBefore(end) || current.isSame(start);
};

// --- Check leave window ---
const isWithinLeaveWindow = (officeHours) => {
  const officeEndTime = safeDayjs(officeHours.endHour, officeHours.endMinute);
  let nextDayStart = safeDayjs(officeHours.startHour, officeHours.startMinute).add(1, "day");
  const current = dayjs().tz("Asia/Dhaka");

  if (current.isBefore(safeDayjs(officeHours.startHour, officeHours.startMinute))) {
    nextDayStart = safeDayjs(officeHours.startHour, officeHours.startMinute);
  }

  return (current.isAfter(officeEndTime) || current.isSame(officeEndTime)) && current.isBefore(nextDayStart);
};

// --- Mark Attendance ---
const markAttendance = async (req, res, next) => {
  try {
    const user = await authenticateUser(req);
    if (!user) return response_sender({ res, status_code: 401, message: "Unauthorized user" });

    const employeeId = req.headers.authorization;
    const workspace_id = req.headers.workspace_id;

    const officeHours = await getWorkspaceOfficeHours(workspace_id);
    const now = dayjs().tz("Asia/Dhaka");

    if (!isWithinAttendanceWindow(officeHours)) {
      const startTime = safeDayjs(officeHours.startHour, officeHours.startMinute).format("h:mm A");
      const endTime = safeDayjs(officeHours.startHour, officeHours.startMinute).add(10, "minute").format("h:mm A");
      return response_sender({ res, status_code: 403, message: `Attendance can only be marked between ${startTime} and ${endTime}.` });
    }

    const today = now.startOf("day").toDate();
    const existingAttendance = await attendance_collection.findOne({ employeeId: new ObjectId(employeeId), date: today });
    if (existingAttendance) return response_sender({ res, status_code: 400, message: "Attendance already marked for today." });

    const attendanceRecord = {
      employeeId: new ObjectId(employeeId),
      workspace_id,
      date: today,
      status: "Present",
      checkInTime: now.toDate(),
      markedBy: user.name || "Unknown",
      createdAt: now.toDate()
    };

    const result = await attendance_collection.insertOne(attendanceRecord);
    return response_sender({ res, status_code: 201, data: { ...attendanceRecord, _id: result.insertedId }, message: "Attendance marked successfully!" });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    next(error);
  }
};

// --- Mark Leave ---
const markLeave = async (req, res, next) => {
  try {
    const user = await authenticateUser(req);
    if (!user)
      return response_sender({
        res,
        status_code: 401,
        message: "Unauthorized user"
      });

    const employeeId = req.headers.authorization;
    const workspace_id = req.headers.workspace_id;

    const officeHours = await getWorkspaceOfficeHours(workspace_id);
    const now = dayjs().tz("Asia/Dhaka");

    if (!isWithinLeaveWindow(officeHours)) {
      const endTime = safeDayjs(officeHours.endHour, officeHours.endMinute).format("h:mm A");
      const nextStartTime = safeDayjs(officeHours.startHour, officeHours.startMinute)
        .add(1, "day")
        .format("h:mm A");
      return response_sender({
        res,
        status_code: 403,
        message: `Leave can only be marked between ${endTime} today and ${nextStartTime} tomorrow.`
      });
    }

    // Decide leave date (today or yesterday depending on cutoff)
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const leaveDate =
      currentHour < officeHours.startHour ||
      (currentHour === officeHours.startHour && currentMinute < officeHours.startMinute)
        ? now.subtract(1, "day").startOf("day").toDate()
        : now.startOf("day").toDate();

    // 🔹 Only check leave_collection for duplicate leave entry
    const existingLeave = await leave_collection.findOne({
      employeeId: new ObjectId(employeeId),
      workspace_id,
      startDate: leaveDate,
      endDate: leaveDate
    });

    if (existingLeave) {
      return response_sender({
        res,
        status_code: 400,
        message: "Leave already marked for this day."
      });
    }

    // Insert into leave_collection
    const leaveRecord = {
      employeeId: new ObjectId(employeeId),
      workspace_id,
      startDate: leaveDate,
      endDate: leaveDate,
      status: "Approved",
      reason: "Marked via system",
      markedBy: user.name || "Unknown",
      createdAt: now.toDate()
    };
    const leaveResult = await leave_collection.insertOne(leaveRecord);

    return response_sender({
      res,
      status_code: 201,
      data: { ...leaveRecord, _id: leaveResult.insertedId },
      message: "Leave marked successfully!"
    });
  } catch (error) {
    console.error("Mark Leave Error:", error);
    next(error);
  }
};


// --- Attendance Summary ---
const getAttendanceSummary = async (req, res, next) => {
  try {
    const user = await authenticateUser(req);
    if (!user) return response_sender({ res, status_code: 401, message: "Unauthorized user" });

    const employeeId = req.headers.authorization;
    const workspace_id = req.headers.workspace_id;
    const today = dayjs().tz("Asia/Dhaka");
    const startOfMonth = today.startOf("month").toDate();
    const endOfMonth = today.endOf("month").toDate();
    const currentDayOfMonth = today.date();

    const presentCount = await attendance_collection.countDocuments({
      employeeId: new ObjectId(employeeId),
      workspace_id,
      status: "Present",
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const leaveCount = await attendance_collection.countDocuments({
      employeeId: new ObjectId(employeeId),
      workspace_id,
      status: "Leave",
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const todayStart = today.startOf("day").toDate();
    const todaysRecord = await attendance_collection.findOne({ employeeId: new ObjectId(employeeId), date: todayStart });

    const safeCheckInFormat = (checkInTime) => {
      if (!checkInTime) return '-';
      const dt = dayjs(checkInTime);
      return dt.isValid() ? dt.tz("Asia/Dhaka").format("h:mm A") : '-';
    };

    let todaysStatus = "Not Marked Yet";
    if (todaysRecord) {
      switch (todaysRecord.status) {
        case "Present":
          todaysStatus = `Present (Check-in: ${safeCheckInFormat(todaysRecord.checkInTime)})`;
          break;
        case "Leave":
          todaysStatus = "On Leave";
          break;
        case "Absent":
          todaysStatus = "Absent";
          break;
      }
    }

    const totalLeaveAllowed = 20;
    const summary = {
      daysPresent: presentCount,
      totalDays: currentDayOfMonth,
      attendancePercentage: Math.round((presentCount / (currentDayOfMonth || 1)) * 100),
      todaysStatus,
      leaveTaken: leaveCount,
      totalLeave: totalLeaveAllowed,
      leaveBalance: totalLeaveAllowed - leaveCount,
    };

    return response_sender({ res, status_code: 200, data: summary, message: "Attendance summary fetched successfully." });
  } catch (error) {
    console.error("Get Attendance Summary Error:", error);
    next(error);
  }
};

// --- Get Office Hours ---
const getOfficeHours = async (req, res, next) => {
  try {
    const user = await authenticateUser(req);
    if (!user) return response_sender({ res, status_code: 401, message: "Unauthorized user" });

    const workspace_id = req.headers.workspace_id;
    const officeHours = await getWorkspaceOfficeHours(workspace_id);
    const now = dayjs().tz("Asia/Dhaka");

    const officeStart = safeDayjs(officeHours.startHour, officeHours.startMinute);
    const officeEnd = safeDayjs(officeHours.endHour, officeHours.endMinute);
    const attendanceWindowEnd = officeStart.add(10, "minute");
    const leaveWindowEnd = officeStart.add(1, "day");

    const isAttendanceActive = isWithinAttendanceWindow(officeHours);
    const isLeaveActive = isWithinLeaveWindow(officeHours);

    res.json({
      success: true,
      data: {
        officeHours: {
          start: officeStart.format("HH:mm"),
          end: officeEnd.format("HH:mm"),
          startFormatted: officeStart.format("h:mm A"),
          endFormatted: officeEnd.format("h:mm A")
        },
        timeWindows: {
          attendance: {
            start: officeStart.format("HH:mm"),
            end: attendanceWindowEnd.format("HH:mm"),
            startFormatted: officeStart.format("h:mm A"),
            endFormatted: attendanceWindowEnd.format("h:mm A"),
            isActive: isAttendanceActive
          },
          leave: {
            start: officeEnd.format("HH:mm"),
            end: leaveWindowEnd.format("HH:mm"),
            startFormatted: officeEnd.format("h:mm A"),
            endFormatted: leaveWindowEnd.format("h:mm A (next day)"),
            isActive: isLeaveActive
          }
        },
        currentTime: now.format("HH:mm:ss"),
        currentTimeFormatted: now.format("h:mm:ss A"),
        timezone: "Asia/Dhaka"
      },
      message: "Office hours configuration retrieved"
    });
  } catch (error) {
    console.error("Get Office Hours Error:", error);
    next(error);
  }
};

// --- Update Office Hours ---
const updateOfficeHours = async (req, res, next) => {
  try {
    const user = await authenticateUser(req);
    if (!user) return response_sender({ res, status_code: 401, message: "Unauthorized user" });

    const workspace_id = req.headers.workspace_id;
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) return response_sender({ res, status_code: 400, message: "Start time and end time are required" });

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    if (startHour === endHour && startMinute >= endMinute) return response_sender({ res, status_code: 400, message: "End time must be after start time" });

    const newHours = { startHour, startMinute, endHour, endMinute };
    await office_hours_collection.updateOne({ workspace_id }, { $set: { workspace_id, hours: newHours, updatedAt: new Date() } }, { upsert: true });

    const officeStart = safeDayjs(startHour, startMinute);
    const officeEnd = safeDayjs(endHour, endMinute);

    res.json({
      success: true,
      data: {
        officeHours: {
          start: officeStart.format("HH:mm"),
          end: officeEnd.format("HH:mm"),
          startFormatted: officeStart.format("h:mm A"),
          endFormatted: officeEnd.format("h:mm A")
        }
      },
      message: "Office hours updated successfully"
    });
  } catch (error) {
    console.error("Update Office Hours Error:", error);
    next(error);
  }
};

module.exports = {
  markAttendance,
  markLeave,
  getAttendanceSummary,
  getOfficeHours,
  updateOfficeHours
};
