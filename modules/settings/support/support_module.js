const SupportTicket = require('../../../collection/collections/support_ticket');
const { ObjectId } = require('mongodb');
const { response_sender } = require('../../../modules/hooks/respose_sender');

// Create a new support ticket
const createSupportTicket = async (req, res) => {
  try {
    const { department, subject, description, assigned_users, workspace_id, created_by } = req.body;

    // Validate required fields
    if (!department || !subject || !description || !assigned_users || assigned_users.length === 0 || !workspace_id || !created_by) {
      return response_sender({ res, status_code: 400, error: false, message: 'All fields are required and at least one user must be assigned' });
    }

    // Validate department
    const validDepartments = ['Technical Support', 'Billing', 'Account Management', 'General Inquiry', 'Bug Report', 'Feature Request'];
    if (!validDepartments.includes(department)) {
      return response_sender({ res, status_code: 400, error: false, message: 'Invalid department' });
    }

    // Create the ticket document
    const ticketDoc = {
      _id: new ObjectId(),
      department,
      subject,
      description,
      assigned_users: assigned_users.map(id => new ObjectId(id)),
      created_by: new ObjectId(created_by),
      workspace_id: new ObjectId(workspace_id),
      status: 'open',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await SupportTicket.insertOne(ticketDoc);

    if (result.insertedId) {
      // Fetch the created ticket
      const ticket = await SupportTicket.findOne({ _id: result.insertedId });

      response_sender({ res, status_code: 201, error: false, message: 'Support ticket created successfully', data: ticket });
    } else {
      response_sender({ res, status_code: 500, error: false, message: 'Failed to create support ticket' });
    }
  } catch (error) {
    console.error('Error creating support ticket:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error creating support ticket', data: null });
  }
};

// Get all support tickets for a workspace
const getSupportTickets = async (req, res) => {
  try {
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }
    const { status, department, assigned_user, page = 1, limit = 10 } = req.query;

    // Build match object
    const match = { workspace_id: new ObjectId(workspace_id) };
    if (status) match.status = status;
    if (department) match.department = department;
    if (assigned_user) match.assigned_users = { $in: [new ObjectId(assigned_user)] };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Aggregation pipeline
    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'user',
          localField: 'assigned_users',
          foreignField: '_id',
          as: 'assigned_users'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      {
        $addFields: {
          created_by: { $arrayElemAt: ['$created_by_user', 0] }
        }
      },
      {
        $project: {
          created_by_user: 0
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    // Get tickets with pagination
    const tickets = await SupportTicket.aggregate(pipeline).toArray();

    // Get total count for pagination
    const total = await SupportTicket.countDocuments(match);

    const result = {
      tickets,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_tickets: total,
        per_page: parseInt(limit)
      }
    };

    response_sender({ res, status_code: 200, error: false, message: 'Support tickets retrieved successfully', data: result });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error fetching support tickets', data: null });
  }
};

// Get a single support ticket by ID
const getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }

    const pipeline = [
      { $match: { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) } },
      {
        $lookup: {
          from: 'user',
          localField: 'assigned_users',
          foreignField: '_id',
          as: 'assigned_users'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      {
        $addFields: {
          created_by: { $arrayElemAt: ['$created_by_user', 0] }
        }
      },
      {
        $project: {
          created_by_user: 0
        }
      }
    ];

    const ticket = await SupportTicket.aggregate(pipeline).toArray();

    if (!ticket || ticket.length === 0) {
      return response_sender({ res, status_code: 404, error: false, message: 'Support ticket not found' });
    }

    response_sender({ res, status_code: 200, error: false, message: 'Support ticket retrieved successfully', data: ticket[0] });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error fetching support ticket', data: null });
  }
};

// Update support ticket status
const updateSupportTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }

    const validStatuses = ['open', 'in_progress', 'closed'];
    if (!validStatuses.includes(status)) {
      return response_sender({ res, status_code: 400, error: false, message: 'Invalid status' });
    }

    const updateData = {
      status,
      updated_at: new Date()
    };
    if (status === 'closed') {
      updateData.closed_at = new Date();
    }

    const result = await SupportTicket.updateOne(
      { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return response_sender({ res, status_code: 404, error: false, message: 'Support ticket not found' });
    }

    // Fetch updated ticket with population
    const pipeline = [
      { $match: { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) } },
      {
        $lookup: {
          from: 'user',
          localField: 'assigned_users',
          foreignField: '_id',
          as: 'assigned_users'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      {
        $addFields: {
          created_by: { $arrayElemAt: ['$created_by_user', 0] }
        }
      },
      {
        $project: {
          created_by_user: 0
        }
      }
    ];

    const ticket = await SupportTicket.aggregate(pipeline).toArray();

    response_sender({ res, status_code: 200, error: false, message: 'Support ticket status updated successfully', data: ticket[0] });
  } catch (error) {
    console.error('Error updating support ticket status:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error updating support ticket status', data: null });
  }
};

