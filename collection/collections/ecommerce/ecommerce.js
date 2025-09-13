const { client } = require("../../uri");

const order_collection = client.db('ecommerce').collection("orders");
const customers_collection = client.db('ecommerce').collection("users");

module.exports = { order_collection, customers_collection};
