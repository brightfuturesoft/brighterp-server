const { client } = require("../../uri");

const steedfast_couriers_collection = client.db('courier').collection("steedfast");
const pathao_couriers_collection = client.db('courier').collection("pathao");

module.exports = {steedfast_couriers_collection, pathao_couriers_collection};
