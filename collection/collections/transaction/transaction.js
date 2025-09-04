const { client } = require("../../uri");

const journal_collection=client.db('transaction').collection('journal');

module.exports={journal_collection};
