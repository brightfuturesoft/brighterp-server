const express = require('express');
const router = express.Router();

const { check_user } = require('../../hooks/check_user');
const { create_size, get_size, update_size, delete_size } = require('./size_module');



router.post('/create-size', check_user, create_size);
router.get('/get-size', check_user, get_size);
router.put('/update-size', check_user, update_size);
router.delete('/delete-size', check_user, delete_size);



module.exports = router;
