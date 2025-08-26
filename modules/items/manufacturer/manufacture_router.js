const express = require('express');
const router = express.Router();

const { check_user } = require('../../hooks/check_user');
const { create_manufacture, get_manufacture, update_manufacture, delete_manufacture } = require('./manufacture_module');


router.get('/get-manufacture', check_user, get_manufacture);
router.post('/create-manufacture', check_user, create_manufacture);
router.put('/update-manufacture', check_user, update_manufacture);
router.patch('/delete-manufacture', check_user, delete_manufacture);



module.exports = router;
