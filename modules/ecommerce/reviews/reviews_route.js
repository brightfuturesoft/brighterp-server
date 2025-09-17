const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_review, get_review, update_review, delete_review } = require('./reviews_module');
const router = express.Router();

router.post('/create-review', check_user, create_review);
router.get('/get-review', check_user, get_review);
router.patch('/update-review', check_user, update_review);
router.delete('/delete-review', check_user, delete_review);

module.exports = router;
