const express = require('express');
const router = express.Router();

const { check_user } = require('../../hooks/check_user');
const {
    create_employee,
    get_employees,
    get_employee,
    update_employee,
    delete_employee,
} = require('./employees_module');

// Routes
router.post('/create-employee', check_user, create_employee);
router.get('/get-employees', check_user, get_employees);
router.get('/get/:id', check_user, get_employee);
router.put('/update-employee', check_user, update_employee);
router.patch('/delete-employee', check_user, delete_employee);

module.exports = router;
