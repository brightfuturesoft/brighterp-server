const { client } = require("../../uri");

const direct_sales_collection = client.db('sale').collection("direct_sale");
const questions_collection = client.db('sale').collection("questions");

module.exports = {direct_sales_collection, questions_collection};
