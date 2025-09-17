const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { 
  create_testimonial, 
  get_testimonials, 
  update_testimonial, 
  delete_testimonial 
} = require('./testimonials_module');

const router = express.Router();

router.post('/create-testimonial', check_user, create_testimonial);
router.get('/get-testimonials', check_user, get_testimonials);
router.patch('/update-testimonial', check_user, update_testimonial);
router.delete('/delete-testimonial', check_user, delete_testimonial);

module.exports = router;
