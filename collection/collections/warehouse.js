const { client } = require("../uri");

const warehouse_collection = client.db('inventory').collection("warehouse");
const area_collection = client.db('inventory').collection("area");
const rack_collection = client.db('inventory').collection("rack");
const shelf_collection = client.db('inventory').collection("shelf");
const cell_collection = client.db('inventory').collection("cell");

module.exports = { warehouse_collection, area_collection, rack_collection, shelf_collection, cell_collection };
