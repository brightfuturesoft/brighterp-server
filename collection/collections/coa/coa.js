const { client } = require("../../uri");


const expense_collection=client.db('coa').collection("expense");
const discount_collection=client.db('coa').collection("discount");

module.exports = { expense_collection, discount_collection };
