const { client } = require("../../uri");


const item_collection = client.db('items').collection("item");
const category_collection = client.db('items').collection("category");
const brand_collection = client.db('items').collection("brand");
const color_collection = client.db('items').collection("color");
const size_collection = client.db('items').collection("size");
const attribute_collection = client.db('items').collection("attribute");
const manufacturer_collection = client.db('items').collection("manufacturer");


module.exports = { item_collection, category_collection, brand_collection, color_collection, size_collection, attribute_collection, manufacturer_collection };
