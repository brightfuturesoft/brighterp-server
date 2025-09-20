const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { 
  create_newsletter, 
  get_newsletters, 
  update_newsletter, 
  delete_newsletter 
} = require('./newsletter_module');

const router = express.Router()
router.post('/create-newsletter', check_user, create_newsletter);
router.get('/get-newsletters', check_user, get_newsletters);
router.patch('/update-newsletter', check_user, update_newsletter);
router.delete('/delete-newsletter', check_user, delete_newsletter);

module.exports = router;
