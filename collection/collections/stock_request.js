const { client } = require("../uri");

const stock_request_collection = client.db("inventory").collection("stock_request");

module.exports = {
  stock_request_collection,
};
