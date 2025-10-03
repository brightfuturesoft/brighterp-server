const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_direct_sale, get_direct_sales, update_direct_sale, delete_direct_sale, get_delivery_direct_sales } = require('./direct_sale_module');


const router = express.Router();

router.post('/create-direct-sale', check_user, create_direct_sale);
router.get('/get-direct-sales', check_user, get_direct_sales);
router.get('/get-delivery-direct-sales', check_user, get_delivery_direct_sales);
router.patch('/update-direct-sale', check_user, update_direct_sale);
router.delete('/delete-direct-sale', check_user, delete_direct_sale);

module.exports = router;
