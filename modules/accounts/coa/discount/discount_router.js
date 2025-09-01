const express = require('express');
const router = express.Router();
const { create_discount, get_discounts, update_discount } = require('./discount_module');
const { check_user } = require('../../../hooks/check_user');

// Routes for discount Accounts
router.post('/create-discount', check_user, create_discount);
router.get('/get-discount', check_user, get_discounts);
router.put('/update-discount', check_user, update_discount);


module.exports = router;
