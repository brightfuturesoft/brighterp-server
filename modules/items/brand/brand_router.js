const express = require('express');
const router = express.Router();

const { create_brand, get_brand, update_brand, delete_brand } = require('./brand_module');
const { check_user } = require('../../hooks/check_user');



router.post('/create-brand', check_user, create_brand);
router.get('/get-brand', check_user, get_brand);
router.put('/update-brand', check_user, update_brand);
router.patch('/delete-brand', check_user, delete_brand);



module.exports = router;
