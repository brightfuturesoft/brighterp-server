const { ObjectId } = require("mongodb");
const { user_collection } = require("../../../collection/collections/auth");

// Create collections for roles and permissions
const { client } = require("../../../collection/uri");
const roles_collection = client.db('users').collection("roles");
const permissions_collection = client.db('users').collection("permissions");

// Define available permissions based on frontend routes and frontend guard keys
// Keys are symbolic permission domains used by the frontend guard (e.g., items:view)
const DEFAULT_PERMISSIONS = {
  // Dashboard
  dashboard: {
    name: "Dashboard",
    keys: ["dashboard:view"],
    routes: ["business"]
  },
  
  // Accounting
  accounting: {
    name: "Accounting",
    routes: [
      "accounting",
      "accounting/chart_of_account",
      "accounting/chart_of_account/add_journals",
      "accounting/chart_of_account/journals_details",
      "accounting/chart_of_account/journals",
      "accounting/chart_of_account/expenses",
      "accounting/chart_of_account/income"
    ]
  },
  
  // Customer Management
  customer: {
    name: "Customer Management",
    keys: ["customer:view"],
    routes: [
      "customer",
      "customer/customer-type",
      "customer/customer-edit",
      "customer/customer-details",
      "customer/customer-details/ledger"
    ]
  },
  
  // Item Management
  items: {
    name: "Item Management",
    keys: ["items:view", "items:create", "items:update"],
    routes: [
      "item",
      "item/category",
      "item/items",
      "item/items/create_item",
      "item/items/edit_item",
      "item/manufacturer",
      "item/brand",
      "item/color",
      "item/size_type",
      "item/attribute_set"
    ]
  },
  
  // Sales
  sales: {
    name: "Sales",
    keys: ["sales:view"],
    routes: [
      "sale",
      "sale/direct-sale",
      "sale/quotation",
      "sale/order",
      "sale/delivery",
      "sale/invoice",
      "sale/return",
      "sale/batch-payment",
      "sale/payment",
      "sale/customer-debit",
      "sale/refund"
    ]
  },
  
  // HR Module
  hr: {
    name: "Human Resources",
    keys: ["hr:view"],
    routes: [
      "hr-module",
      "hr-module/stock-adjustment",
      "hr-module/stock-movement",
      "hr-module/receivable-stock",
      "hr-module/warehouse-access"
    ]
  },
  
  // POS
  pos: {
    name: "Point of Sale",
    keys: ["pos:view"],
    routes: [
      "pos",
      "pos/outlet",
      "pos/counter",
      "pos/outlet-sessions",
      "pos/counter-sessions",
      "pos/orders",
      "pos/return",
      "pos/barcode",
      "pos/outlet-access"
    ]
  },
  
  // E-commerce
  ecommerce: {
    name: "E-commerce",
    keys: ["ecommerce:view"],
    routes: [
      "e-commerce",
      "e-commerce/orders",
      "e-commerce/settings",
      "e-commerce/promotions",
      "e-commerce/customers",
      "e-commerce/customers-wishlist",
      "e-commerce/banners",
      "e-commerce/blogs",
      "e-commerce/contact-us",
      "e-commerce/newsletter",
      "e-commerce/policy",
      "e-commerce/topics",
      "e-commerce/partnership-brands",
      "e-commerce/achievements",
      "e-commerce/testimonials",
      "e-commerce/reviews",
      "e-commerce/integrations",
      "e-commerce/general-seo",
      "e-commerce/questions",
      "e-commerce/custom-sections"
    ]
  },
  
  // Inventory
  inventory: {
    name: "Inventory Management",
    keys: ["inventory:view"],
    routes: [
      "inventory",
      "inventory/stock-adjustment",
      "inventory/stock-movement",
      "inventory/receivable-stock",
      "inventory/warehouse-access"
    ]
  },
  
  // Settings
  settings: {
    name: "Settings",
    keys: ["settings:view", "roles:view"],
    routes: [
      "settings/account-settings/profile-info",
      "settings/account-settings/change-password",
      "settings/account-settings/security",
      "settings/general/language",
      "settings/general/timezones",
      "settings/general/currency",
      "settings/company-settings/company-info",
      "settings/company-settings/domain-url",
      "settings/company-settings/branding",
      "settings/company-settings/locations",
      "settings/company-settings/domain"
    ]
  },

  // Support
  support: {
    name: "Support",
    keys: ["support:view"],
    routes: [
      "support",
      "support/ticket",
      "support/knowledge-base",
      "support/faq"
    ]
  },

  // Reports
  report: {
    name: "Reports",
    keys: ["report:view"],
    routes: [
      "report"
    ]
  }
};

