const { client } = require("../../uri");

const steedfast_couriers_collection = client.db('courier').collection("steedfast");
const pathao_couriers_collection = client.db('courier').collection("pathao");
const redx_couriers_collection = client.db('courier').collection("redx");
const paperfly_couriers_collection = client.db('courier').collection("paperfly");

module.exports = {steedfast_couriers_collection, pathao_couriers_collection, redx_couriers_collection,paperfly_couriers_collection};
