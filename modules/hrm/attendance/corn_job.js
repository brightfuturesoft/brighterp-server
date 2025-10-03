// attendance_cron.js
const cron = require("node-cron");
const path = require("path");
const { ObjectId } = require("mongodb");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Get collections
const collectionsPath = path.resolve(__dirname, "../../../collection/collections/hrm/employees");
let collections;
try {
  collections = require(collectionsPath);
} catch (err) {
  console.error("Failed to require collections module at", collectionsPath, err);
}

const attendance_collection = collections && collections.attendance_collection;
const employees_collection = collections && collections.employees_collection;
const leave_collection = collections && collections.leave_collection;

if (!attendance_collection || !employees_collection || !leave_collection) {
  console.error("Attendance cron job disabled: one or more collections are missing.");
  console.error("Exports found from module:", Object.keys(collections || {}));
  // Don't schedule cron if collections missing
  return;
}

// Get office hours collection
const getOfficeHoursCollection = () => {
  const { client } = require("../../../uri");
  return client.db('hrm').collection('office_hours');
};

// Get all unique workspace configurations
const getAllWorkspaceConfigs = async () => {
  const officeHoursCollection = getOfficeHoursCollection();
  const configs = await officeHoursCollection.find({}).toArray();

  // Get all unique workspace IDs from employees
  const workspaces = await employees_collection.distinct("workspace_id");

  const workspaceConfigs = {};

  // Set default hours for workspaces without config
  for (const workspace_id of workspaces) {
    const config = configs.find(c => c.workspace_id === workspace_id);
    workspaceConfigs[workspace_id] = config?.hours || {
      startHour: 15, // 3:00 PM default
      startMinute: 0,
      endHour: 22,   // 10:00 PM default
      endMinute: 0
    };
  }

  return workspaceConfigs;
};

// --- Dynamic attendance marking based on workspace office hours ---
// Run every 10 minutes to check all workspaces
cron.schedule("*/10 * * * *", async () => {
  try {


    const now = dayjs.tz("Asia/Dhaka");
    const today = now.startOf("day").toDate();

    // Get all workspace configurations
    const workspaceConfigs = await getAllWorkspaceConfigs();

    for (const [workspace_id, officeHours] of Object.entries(workspaceConfigs)) {
      const { startHour, startMinute } = officeHours;

      // Check if current time is 10-20 minutes after office start for this workspace
      const officeStart = dayjs.tz("Asia/Dhaka")
        .hour(startHour)
        .minute(startMinute)
        .second(0);
      const windowStart = officeStart.add(10, 'minute');
      const windowEnd = officeStart.add(20, 'minute');

      if (now.isAfter(windowStart) && now.isBefore(windowEnd)) {

        // Fetch employees for this workspace
        const employees = await employees_collection
          .find({ workspace_id })
          .toArray();

        for (const emp of employees) {
          const existingRecord = await attendance_collection.findOne({
            employeeId: emp._id,
            date: today,
          });

          // If no record exists, mark as Absent
          if (!existingRecord) {
            await attendance_collection.insertOne({
              employeeId: emp._id,
              workspace_id: emp.workspace_id,
              date: today,
              status: "Absent",
              markedBy: "system",
              checkInTime: null,
              createdAt: new Date(),
            });

          }
        }
      }
    }


  } catch (error) {
next(error)
  }
});

// --- Leave processing: Check approved leaves once daily ---
cron.schedule("0 1 * * *", async () => {
  try {


    const now = dayjs.tz("Asia/Dhaka");
    const today = now.startOf("day").toDate();

    // Fetch all approved leaves that cover today
    const leavesToday = await leave_collection
      .find({
        startDate: { $lte: today },
        endDate: { $gte: today },
        status: "Approved",
      })
      .toArray();

    if (!Array.isArray(leavesToday)) {
      console.error("Leave fetch did not return an array:", leavesToday);
      return;
    }

    for (const leave of leavesToday) {
      const existingRecord = await attendance_collection.findOne({
        employeeId: leave.employeeId,
        date: today,
      });

      if (existingRecord) {
        // Update existing record to Leave
        await attendance_collection.updateOne(
          { _id: existingRecord._id },
          {
            $set: {
              status: "Leave",
              markedBy: "system",
              updatedAt: new Date()
            }
          }
        );
      } else {
        // Create new record if none exists
        await attendance_collection.insertOne({
          employeeId: leave.employeeId,
          workspace_id: leave.workspace_id || null,
          date: today,
          status: "Leave",
          markedBy: "system",
          checkInTime: null,
          createdAt: new Date(),
        });
      }
    }


  } catch (error) {
    next(error)
  }
});

// --- Monthly attendance report generation (optional) ---
cron.schedule("0 0 1 * *", async () => {
  try {


    const now = dayjs.tz("Asia/Dhaka");
    const lastMonth = now.subtract(1, 'month');
    const startOfLastMonth = lastMonth.startOf('month').toDate();
    const endOfLastMonth = lastMonth.endOf('month').toDate();

    // Get all employees
    const employees = await employees_collection.find({}).toArray();

    for (const employee of employees) {
      const attendanceRecords = await attendance_collection
        .find({
          employeeId: employee._id,
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        })
        .toArray();

      const presentDays = attendanceRecords.filter(r => r.status === "Present").length;
      const leaveDays = attendanceRecords.filter(r => r.status === "Leave").length;
      const absentDays = attendanceRecords.filter(r => r.status === "Absent").length;


    }


  } catch (error) {
    next(error)
  }
});