// Initialize default permissions
const initializePermissions = async () => {
  try {
    const existingPermissions = await permissions_collection.findOne({});
    if (!existingPermissions) {
      await permissions_collection.insertOne({
        _id: new ObjectId(),
        permissions: DEFAULT_PERMISSIONS,
        created_at: new Date(),
        updated_at: new Date()
      });
    } else {
      // Merge in any missing default groups without overwriting existing customizations
      const merged = { ...DEFAULT_PERMISSIONS, ...(existingPermissions.permissions || {}) };
      await permissions_collection.updateOne(
        { _id: existingPermissions._id },
        { $set: { permissions: merged, updated_at: new Date() } }
      );
    }
  } catch (error) {
    console.error("Error initializing permissions:", error);
  }
};

// Create a new role
const createRole = async (roleData) => {
  try {
    const { name, description, permissions, created_by, workspace_id } = roleData;

    if (!workspace_id) {
      return { success: false, message: "Workspace ID is required" };
    }

    // Check if role name already exists within the same workspace
    const existingRole = await roles_collection.findOne({
      name: name.toLowerCase(),
      workspace_id: String(workspace_id)
    });
    if (existingRole) {
      return { success: false, message: "Role name already exists in this workspace" };
    }

    const newRole = {
      _id: new ObjectId(),
      name: name.toLowerCase(),
      display_name: name,
      description: description || "",
      permissions: permissions || [],
      status: "active",
      workspace_id: String(workspace_id),
      created_by: new ObjectId(created_by),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await roles_collection.insertOne(newRole);
    
    if (result.insertedId) {
      return { 
        success: true, 
        message: "Role created successfully", 
        role_id: result.insertedId,
        role: newRole
      };
    } else {
      return { success: false, message: "Failed to create role" };
    }
  } catch (error) {
    console.error("Error creating role:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Get all roles
const getAllRoles = async (filters = {}) => {
  try {
    const query = {};

    if (filters.workspace_id) {
      query.workspace_id = String(filters.workspace_id);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { display_name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    const roles = await roles_collection.find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    // Get creator information for each role
    const rolesWithCreator = await Promise.all(
      roles.map(async (role) => {
        const creator = await user_collection.findOne(
          { _id: role.created_by },
          { projection: { name: 1, email: 1 } }
        );
        
        return {
          ...role,
          creator: creator || { name: "Unknown", email: "unknown@example.com" }
        };
      })
    );
    
    return { success: true, roles: rolesWithCreator };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Get role by ID
const getRoleById = async (roleId) => {
  try {
    const role = await roles_collection.findOne({ _id: new ObjectId(roleId) });
    
    if (!role) {
      return { success: false, message: "Role not found" };
    }
    
    // Get creator information
    const creator = await user_collection.findOne(
      { _id: role.created_by },
      { projection: { name: 1, email: 1 } }
    );
    
    return { 
      success: true, 
      role: {
        ...role,
        creator: creator || { name: "Unknown", email: "unknown@example.com" }
      }
    };
  } catch (error) {
    console.error("Error fetching role:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Update role
const updateRole = async (roleId, updateData) => {
  try {
    const { name, description, permissions, updated_by, workspace_id } = updateData;

    if (!workspace_id) {
      return { success: false, message: "Workspace ID is required" };
    }

    // Check if role exists and belongs to the workspace
    const existingRole = await roles_collection.findOne({
      _id: new ObjectId(roleId),
      workspace_id: String(workspace_id)
    });
    if (!existingRole) {
      return { success: false, message: "Role not found or does not belong to this workspace" };
    }
    
    // Check if new name conflicts with existing roles (excluding current role)
    if (name && name.toLowerCase() !== existingRole.name) {
      const nameConflict = await roles_collection.findOne({ 
        name: name.toLowerCase(),
        _id: { $ne: new ObjectId(roleId) }
      });
      if (nameConflict) {
        return { success: false, message: "Role name already exists" };
      }
    }
    
    const updateFields = {
      updated_at: new Date(),
      updated_by: new ObjectId(updated_by)
    };
    
    if (name) {
      updateFields.name = name.toLowerCase();
      updateFields.display_name = name;
    }
    if (description !== undefined) updateFields.description = description;
    if (permissions) updateFields.permissions = permissions;
    
    const result = await roles_collection.updateOne(
      { _id: new ObjectId(roleId) },
      { $set: updateFields }
    );
    
    if (result.modifiedCount > 0) {
      const updatedRole = await roles_collection.findOne({ _id: new ObjectId(roleId) });
      return { 
        success: true, 
        message: "Role updated successfully",
        role: updatedRole
      };
    } else {
      return { success: false, message: "No changes made to role" };
    }
  } catch (error) {
    console.error("Error updating role:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Delete role
const deleteRole = async (roleId, workspace_id) => {
  try {
    if (!workspace_id) {
      return { success: false, message: "Workspace ID is required" };
    }

    // Check if role exists and belongs to the workspace
    const existingRole = await roles_collection.findOne({
      _id: new ObjectId(roleId),
      workspace_id: String(workspace_id)
    });
    if (!existingRole) {
      return { success: false, message: "Role not found or does not belong to this workspace" };
    }
    
    // Check if role is assigned to any users
    const usersWithRole = await user_collection.countDocuments({ role_id: new ObjectId(roleId) });
    if (usersWithRole > 0) {
      return { 
        success: false, 
        message: `Cannot delete role. It is assigned to ${usersWithRole} user(s)` 
      };
    }
    
    const result = await roles_collection.deleteOne({ _id: new ObjectId(roleId) });
    
    if (result.deletedCount > 0) {
      return { success: true, message: "Role deleted successfully" };
    } else {
      return { success: false, message: "Failed to delete role" };
    }
  } catch (error) {
    console.error("Error deleting role:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Toggle role status
const toggleRoleStatus = async (roleId, updated_by) => {
  try {
    const existingRole = await roles_collection.findOne({ _id: new ObjectId(roleId) });
    if (!existingRole) {
      return { success: false, message: "Role not found" };
    }
    
    const newStatus = existingRole.status === "active" ? "inactive" : "active";
    
    const result = await roles_collection.updateOne(
      { _id: new ObjectId(roleId) },
      { 
        $set: { 
          status: newStatus,
          updated_at: new Date(),
          updated_by: new ObjectId(updated_by)
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      return { 
        success: true, 
        message: `Role ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        status: newStatus
      };
    } else {
      return { success: false, message: "Failed to update role status" };
    }
  } catch (error) {
    console.error("Error toggling role status:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Get available permissions
const getAvailablePermissions = async () => {
  try {
    const permissionsDoc = await permissions_collection.findOne({});
    const permissions = permissionsDoc ? permissionsDoc.permissions : DEFAULT_PERMISSIONS;
    
    return { success: true, permissions };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Assign role to user
const assignRoleToUser = async (userId, roleId, assigned_by) => {
  try {
    // Check if user exists
    const user = await user_collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    
    // Check if role exists and is active
    const role = await roles_collection.findOne({ 
      _id: new ObjectId(roleId),
      status: "active"
    });
    if (!role) {
      return { success: false, message: "Role not found or inactive" };
    }
    
    const result = await user_collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role_id: new ObjectId(roleId),
          role_assigned_at: new Date(),
          role_assigned_by: new ObjectId(assigned_by),
          updated_at: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      return { 
        success: true, 
        message: "Role assigned successfully",
        user_id: userId,
        role_id: roleId
      };
    } else {
      return { success: false, message: "Failed to assign role" };
    }
  } catch (error) {
    console.error("Error assigning role:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Remove role from user
const removeRoleFromUser = async (userId, removed_by) => {
  try {
    const result = await user_collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $unset: { 
          role_id: "",
          role_assigned_at: "",
          role_assigned_by: ""
        },
        $set: {
          updated_at: new Date(),
          role_removed_by: new ObjectId(removed_by),
          role_removed_at: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      return { success: true, message: "Role removed successfully" };
    } else {
      return { success: false, message: "Failed to remove role" };
    }
  } catch (error) {
    console.error("Error removing role:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Get users with roles
const getUsersWithRoles = async (filters = {}) => {
  try {
    const pipeline = [
      // Optional filter by specific user id
      ...(filters.user_id ? [{ $match: { _id: new ObjectId(filters.user_id) } }] : []),
      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "_id",
          as: "role"
        }
      },
      {
        $addFields: {
          role: { $arrayElemAt: ["$role", 0] }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          status: 1,
          workspace_id: 1,
          role: {
            _id: 1,
            display_name: 1,
            name: 1,
            status: 1,
            permissions: 1
          },
          role_assigned_at: 1,
          created_at: 1
        }
      }
    ];

    if (filters.role_id) {
      pipeline.unshift({
        $match: { role_id: new ObjectId(filters.role_id) }
      });
    }

    if (filters.workspace_id) {
      pipeline.unshift({
        $match: { workspace_id: String(filters.workspace_id) }
      });
    }

    if (filters.search) {
      pipeline.unshift({
        $match: {
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } }
          ]
        }
      });
    }

    const users = await user_collection.aggregate(pipeline).toArray();

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Check user permissions
const checkUserPermissions = async (userId, requiredPermission) => {
  try {
    const user = await user_collection.findOne({ _id: new ObjectId(userId) });
    if (!user || !user.role_id) {
      return { success: false, hasPermission: false, message: "User has no role assigned" };
    }
    
    const role = await roles_collection.findOne({ 
      _id: user.role_id,
      status: "active"
    });
    
    if (!role) {
      return { success: false, hasPermission: false, message: "User role not found or inactive" };
    }
    
    // Permission can be an explicit key (e.g., items:view) or implied by route domain
    let hasPermission = false;
    if (Array.isArray(role.permissions)) {
      // Normalize: accept group names without :view and synonyms
      const rq = String(requiredPermission);
      const rqBase = rq.split(':')[0];
      const synonyms = new Set([
        rqBase,
        `${rqBase}:view`,
        rqBase === 'items' ? 'item' : '',
        rqBase === 'item' ? 'items' : '',
        rqBase === 'sales' ? 'sale' : '',
        rqBase === 'sale' ? 'sales' : '',
        rqBase === 'ecommerce' ? 'e-commerce' : '',
        rqBase === 'e-commerce' ? 'ecommerce' : '',
      ].filter(Boolean));

      hasPermission = role.permissions.some(p => synonyms.has(String(p).split(':')[0]) || synonyms.has(String(p)));
      if (!hasPermission) {
        // Fallbacks for legacy/stored formats
        const entry = Object.entries(DEFAULT_PERMISSIONS).find(([, g]) => Array.isArray(g.keys) && g.keys.includes(requiredPermission));
        if (entry) {
          const [groupKey, group] = entry;
          const synonyms = new Set([
            groupKey,
            groupKey === 'items' ? 'item' : '',
            groupKey === 'sales' ? 'sale' : '',
            groupKey === 'ecommerce' ? 'e-commerce' : '',
          ].filter(Boolean));

          // 1) Any exact key from group
          hasPermission = group.keys.some((k) => role.permissions.includes(k));
          // 2) Any synonym group name
          if (!hasPermission) for (const s of synonyms) { if (role.permissions.includes(s)) { hasPermission = true; break; } }
          // 3) Any route in group's routes
          if (!hasPermission && Array.isArray(group.routes)) {
            hasPermission = group.routes.some((r) => role.permissions.includes(r));
          }
          // 4) Wildcards for any synonym
          if (!hasPermission) {
            for (const s of synonyms) { if (role.permissions.includes(`${s}:*`)) { hasPermission = true; break; } }
          }
        }
      }
    }
    
    return { 
      success: true, 
      hasPermission,
      role: role.display_name,
      permissions: role.permissions
    };
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Get role statistics
const getRoleStatistics = async () => {
  try {
    const totalRoles = await roles_collection.countDocuments({});
    const activeRoles = await roles_collection.countDocuments({ status: "active" });
    const inactiveRoles = await roles_collection.countDocuments({ status: "inactive" });
    
    const usersWithRoles = await user_collection.countDocuments({ role_id: { $exists: true } });
    const usersWithoutRoles = await user_collection.countDocuments({ role_id: { $exists: false } });
    
    // Get role usage statistics
    const roleUsage = await user_collection.aggregate([
      {
        $match: { role_id: { $exists: true } }
      },
      {
        $group: {
          _id: "$role_id",
          userCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "roles",
          localField: "_id",
          foreignField: "_id",
          as: "role"
        }
      },
      {
        $addFields: {
          role: { $arrayElemAt: ["$role", 0] }
        }
      },
      {
        $project: {
          roleName: "$role.display_name",
          userCount: 1
        }
      },
      {
        $sort: { userCount: -1 }
      }
    ]).toArray();
    
    return {
      success: true,
      statistics: {
        roles: {
          total: totalRoles,
          active: activeRoles,
          inactive: inactiveRoles
        },
        users: {
          withRoles: usersWithRoles,
          withoutRoles: usersWithoutRoles,
          total: usersWithRoles + usersWithoutRoles
        },
        roleUsage
      }
    };
  } catch (error) {
    console.error("Error fetching role statistics:", error);
    return { success: false, message: "Internal server error" };
  }
};

// Initialize permissions on module load
initializePermissions();

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  getAvailablePermissions,
  assignRoleToUser,
  removeRoleFromUser,
  getUsersWithRoles,
  checkUserPermissions,
  getRoleStatistics,
  DEFAULT_PERMISSIONS
};

// ---------------- Express Handlers (router-level) ----------------

const permissions = async (req, res) => {
  try {
    const result = await getAvailablePermissions();
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Permissions fetched successfully', data: result.permissions });
    }
    return res.status(500).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in GET /permissions:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const create_role = async (req, res) => {
  try {
    const { name, description, permissions, created_by, workspace_id } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Role name is required' });
    if (!created_by) return res.status(400).json({ success: false, message: 'Creator ID is required' });
    if (!workspace_id) return res.status(400).json({ success: false, message: 'Workspace ID is required' });
    if (!Array.isArray(permissions)) return res.status(400).json({ success: false, message: 'Permissions must be an array' });
    const result = await createRole({ name: name.trim(), description: description?.trim() || '', permissions, created_by, workspace_id });
    if (result.success) {
      return res.status(201).json({ success: true, message: result.message, data: { role_id: result.role_id, role: result.role } });
    }
    return res.status(400).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in POST /roles:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const get_roles = async (req, res) => {
  try {
    const { status, search, workspace_id } = req.query;
    const filters = {};
    if (workspace_id) filters.workspace_id = workspace_id;
    if (status) filters.status = status;
    if (search) filters.search = search.trim();
    const result = await getAllRoles(filters);
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Roles fetched successfully', data: result.roles, count: result.roles.length });
    }
    return res.status(500).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in GET /roles:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const get_role_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getRoleById(id);
    if (result.success) return res.status(200).json({ success: true, message: 'Role fetched successfully', data: result.role });
    return res.status(404).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in GET /roles/:id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const update_role = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, updated_by, workspace_id } = req.body || {};
    if (!updated_by) return res.status(400).json({ success: false, message: 'Updater ID is required' });
    if (!workspace_id) return res.status(400).json({ success: false, message: 'Workspace ID is required' });
    const updateData = { updated_by, workspace_id };
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (Array.isArray(permissions)) updateData.permissions = permissions;
    const result = await updateRole(id, updateData);
    if (result.success) return res.status(200).json({ success: true, message: result.message, data: result.role });
    return res.status(400).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in PUT /roles/:id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const delete_role = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteRole(id);
    if (result.success) return res.status(200).json({ success: true, message: result.message });
    return res.status(400).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in DELETE /roles/:id:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const toggle_role_status = async (req, res) => {
  try {
    const { id } = req.params;
    const { updated_by } = req.body || {};
    if (!updated_by) return res.status(400).json({ success: false, message: 'Updater ID is required' });
    const result = await toggleRoleStatus(id, updated_by);
    if (result.success) return res.status(200).json({ success: true, message: result.message, data: { status: result.status } });
    return res.status(400).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in PATCH /roles/:id/toggle-status:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const assign_role = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role_id, assigned_by } = req.body || {};
    if (!role_id) return res.status(400).json({ success: false, message: 'Role ID is required' });
    if (!assigned_by) return res.status(400).json({ success: false, message: 'Assigner ID is required' });
    const { ObjectId } = require('mongodb');
    if (!ObjectId.isValid(role_id)) return res.status(400).json({ success: false, message: 'Invalid role ID format' });
    if (!ObjectId.isValid(assigned_by)) return res.status(400).json({ success: false, message: 'Invalid assigned_by ID format' });
    const result = await assignRoleToUser(userId, role_id, assigned_by);
    if (result.success) return res.status(200).json({ success: true, message: result.message, data: { user_id: result.user_id, role_id: result.role_id } });
    return res.status(400).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in POST /users/:userId/assign-role:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const remove_role = async (req, res) => {
  try {
    const { userId } = req.params;
    const { removed_by } = req.body || {};
    if (!removed_by) return res.status(400).json({ success: false, message: 'Remover ID is required' });
    const result = await removeRoleFromUser(userId, removed_by);
    if (result.success) return res.status(200).json({ success: true, message: result.message });
    return res.status(400).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in DELETE /users/:userId/remove-role:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const users_with_roles = async (req, res) => {
  try {
    const { role_id, search, user_id, workspace_id } = req.query;
    const filters = {};
    if (role_id) filters.role_id = role_id;
    if (search) filters.search = search.trim();
    if (user_id) filters.user_id = user_id;
    if (workspace_id) filters.workspace_id = workspace_id;
    const result = await getUsersWithRoles(filters);
    if (result.success) return res.status(200).json({ success: true, message: 'Users with roles fetched successfully', data: result.users, count: result.users.length });
    return res.status(500).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in GET /users-with-roles:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const check_user_permissions = async (req, res) => {
  try {
    const { userId, permission } = req.params;
    const result = await checkUserPermissions(userId, permission);
    if (result.success) return res.status(200).json({ success: true, message: 'Permission check completed', data: { hasPermission: result.hasPermission, role: result.role, permissions: result.permissions } });
    return res.status(400).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in GET /users/:userId/permissions/:permission:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const statistics = async (req, res) => {
  try {
    const result = await getRoleStatistics();
    if (result.success) return res.status(200).json({ success: true, message: 'Statistics fetched successfully', data: result.statistics });
    return res.status(500).json({ success: false, message: result.message });
  } catch (error) {
    console.error('Error in GET /statistics:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const bulk_assign_roles = async (req, res) => {
  try {
    const { user_ids, role_id, assigned_by } = req.body || {};
    if (!Array.isArray(user_ids) || user_ids.length === 0) return res.status(400).json({ success: false, message: 'User IDs array is required' });
    if (!role_id) return res.status(400).json({ success: false, message: 'Role ID is required' });
    if (!assigned_by) return res.status(400).json({ success: false, message: 'Assigner ID is required' });
    const { ObjectId } = require('mongodb');
    if (!ObjectId.isValid(role_id)) return res.status(400).json({ success: false, message: 'Invalid role ID format' });
    if (!ObjectId.isValid(assigned_by)) return res.status(400).json({ success: false, message: 'Invalid assigned_by ID format' });
    const results = []; const errors = [];
    for (const userId of user_ids) {
      try {
        if (!ObjectId.isValid(userId)) { errors.push({ user_id: userId, error: 'Invalid user ID format' }); continue; }
        const result = await assignRoleToUser(userId, role_id, assigned_by);
        if (result.success) results.push({ user_id: userId, success: true });
        else errors.push({ user_id: userId, error: result.message });
      } catch (err) { errors.push({ user_id: userId, error: err.message }); }
    }
    return res.status(200).json({ success: true, message: `Bulk assignment completed. ${results.length} successful, ${errors.length} failed.`, data: { successful: results, failed: errors, summary: { total: user_ids.length, successful: results.length, failed: errors.length } } });
  } catch (error) {
    console.error('Error in POST /bulk-assign-roles:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ---------------- Users (migrated from user_module) ----------------
const create_user = async (req, res) => {
  try {
    const { name, email, phone, password, created_by, workspace_id } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }

    const existing = await user_collection.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    const doc = {
      _id: new ObjectId(),
      name,
      email: String(email).toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      status: 'active',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      workspace_id: workspace_id ? String(workspace_id) : undefined,
    };

    if (created_by && ObjectId.isValid(created_by)) {
      doc.created_by = new ObjectId(created_by);
    }

    const result = await user_collection.insertOne(doc);
    if (result.insertedId) {
      return res.status(201).json({ success: true, message: 'User created successfully', data: doc });
    }
    return res.status(400).json({ success: false, message: 'Failed to create user' });
  } catch (error) {
    console.error('Error in create_user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const list_users = async (req, res) => {
  try {
    const { search, workspace_id } = req.query;
    const query = {};
    if (workspace_id) query.workspace_id = String(workspace_id);
    if (search) {
      query.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
        { phone: { $regex: String(search), $options: 'i' } },
      ];
    }
    const users = await user_collection
      .find(query, { projection: { password: 0 } })
      .sort({ created_at: -1 })
      .toArray();
    return res.status(200).json({ success: true, message: 'Users fetched', data: users, count: users.length });
  } catch (error) {
    console.error('Error in list_users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.handlers = {
  permissions,
  create_role,
  get_roles,
  get_role_by_id,
  update_role,
  delete_role,
  toggle_role_status,
  assign_role,
  remove_role,
  users_with_roles,
  check_user_permissions,
  statistics,
  bulk_assign_roles,
  create_user,
  list_users,
};