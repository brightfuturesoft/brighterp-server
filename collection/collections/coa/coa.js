const { client } = require("../../uri");


const expense_collection=client.db('coa').collection("expense");
const discount_collection=client.db('coa').collection("discount");
const op_expense_collection=client.db('coa').collection("operating-expense");
const Payment_Processing_collection=client.db('coa').collection("payment-processing")
const Payroll_Expense_collection=client.db('coa').collection("payroll-expense")
const Uncategorized_Expense_collection=client.db('coa').collection("uncategorized-expense")

//income page database
const foreign_table_collection=client.db('coa').collection('foreign-table')
const income_table_collection=client.db('coa').collection('income-table')
const other_income_table_collection=client.db('coa').collection('other-income-table')

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





module.exports = { expense_collection, discount_collection, op_expense_collection,Payment_Processing_collection, Payroll_Expense_collection, Uncategorized_Expense_collection, foreign_table_collection, income_table_collection, other_income_table_collection, owner_contribution_collection, retained_earnings_collection, credit_card_collection, prepayments_credits_collection,due_payroll_collection, loan_credit_collection, short_liability_collection, sales_tax_collection };
