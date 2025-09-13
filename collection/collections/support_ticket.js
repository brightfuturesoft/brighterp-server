const { client } = require("../uri");

const support_ticket_collection = client.db('users').collection("support_ticket");

module.exports = support_ticket_collection;
