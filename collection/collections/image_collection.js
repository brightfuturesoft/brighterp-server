const { client } = require("../uri");

const image_collection = client.db('storage').collection("images");


module.exports = { image_collection };
