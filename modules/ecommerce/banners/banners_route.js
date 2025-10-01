const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_banner, get_banners, update_banner, delete_banner } = require('./banners_module');


const router = express.Router();

router.post('/create-banner', check_user, create_banner);
router.get('/get-banners', check_user, get_banners);
router.patch('/update-banner', check_user, update_banner);
router.delete('/delete-banner', check_user, delete_banner);

module.exports = router;
