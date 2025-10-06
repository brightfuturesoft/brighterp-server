const express = require('express');
const {
  create_paperfly_courier,
  get_paperfly_couriers,
  update_paperfly_courier,
  delete_paperfly_courier
} = require('./paperfly_module');
const { check_user } = require('../../hooks/check_user');

const router = express.Router();

router.post('/create-paperfly', check_user, create_paperfly_courier);
router.get('/get-paperfly', check_user, get_paperfly_couriers);
router.patch('/update-paperfly', check_user, update_paperfly_courier);
router.delete('/delete-paperfly', check_user, delete_paperfly_courier);

module.exports = router;
