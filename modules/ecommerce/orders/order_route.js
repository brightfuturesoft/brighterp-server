const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_order, get_order, update_order, delete_order } = require('./order_module');
const router = express.Router();

router.post('/create-order', check_user, create_order);
router.get('/get-order', check_user, get_order);
router.put('/update-order', check_user, update_order);
router.patch('/delete-order', check_user, delete_order);

module.exports = router;
