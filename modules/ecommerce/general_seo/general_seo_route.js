const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_seo, get_seo, update_seo, delete_seo } = require('./general_seo_module');


const router = express.Router();

router.post('/create-seo', check_user, create_seo);
router.get('/get-seo', check_user, get_seo);
router.patch('/update-seo', check_user, update_seo);
router.delete('/delete-seo', check_user, delete_seo);

module.exports = router;
