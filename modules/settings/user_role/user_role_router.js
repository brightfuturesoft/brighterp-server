const express = require('express');
const router = express.Router();
const { handlers } = require('./user_role_module');

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  const { ObjectId } = require('mongodb');
  const { id, roleId, userId } = req.params;
  
  try {
    if (id && !ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    if (roleId && !ObjectId.isValid(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role ID format' });
    }
    if (userId && !ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
};

// Get available permissions
router.get('/permissions', handlers.permissions);

// Create a new role
router.post('/roles', handlers.create_role);

// Get all roles
router.get('/roles', handlers.get_roles);

// Get role by ID
router.get('/roles/:id', validateObjectId, handlers.get_role_by_id);

// Update role
router.put('/roles/:id', validateObjectId, handlers.update_role);

// Delete role
router.delete('/roles/:id', validateObjectId, handlers.delete_role);

// Toggle role status
router.patch('/roles/:id/toggle-status', validateObjectId, handlers.toggle_role_status);

// Assign role to user
router.post('/users/:userId/assign-role', validateObjectId, handlers.assign_role);

// Remove role from user
router.delete('/users/:userId/remove-role', validateObjectId, handlers.remove_role);

// Get users with roles
router.get('/users-with-roles', handlers.users_with_roles);


// Check user permissions
router.get('/users/:userId/permissions/:permission', validateObjectId, handlers.check_user_permissions);

// Get role statistics
router.get('/statistics', handlers.statistics);

// Bulk assign roles
router.post('/bulk-assign-roles', handlers.bulk_assign_roles);

// mount nested user routes under /users to match settings structure
// Users routes (migrated into this router)
router.post('/users', handlers.create_user);
router.get('/users', handlers.list_users);

module.exports = router;
