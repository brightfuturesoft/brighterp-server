const express = require('express');
const { getStockSummary, getStockItems } = require('./stock_check_module');

const router = express.Router();

// Get stock summary
router.get("/summary", getStockSummary);

// Get stock items with optional status filter
router.get("/items", getStockItems);

module.exports = router;
