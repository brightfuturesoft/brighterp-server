const { client } = require("../../uri");

const counters_collection = client.db("counter").collection("transactionId");

module.exports = {
  counters_collection,
};
