const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_link_integration, get_link_integration, update_link_integration, delete_link_integration } = require('./intigration_module');


const router = express.Router();

router.post('/create-link', check_user, create_link_integration);
router.get('/get-links', check_user, get_link_integration);
router.patch('/update-link', check_user, update_link_integration);
router.delete('/delete-link', check_user, delete_link_integration);

module.exports = router;
