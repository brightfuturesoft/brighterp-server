const { client } = require("../../uri");

const workspace_customers_collection = client.db("workspace_customers").collection("customers");


module.exports = {
      workspace_customers_collection,
};
