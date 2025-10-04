const { client } = require("../../uri");

const workspace_couriers_collection = client.db('courier').collection("steedfast");

module.exports = {workspace_couriers_collection};
