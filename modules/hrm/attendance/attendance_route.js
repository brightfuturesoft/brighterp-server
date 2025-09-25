const express = require("express")
const router = express.Router()
const { 
  markAttendance, 
  markLeave, 
  getAttendanceSummary,
  getOfficeHours,
  updateOfficeHours
} = require("./attendance_module")

// Middleware for authentication (assuming you have this)
const authenticateEmployee = (req, res, next) => {
  // Your authentication logic here
  // This should validate the employee token and set req.headers.authorization
  next()
}

// --- Attendance Routes ---

// Mark attendance (POST /hrm/attendance/check-in)
router.post("/check-in", authenticateEmployee, markAttendance)

// Mark leave (POST /hrm/attendance/leave)  
router.post("/leave", authenticateEmployee, markLeave)

// Get attendance summary (GET /hrm/attendance/summary)
router.get("/summary", authenticateEmployee, getAttendanceSummary)

// Get office hours configuration (GET /hrm/attendance/office-hours)
router.get("/office-hours", authenticateEmployee, getOfficeHours)

// Update office hours (POST /hrm/attendance/office-hours)
router.post("/office-hours", authenticateEmployee, updateOfficeHours)

// Get attendance history (GET /hrm/attendance/history)
router.get("/history", authenticateEmployee, async (req, res) => {
  try {
    const employeeId = req.headers.authorization
    const workspace_id = req.headers.workspace_id
    const { page = 1, limit = 10, startDate, endDate } = req.query
    
    const dayjs = require("dayjs")
    const utc = require("dayjs/plugin/utc")
    const timezone = require("dayjs/plugin/timezone")
    dayjs.extend(utc)
    dayjs.extend(timezone)
    
    const { ObjectId } = require("mongodb")
    const { attendance_collection, leave_collection } = require("../../../collection/collections/hrm/employees")
    
    // Build date filter
    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter.date = {}
      if (startDate) dateFilter.date.$gte = dayjs.tz(startDate, "Asia/Dhaka").startOf("day").toDate()
      if (endDate) dateFilter.date.$lte = dayjs.tz(endDate, "Asia/Dhaka").endOf("day").toDate()
    }
    
    // Get attendance records
    const attendanceRecords = await attendance_collection
      .find({ 
        employeeId: new ObjectId(employeeId),
        workspace_id,
        ...dateFilter
      })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray()
    
    // Get leave records  
    const leaveRecords = await leave_collection
      .find({ 
        employeeId: new ObjectId(employeeId),
        workspace_id,
        status: "Leave",
        ...dateFilter
      })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray()
    
    // Combine and format records
    const allRecords = [
      ...attendanceRecords.map(record => ({
        ...record,
        type: 'attendance',
        dateFormatted: dayjs.tz(record.date, "Asia/Dhaka").format("MMM DD, YYYY"),
        checkInTimeFormatted: record.checkInTime ? dayjs.tz(record.checkInTime, "Asia/Dhaka").format("h:mm A") : null
      })),
      ...leaveRecords.map(record => ({
        ...record,
        type: 'leave',
        dateFormatted: dayjs.tz(record.date, "Asia/Dhaka").format("MMM DD, YYYY"),
        markedTimeFormatted: record.createdAt ? dayjs.tz(record.createdAt, "Asia/Dhaka").format("h:mm A") : null
      }))
    ]
    
    // Sort by date
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    res.json({
      success: true,
      data: {
        records: allRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allRecords.length
        }
      },
      message: "Attendance history retrieved successfully"
    })
    
  } catch (error) {
    console.error("Get Attendance History Error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve attendance history"
    })
  }
})

module.exports = router