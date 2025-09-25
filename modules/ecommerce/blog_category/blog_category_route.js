const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_blog_category, get_blog_categories, update_blog_category, delete_blog_category } = require('./blog_category_module');


const router = express.Router();
router.post('/create-blog-category', check_user, create_blog_category);
router.get('/get-blog-categories', check_user, get_blog_categories);
router.patch('/update-blog-category', check_user, update_blog_category);
router.delete('/delete-blog-category', check_user, delete_blog_category);

module.exports = router;
