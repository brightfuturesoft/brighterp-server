const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_blog, get_blogs, update_blog, delete_blog } = require('./blogs_module');


const router = express.Router();

router.post('/create-blog', check_user, create_blog);
router.get('/get-blogs', check_user, get_blogs);
router.patch('/update-blog', check_user, update_blog);
router.delete('/delete-blog', check_user, delete_blog);

module.exports = router;
