const express = require('express');
const router = express.Router();
const expenses_router = require('./expenses/expenses_route');
const { expense_collection, discount_collection, op_expense_collection,Payment_Processing_collection, Payroll_Expense_collection, Uncategorized_Expense_collection, foreign_table_collection, income_table_collection, other_income_table_collection, owner_contribution_collection, retained_earnings_collection, credit_card_collection, prepayments_credits_collection,due_payroll_collection, loan_credit_collection, short_liability_collection, sales_tax_collection, bank_collection, cash_collection, current_assets_collection, depreciation_collection, inventory_collection, mobile_bank_collection, money_transit_collection, long_term_asset_collection, short_term_asset_collection, income_discount_collection, income_uncategorized_Expense_collection } = require('../../../collection/collections/coa/coa');
const expenses_module = require('../coa/expenses/expenses_module');

//  modules with collection and entity name
const modules = [
  { path: '/expense', collection: expense_collection, name: 'expense' },
  { path: '/discount', collection: discount_collection, name: 'discount' },
  { path: '/operating-expense', collection: op_expense_collection, name: 'operating-expense' },
  {path:'/payment-processing', collection: Payment_Processing_collection, name: 'payment-processing'},
  {path:'/payroll-expense', collection: Payroll_Expense_collection, name: 'payroll-expense'},
  {path:'/uncategorized-expense', collection: Uncategorized_Expense_collection, name: 'uncategorized-expense'},
  
  
  //income page route
  {path:'/income-discount',collection:income_discount_collection, name:'income-discount'},
 {path:'/foreign', collection: foreign_table_collection, name:'foreign'},
  {path:'/income', collection: income_table_collection, name: 'income'},
  {path:'/other-income', collection: other_income_table_collection, name: 'other-income'},
  {path:'/income-uncategorized-expense', collection: income_uncategorized_Expense_collection, name: 'income-uncategorized-expense'},
  
  //owner equity route
  {path:'/Business-Owner-Contribution-and-Drawing', collection: owner_contribution_collection, name: 'Business-Owner-Contribution-and-Drawing'},
  {path:'/retained-earnings', collection: retained_earnings_collection, name: 'retained-earnings'},
  
  //liability route
  {path:'/credit-card', collection: credit_card_collection, name: 'credit-card'},
  {path:'/customer-prepayments-and-customer-credits', collection: prepayments_credits_collection, name: 'customer-prepayments-and-customer-credits'},
  {path:'/due-for-payroll', collection: due_payroll_collection, name: 'due-for-payroll'},
  {path:'/Loan-and-Line-of-Credit', collection: loan_credit_collection, name: 'Loan-and-Line-of-Credit'},
  {path:'/Other-Short-Term-Liability', collection: short_liability_collection, name: 'Other-Short-Term-Liability'},
  {path:'/sales-taxes', collection: sales_tax_collection, name: 'sales-taxes'},
  
  //assets
  {path:'/bank', collection: bank_collection, name: 'bank'},
  {path:'/cash', collection: cash_collection, name: 'cash'},
  {path:'/current-assets', collection: current_assets_collection, name: 'current-assets'},
  {path:'/depreciation', collection: depreciation_collection, name: 'depreciation'},
  {path:'/inventory', collection: inventory_collection, name: 'inventory'},
  {path:'/mobile-bank', collection: mobile_bank_collection, name: 'mobile-bank'},
   {path:'/money-transit', collection: money_transit_collection, name: 'money-transit'},
  {path:'/longterm-asset', collection: long_term_asset_collection, name: 'longterm-asset'},
    {path:'/shortterm-asset', collection: short_term_asset_collection, name: 'shortterm-asset'},
  
  
  
];

// Create dynamic routers and attach them
modules.forEach(mod => {
  const crudController = expenses_module(mod.collection, mod.name);
  const modRouter = expenses_router(mod.name, crudController);
  router.use(mod.path, modRouter);
});

module.exports = router;
