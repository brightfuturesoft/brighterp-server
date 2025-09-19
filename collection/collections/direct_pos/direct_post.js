const { client } = require("../../uri");

const outlets_collection = client.db('direct_pos').collection("outlets");


module.exports = {outlets_collection};
