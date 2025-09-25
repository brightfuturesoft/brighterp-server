const { client } = require("../../uri");

const outlets_collection = client.db('direct_pos').collection("outlets");
const orders_collection = client.db('direct_pos').collection("orders");


module.exports = {outlets_collection,orders_collection};
