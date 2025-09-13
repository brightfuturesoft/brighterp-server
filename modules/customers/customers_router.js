const express = require('express');
const { create_customer, get_pos_customer, update_customer } = require('./customers_module');
const { check_user } = require('../hooks/check_user');
const router = express.Router();


router.post("/create-customer", check_user, create_customer);
router.patch("/update-customer", check_user, update_customer)
router.get("/get-pos-customers", check_user, get_pos_customer);


module.exports = router;
