const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_order, get_orders, update_order, delete_order, get_return_orders, get_refund_orders } = require('./order_module');

const router = express.Router();

router.post('/create-order', check_user, create_order);
router.get('/get-orders', check_user, get_orders);
router.get('/get-return-orders', check_user, get_return_orders);
router.get('/get-refund-orders', check_user, get_refund_orders);
router.patch('/update-order', check_user, update_order);
router.delete('/delete-order', check_user, delete_order);

module.exports = router;
