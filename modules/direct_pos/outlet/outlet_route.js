const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_outlet, get_outlets, update_outlet, delete_outlet } = require('./outlets_module');

const router = express.Router();

router.post('/create-outlet', check_user, create_outlet);
router.get('/get-outlets', check_user, get_outlets);
router.patch('/update-outlet', check_user, update_outlet);
router.delete('/delete-outlet', check_user, delete_outlet);

module.exports = router;
