const express = require('express');
const { create_a_workspace, verify_user, check_workspace_by_unique_id } = require('./sign_up/sign_up');
const { sign_in, sign_out, me } = require('./sign_in/sign_in');

const router = express.Router();


router.post('/sign-up', create_a_workspace);
router.post('/sign-in', sign_in);
router.post('/sign-out', sign_out);
router.get('/me', me);
router.patch('/verify-account', verify_user);
router.get('/check-workspace', check_workspace_by_unique_id);

module.exports = router;
