const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_policy, get_policies, update_policy, delete_policy } = require('./policy_module');

const router = express.Router();

// Policy CRUD routes
router.post('/create-policy', check_user, create_policy);
router.get('/get-policies', check_user, get_policies);
router.patch('/update-policy', check_user, update_policy);
router.delete('/delete-policy', check_user, delete_policy);

module.exports = router;
