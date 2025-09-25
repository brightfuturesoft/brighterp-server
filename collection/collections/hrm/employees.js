const { client } = require("../../uri");


const employees_collection=client.db('hrm').collection('employees')
const attendance_collection=client.db('hrm').collection('attendance')
const leave_collection=client.db('hrm').collection('leave')
const office_hours_collection=client.db('hrm').collection('office-hours')

module.exports={employees_collection, attendance_collection, leave_collection, office_hours_collection};