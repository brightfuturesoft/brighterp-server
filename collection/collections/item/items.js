const { client } = require("../../uri");

const item_collection = client.db("items").collection("item");
const category_collection = client.db("items").collection("category");
const brand_collection = client.db("items").collection("brand");
const color_collection = client.db("items").collection("color");
const size_collection = client.db("items").collection("size");
const attribute_collection = client.db("items").collection("attribute");
const manufacturer_collection = client.db("items").collection("manufacturer");
const workspace_collections = client.db("items").collection("workspace_user");
const orders_collection = client.db("items").collection("orders");

module.exports = {
  item_collection,
  category_collection,
  brand_collection,
  color_collection,
  size_collection,
  attribute_collection,
  manufacturer_collection,
  workspace_collections,
  orders_collection,
};
