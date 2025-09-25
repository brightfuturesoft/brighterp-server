const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { get_promotion, create_promotion, update_promotion, delete_promotion } = require('./promotion_module');

const router = express.Router();
router.post('/create-promotion', check_user, create_promotion);
router.get('/get-promotion', check_user, get_promotion);
router.patch('/update-promotion', check_user, update_promotion);
router.delete('/delete-promotion', check_user, delete_promotion);
module.exports = router;
