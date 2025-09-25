const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_theme, get_theme, update_theme, delete_theme } = require('./theme_module');
const router = express.Router();

router.post('/create-theme', check_user, create_theme);
router.get('/get-theme', check_user, get_theme);
router.patch('/update-theme', check_user, update_theme);
router.delete('/delete-theme', check_user, delete_theme);

module.exports = router;
