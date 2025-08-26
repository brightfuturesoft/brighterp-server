const express = require('express');
const router = express.Router();
const { check_user } = require('../../hooks/check_user');
const { create_attribute, get_attribute, update_attribute, delete_attribute } = require('./attribute_module');



router.post('/create-attribute', check_user, create_attribute);
router.get('/get-attribute', check_user, get_attribute);
router.put('/update-attribute', check_user, update_attribute);
router.patch('/delete-attribute', check_user, delete_attribute);




module.exports = router;
