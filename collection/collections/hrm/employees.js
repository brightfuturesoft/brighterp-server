const { client } = require("../../uri");


const employees_collection=client.db('hrm').collection('employees')

module.exports={employees_collection};