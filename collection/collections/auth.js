const { client } = require("../uri");

const user_collection = client.db('users').collection("user");
const workspace_collection = client.db('users').collection("workspace");
const password_backup = client.db('backup').collection('password')


module.exports = { user_collection, workspace_collection, password_backup };
