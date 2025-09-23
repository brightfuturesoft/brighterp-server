const { client } = require("../../uri");


const subscription_collection = client.db('erp-core').collection('subscription')

module.exports = { subscription_collection };
