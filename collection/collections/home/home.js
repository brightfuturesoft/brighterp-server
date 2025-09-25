const { client } = require("../../uri");

const newsletter_collection = client.db('home').collection("newsletter");
const contact_collection = client.db('home').collection("contact");



module.exports = {newsletter_collection,contact_collection};
