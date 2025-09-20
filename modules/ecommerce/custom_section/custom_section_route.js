const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_custom_section, get_custom_section, update_custom_section, delete_custom_section } = require('./custom_section_module');


const router = express.Router();

router.post('/create-section', check_user, create_custom_section);
router.get('/get-section', check_user, get_custom_section);
router.patch('/update-section', check_user, update_custom_section);
router.delete('/delete-section', check_user, delete_custom_section);

module.exports = router;
