const express = require('express');
const { 
  create_pathao_courier, 
  get_pathao_couriers, 
  update_pathao_courier, 
  delete_pathao_courier 
} = require('./pathao_module'); // Pathao module file
const { check_user } = require('../../hooks/check_user');

const router = express.Router();

// Pathao Courier Routes
router.post('/create-pathao', check_user, create_pathao_courier);
router.get('/get-pathao', check_user, get_pathao_couriers);
router.patch('/update-pathao', check_user, update_pathao_courier);
router.delete('/delete-pathao', check_user, delete_pathao_courier);

module.exports = router;
