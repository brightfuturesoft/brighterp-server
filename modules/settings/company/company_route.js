const express = require('express');
const router = express.Router();

const { update_company, get_company_by_domain } = require('./company_module');
const { check_user } = require('../../hooks/check_user');


router.get('/get-company-by-domain', get_company_by_domain);
router.patch('/update-company', check_user, update_company);





module.exports = router;
