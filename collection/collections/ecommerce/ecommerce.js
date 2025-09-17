const { client } = require("../../uri");

const order_collection = client.db('ecommerce').collection("orders");
const customers_collection = client.db('ecommerce').collection("users");
const carts_collection = client.db('ecommerce').collection("cartOrders");
const banners_collection = client.db('ecommerce').collection("banner");
const contact_collection = client.db('ecommerce').collection("contact");
const blog_collection = client.db('ecommerce').collection("blog");
const blog_category_collection = client.db('ecommerce').collection("blog_category");
const coupon_collection = client.db('ecommerce').collection("coupon");
const policy_collection = client.db('ecommerce').collection("policy");
const partnership_brand_collection = client.db('ecommerce').collection("partnership_brands");
const link_integration_collection = client.db('ecommerce').collection("link_intigration");
const custom_sections_collection = client.db('ecommerce').collection("custom_section");
const promotions_collection = client.db('ecommerce').collection("promotions");
const questions_collection = client.db('ecommerce').collection("questions");
const wishlists_collection = client.db('ecommerce').collection("wishlist");
const reviews_collection = client.db('ecommerce').collection("reviews");
const achievements_collection = client.db('ecommerce').collection("achivements");

module.exports = { order_collection, customers_collection,carts_collection,banners_collection, contact_collection, blog_collection, blog_category_collection,coupon_collection,policy_collection, partnership_brand_collection,link_integration_collection, custom_sections_collection, promotions_collection, questions_collection, wishlists_collection, reviews_collection, achievements_collection};
