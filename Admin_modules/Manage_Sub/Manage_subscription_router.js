const express = require("express");
const { check_admin } = require("../Admin_hooks/Check_permission");
const { create_subscription, get_all_subscription } = require("./Manage_subscription");
const router = express.Router();

router.get("/get-all", get_all_subscription);
router.post("/create-subscription", check_admin, create_subscription);


module.exports = router;
