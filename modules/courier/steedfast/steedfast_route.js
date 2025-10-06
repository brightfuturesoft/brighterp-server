const express = require('express');
const { create_courier, get_couriers, update_courier, delete_courier } = require('./steedfast_module');
const { check_user } = require('../../hooks/check_user');


const router = express.Router();

router.post('/create-steedfast', check_user, create_courier);
router.get('/get-steedfast', check_user, get_couriers);
router.patch('/update-steedfast', check_user, update_courier);
router.delete('/delete-steedfast', check_user, delete_courier);

module.exports = router;