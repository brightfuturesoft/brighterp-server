const express = require('express');
const router = express.Router();
const { create_expense, get_expenses, update_expense, delete_expense } = require('./expense_module');
const { check_user } = require('../../../hooks/check_user');
// const { check_user } = require('../../../hooks/data_update');

// Routes for Expense Accounts
router.post('/create-expense', check_user, create_expense);
router.get('/get-expense', check_user, get_expenses);
router.put('/update-expense', check_user, update_expense);


module.exports = router;
