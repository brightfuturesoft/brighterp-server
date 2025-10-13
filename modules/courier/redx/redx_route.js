const express = require('express');
const { check_user } = require('../../hooks/check_user');
const {
  create_redx_courier,
  get_redx_couriers,
  update_redx_courier,
  delete_redx_courier
} = require('./redx_module');


const router = express.Router();

router.post('/create-redx', check_user, create_redx_courier);
router.get('/get-redx', check_user, get_redx_couriers);
router.patch('/update-redx', check_user, update_redx_courier);
router.delete('/delete-redx', check_user, delete_redx_courier);

module.exports = router;
