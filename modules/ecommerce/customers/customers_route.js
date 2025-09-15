const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_customer, get_customer, update_customer, delete_customer } = require('./customers_module');

const router = express.Router();

router.post('/create-customer', check_user, create_customer);
router.get('/get-customer', check_user, get_customer);
router.patch('/update-customer', check_user, update_customer);
router.delete('/delete-customer', check_user, delete_customer);

module.exports = router;
