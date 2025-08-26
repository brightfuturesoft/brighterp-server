const express = require('express');
const router = express.Router();

const { create_color, get_color, update_color, delete_color } = require('./color_module');
const { check_user } = require('../../hooks/check_user');



router.post('/create-color', check_user, create_color);
router.get('/get-color', check_user, get_color);
router.put('/update-color', check_user, update_color);
router.delete('/delete-color', check_user, delete_color);


module.exports = router;
