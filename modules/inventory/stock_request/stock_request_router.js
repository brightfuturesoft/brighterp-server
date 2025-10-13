const express = require('express');
const { getStockRequests, createStockRequest, updateStockRequest, deleteStockRequest } = require('./stock_request_module');

const router = express.Router();

// Get stock requests
router.get("/", getStockRequests);

// Create stock request
router.post("/", createStockRequest);

// Update stock request
router.put("/:id", updateStockRequest);

// Delete stock request
router.delete("/:id", deleteStockRequest);

module.exports = router;
