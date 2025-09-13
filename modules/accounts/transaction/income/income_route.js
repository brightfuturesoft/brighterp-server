const express = require('express');
const router = express.Router();

const { check_user } = require('../../../hooks/check_user');
const {
  create_income,
  get_incomes,
  get_income,
  update_income,
  delete_income
} = require('./income_module');

// Routes
router.post('/create-income', check_user, create_income);
router.get('/get-income', check_user, get_incomes);
router.get('/get-income/:id', check_user, get_income);
router.put('/update-income', check_user, update_income);
router.patch('/delete-income', check_user, delete_income);

module.exports = router;
