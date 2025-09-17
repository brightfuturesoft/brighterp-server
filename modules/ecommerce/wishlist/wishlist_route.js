const express = require('express');
const { check_user } = require('../../hooks/check_user');


const router = express.Router();

router.post('/create-wishlist', check_user, create_wishlist);
router.get('/get-wishlist', check_user, get_wishlist);
router.patch('/update-wishlist', check_user, update_wishlist);
router.delete('/delete-wishlist', check_user, delete_wishlist);

module.exports = router;
