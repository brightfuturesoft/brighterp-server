const { client } = require("../../uri");

const order_collection = client.db('ecommerce').collection("orders");
const customers_collection = client.db('ecommerce').collection("users");
const carts_collection = client.db('ecommerce').collection("cartOrders");
const banners_collection = client.db('ecommerce').collection("banner");
const contact_collection = client.db('ecommerce').collection("contact");
const blog_collection = client.db('ecommerce').collection("blog");

module.exports = { order_collection, customers_collection,carts_collection,banners_collection, contact_collection, blog_collection};
