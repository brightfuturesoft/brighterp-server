const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_coupon, get_coupons, update_coupon, delete_coupon } = require('./coupon_module');



const router = express.Router();
router.post('/create-coupon', check_user, create_coupon);
router.get('/get-coupons', check_user, get_coupons);
router.patch('/update-coupon', check_user, update_coupon);
router.delete('/delete-coupon', check_user, delete_coupon);

module.exports = router;
