const express = require('express');
const router = express.Router();

const { check_user } = require('../../hooks/check_user');
const { create_item, get_item, update_item, delete_item } = require('./item_module');           



router.post('/create-item', check_user, create_item);
router.get('/get-item', check_user, get_item);
router.patch('/update-item', check_user, update_item);
router.delete('/delete-item', check_user, delete_item);



module.exports = router;
