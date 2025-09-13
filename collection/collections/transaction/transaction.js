const { client } = require("../../uri");

const journal_collection=client.db('transaction').collection('journal');
const expense_collection=client.db('transaction').collection('expense');
const income_collection=client.db('transaction').collection('income')

module.exports={journal_collection, expense_collection, income_collection};
