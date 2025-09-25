const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_brand, get_brands, update_brand, delete_brand } = require('./partnership_brands_module');


const router = express.Router();
router.post('/create-brand', check_user, create_brand);
router.get('/get-brands', check_user, get_brands);
router.patch('/update-brand', check_user, update_brand);
router.delete('/delete-brand', check_user, delete_brand);

module.exports = router;
