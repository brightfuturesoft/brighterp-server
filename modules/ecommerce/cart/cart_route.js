const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { 
  create_cart_item, 
  get_cart, 
  update_cart_item, 
  delete_cart_item 
} = require('./cart_module');

const router = express.Router();
router.post('/create-cart-item', check_user, create_cart_item);
router.get('/get-cart', check_user, get_cart);
router.patch('/update-cart-item', check_user, update_cart_item);
router.delete('/delete-cart-item', check_user, delete_cart_item);

module.exports = router;
