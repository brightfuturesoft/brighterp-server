const { client } = require("../uri");

const user_collection = client.db('users').collection("user");
const workspace_collection = client.db('users').collection("workspace");
const faq_collection = client.db('users').collection("faq");
const password_backup = client.db('backup').collection('password')
const otp_collection = client.db('backup').collection('otp')


module.exports = { user_collection, workspace_collection, faq_collection, password_backup, otp_collection };
