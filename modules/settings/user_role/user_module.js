const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { user_collection, workspace_collection } = require('../../../collection/collections/auth');

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

module.exports = {
 
  create_user,
  list_users,
};
