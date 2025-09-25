const { client } = require("../../uri");

const pos_orders_collection = client.db("customers_order").collection("pos_orders");
const order_counter_collection = client.db("customers_order").collection("order_counter");


module.exports = {
      pos_orders_collection,
      order_counter_collection,
};
