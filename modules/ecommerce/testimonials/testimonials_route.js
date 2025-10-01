const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_term, get_terms, update_term, delete_term } = require('../terms&conditions/terms_module');


const router = express.Router();

router.post('/create-term', check_user, create_term);
router.get('/get-terms', check_user, get_terms);
router.patch('/update-term', check_user, update_term);
router.delete('/delete-term', check_user, delete_term);

module.exports = router;
