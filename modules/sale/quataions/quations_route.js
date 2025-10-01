const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_question, get_questions, update_question, delete_question } = require('./quations_module');


const router = express.Router();

router.post('/create-question', check_user, create_question);
router.get('/get-questions', check_user, get_questions);
router.patch('/update-question', check_user, update_question);
router.delete('/delete-question', check_user, delete_question);

module.exports = router;
