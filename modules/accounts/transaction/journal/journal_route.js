const express = require('express');
const router = express.Router();

const { check_user } = require('../../../hooks/check_user');
const {
  create_journal,
  get_journals,
  // get_journal,
  update_journal,
  delete_journal
} = require('./journal_module');

// Routes
router.post('/create-journal', check_user, create_journal);
router.get('/get-journals', check_user, get_journals);
// router.get('/get/:id', check_user, get_journal);
router.put('/update-journal', check_user, update_journal);
router.patch('/delete-journal', check_user, delete_journal);

module.exports = router;
