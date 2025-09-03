const { client } = require("../../uri");


const expense_collection=client.db('coa').collection("expense");
const discount_collection=client.db('coa').collection("discount");
const op_expense_collection=client.db('coa').collection("operating-expense");
const Payment_Processing_collection=client.db('coa').collection("payment-processing")
const Payroll_Expense_collection=client.db('coa').collection("payroll-expense")
const Uncategorized_Expense_collection=client.db('coa').collection("uncategorized-expense")

//income page database
const income_discount_collection=client.db('coa').collection("income-discount");
const foreign_table_collection=client.db('coa').collection('foreign')
const income_table_collection=client.db('coa').collection('income')
const other_income_table_collection=client.db('coa').collection('other-income')
const income_uncategorized_Expense_collection=client.db('coa').collection("income-uncategorized-expense")


//owner equity database
const owner_contribution_collection=client.db('coa').collection('Business-Owner-Contribution-and-Drawing')
const retained_earnings_collection=client.db('coa').collection('retained-earnings')

//liability database
const credit_card_collection=client.db('coa').collection('credit-card')
const prepayments_credits_collection=client.db('coa').collection('customer-prepayments-and-customer-credits')
const due_payroll_collection=client.db('coa').collection('due-for-payroll')
const loan_credit_collection=client.db('coa').collection('Loan-and-Line-of-Credit')
const short_liability_collection=client.db('coa').collection('Other-Short-Term-Liability')
const sales_tax_collection=client.db('coa').collection('sales-taxes')

//assets database
const bank_collection=client.db('coa').collection('bank')
const cash_collection=client.db('coa').collection('cash')
const current_assets_collection=client.db('coa').collection('current-assets')
const depreciation_collection=client.db('coa').collection('depreciation')
const inventory_collection=client.db('coa').collection('inventory')
const mobile_bank_collection=client.db('coa').collection('mobile-bank')
const money_transit_collection=client.db('coa').collection('money-transit')
const long_term_asset_collection=client.db('coa').collection('long-term-asset')
const short_term_asset_collection=client.db('coa').collection('short-term-asset')



module.exports = { expense_collection, discount_collection, op_expense_collection,Payment_Processing_collection, Payroll_Expense_collection, Uncategorized_Expense_collection, foreign_table_collection, income_table_collection, other_income_table_collection, owner_contribution_collection, retained_earnings_collection, credit_card_collection, prepayments_credits_collection,due_payroll_collection, loan_credit_collection, short_liability_collection, sales_tax_collection, bank_collection, cash_collection, current_assets_collection, depreciation_collection, inventory_collection, mobile_bank_collection, money_transit_collection, long_term_asset_collection, short_term_asset_collection, income_discount_collection, income_uncategorized_Expense_collection };
