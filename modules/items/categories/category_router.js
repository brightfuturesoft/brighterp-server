const express = require('express');
const router = express.Router();

const { create_category, get_category, update_category, delete_category, delete_many_category, import_category } = require('./category_module');
const { check_user } = require('../../hooks/check_user');


router.get('/get-category', check_user, get_category);
router.post('/create-category', check_user, create_category);
router.post('/import-category', check_user, import_category);
router.put('/update-category', check_user, update_category);
router.patch('/delete-category', check_user, delete_category);
router.delete('/delete-many', check_user, delete_many_category);

module.exports = router;
