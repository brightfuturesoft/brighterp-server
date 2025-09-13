const express = require('express');
const router = express.Router();

const { check_user } = require('../../../hooks/check_user');
const {
  create_expense,
  get_expenses,
  get_expense,
  update_expense,
  delete_expense
} = require('./expense_module');

// Routes
router.post('/create-expense', check_user, create_expense);
router.get('/get-expense', check_user, get_expenses);
router.get('/get-expense/:id', check_user, get_expense);
router.put('/update-expense', check_user, update_expense);
router.patch('/delete-expense', check_user, delete_expense);

module.exports = router;
