const express = require('express');
const { create_a_workspace } = require('./sign_up/sign_up');
const { sign_in, sign_out } = require('./sign_in/sign_in');
const router = express.Router();


router.post('/sign-up', create_a_workspace);
router.post('/sign-in', sign_in);
router.post('/sign-out', sign_out);

module.exports = router;
