const express = require("express");
const { check_admin } = require("../Admin_hooks/Check_permission");
const { get_all_store } = require("./Manage_shop_module");
const router = express.Router();

router.get("/get-all-shop", check_admin, get_all_store);


module.exports = router;
