const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_question, get_question, update_question, delete_question } = require('./questions_module');


const router = express.Router();

router.post('/create-question', check_user, create_question);
router.get('/get-question', check_user, get_question);
router.patch('/update-question', check_user, update_question);
router.delete('/delete-question', check_user, delete_question);

module.exports = router;
