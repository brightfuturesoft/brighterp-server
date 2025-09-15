const { client } = require("../../uri");

const order_collection = client.db('ecommerce').collection("orders");
const customers_collection = client.db('ecommerce').collection("users");
const carts_collection = client.db('ecommerce').collection("cartOrders");
const banners_collection = client.db('ecommerce').collection("banner");

module.exports = { order_collection, customers_collection,carts_collection,banners_collection};
