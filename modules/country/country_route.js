const express = require('express');
const { get_countries, get_divisions } = require('./country_module');
const router = express.Router();

// Countries & Divisions
router.get("/countries", get_countries);
router.get("/divisions", get_divisions); 

module.exports = router;
