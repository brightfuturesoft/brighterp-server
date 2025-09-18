const express = require('express');
const { check_user } = require('../../hooks/check_user');
const { create_achievement, get_achievements, update_achievement, delete_achievement } = require('./achivements_module');
// const { 
//   create_achievement, 
//   get_achievements, 
//   update_achievement, 
//   delete_achievement 
// } = require('./achievements_module');

const router = express.Router();

router.post('/create-achievement', check_user, create_achievement);
router.get('/get-achievements', check_user, get_achievements);
router.patch('/update-achievement', check_user, update_achievement);
router.delete('/delete-achievement', check_user, delete_achievement);

module.exports = router;
