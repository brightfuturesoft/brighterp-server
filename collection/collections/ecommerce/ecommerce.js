const { client } = require("../../uri");


const order_collection = client.db('ecommerce').collection("orders");


module.exports = { order_collection};