// Add comment to support ticket
const addSupportTicketComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_internal = false, user_id } = req.body;
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }
    if (!user_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'User ID is required' });
    }

    if (!message || !message.trim()) {
      return response_sender({ res, status_code: 400, error: false, message: 'Comment message is required' });
    }

    const comment = {
      user_id: new ObjectId(user_id),
      message: message.trim(),
      is_internal,
      created_at: new Date()
    };

    const result = await SupportTicket.updateOne(
      { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) },
      { $push: { comments: comment }, $set: { updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return response_sender({ res, status_code: 404, error: false, message: 'Support ticket not found' });
    }

    // Fetch updated ticket with population
    const pipeline = [
      { $match: { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) } },
      {
        $lookup: {
          from: 'user',
          localField: 'assigned_users',
          foreignField: '_id',
          as: 'assigned_users'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'comments.user_id',
          foreignField: '_id',
          as: 'comments_users'
        }
      },
      {
        $addFields: {
          created_by: { $arrayElemAt: ['$created_by_user', 0] },
          comments: {
            $map: {
              input: '$comments',
              as: 'comment',
              in: {
                $mergeObjects: [
                  '$$comment',
                  {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$comments_users',
                            cond: { $eq: ['$$this._id', '$$comment.user_id'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          created_by_user: 0,
          comments_users: 0
        }
      }
    ];

    const ticket = await SupportTicket.aggregate(pipeline).toArray();

    response_sender({ res, status_code: 200, error: false, message: 'Comment added successfully', data: ticket[0] });
  } catch (error) {
    console.error('Error adding comment to support ticket:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error adding comment to support ticket', data: null });
  }
};

// Update support ticket department
const updateSupportTicketDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }

    const validDepartments = ['Technical Support', 'Billing', 'Account Management', 'General Inquiry', 'Bug Report', 'Feature Request'];
    if (!validDepartments.includes(department)) {
      return response_sender({ res, status_code: 400, error: false, message: 'Invalid department' });
    }

    const updateData = {
      department,
      updated_at: new Date()
    };

    const result = await SupportTicket.updateOne(
      { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return response_sender({ res, status_code: 404, error: false, message: 'Support ticket not found' });
    }

    // Fetch updated ticket with population
    const pipeline = [
      { $match: { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) } },
      {
        $lookup: {
          from: 'user',
          localField: 'assigned_users',
          foreignField: '_id',
          as: 'assigned_users'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      {
        $addFields: {
          created_by: { $arrayElemAt: ['$created_by_user', 0] }
        }
      },
      {
        $project: {
          created_by_user: 0
        }
      }
    ];

    const ticket = await SupportTicket.aggregate(pipeline).toArray();

    response_sender({ res, status_code: 200, error: false, message: 'Support ticket department updated successfully', data: ticket[0] });
  } catch (error) {
    console.error('Error updating support ticket department:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error updating support ticket department', data: null });
  }
};

// Get support ticket statistics
const getSupportTicketStats = async (req, res) => {
  try {
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }

    const stats = await SupportTicket.aggregate([
      { $match: { workspace_id: new ObjectId(workspace_id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      open: 0,
      in_progress: 0,
      closed: 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    response_sender({ res, status_code: 200, error: true, message: 'Support ticket statistics retrieved successfully', data: formattedStats });
  } catch (error) {
    console.error('Error fetching support ticket statistics:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error fetching support ticket statistics', data: null });
  }
};

// Delete support ticket
const deleteSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }

    const result = await SupportTicket.deleteOne(
      { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) }
    );

    if (result.deletedCount === 0) {
      return response_sender({ res, status_code: 404, error: false, message: 'Support ticket not found' });
    }

    response_sender({ res, status_code: 200, error: false, message: 'Support ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error deleting support ticket', data: null });
  }
};

// Update support ticket (full update)
const updateSupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, subject, description, assigned_users, status } = req.body;
    const workspace_id = req.query.workspace_id;
    if (!workspace_id) {
      return response_sender({ res, status_code: 400, error: false, message: 'Workspace ID is required' });
    }

    // Validate required fields
    if (!department || !subject || !description || !assigned_users || assigned_users.length === 0) {
      return response_sender({ res, status_code: 400, error: false, message: 'All fields are required and at least one user must be assigned' });
    }

    // Validate department
    const validDepartments = ['Technical Support', 'Billing', 'Account Management', 'General Inquiry', 'Bug Report', 'Feature Request'];
    if (!validDepartments.includes(department)) {
      return response_sender({ res, status_code: 400, error: false, message: 'Invalid department' });
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return response_sender({ res, status_code: 400, error: false, message: 'Invalid status' });
    }

    const updateData = {
      department,
      subject,
      description,
      assigned_users: assigned_users.map(id => new ObjectId(id)),
      updated_at: new Date()
    };

    if (status) {
      updateData.status = status;
      if (status === 'closed') {
        updateData.closed_at = new Date();
      }
    }

    const result = await SupportTicket.updateOne(
      { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return response_sender({ res, status_code: 404, error: false, message: 'Support ticket not found' });
    }

    // Fetch updated ticket with population
    const pipeline = [
      { $match: { _id: new ObjectId(id), workspace_id: new ObjectId(workspace_id) } },
      {
        $lookup: {
          from: 'user',
          localField: 'assigned_users',
          foreignField: '_id',
          as: 'assigned_users'
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      {
        $addFields: {
          created_by: { $arrayElemAt: ['$created_by_user', 0] }
        }
      },
      {
        $project: {
          created_by_user: 0
        }
      }
    ];

    const ticket = await SupportTicket.aggregate(pipeline).toArray();

    response_sender({ res, status_code: 200, error: false, message: 'Support ticket updated successfully', data: ticket[0] });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    response_sender({ res, status_code: 500, error: false, message: 'Error updating support ticket', data: null });
  }
};

module.exports = {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicketStatus,
  updateSupportTicketDepartment,
  addSupportTicketComment,
  getSupportTicketStats,
  deleteSupportTicket,
  updateSupportTicket
};
