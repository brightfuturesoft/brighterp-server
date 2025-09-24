const { client } = require("../../uri");

const direct_sales_collection = client.db('sale').collection("direct_sale");

module.exports = {direct_sales_collection};
