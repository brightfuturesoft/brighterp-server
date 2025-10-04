const express = require('express');
const { create_courier, get_couriers, update_courier, delete_courier } = require('./courier_module');
const { check_user } = require('../hooks/check_user');


const router = express.Router();

router.post('/create-courier', check_user, create_courier);
router.get('/get-couriers', check_user, get_couriers);
router.patch('/update-courier', check_user, update_courier);
router.delete('/delete-courier', check_user, delete_courier);

module.exports = router;
