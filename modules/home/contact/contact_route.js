const express = require('express');
const { check_user } = require('../../hooks/check_user');
const {
  create_contact,
  get_contacts,
  update_contact,
  delete_contact,
} = require('./contact_module');

const router = express.Router();

router.post('/create-contact', create_contact);
router.get('/get-contacts', check_user, get_contacts);
router.patch('/update-contact', check_user, update_contact);
router.delete('/delete-contact', check_user, delete_contact);

module.exports = router;
