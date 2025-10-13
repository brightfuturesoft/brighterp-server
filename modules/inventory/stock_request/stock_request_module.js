const { ObjectId } = require("mongodb");
const { response_sender } = require("../../hooks/respose_sender");
const { stock_request_collection } = require("../../../collection/collections/stock_request");
const { workspace_collection, user_collection } = require("../../../collection/collections/auth");

// Get stock requests
const getStockRequests = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    // Fetch stock requests
    const requests = await stock_request_collection.find({
      workspace_id: workspace_id,
      delete: { $ne: true }
    }).toArray();

    // Get unique IDs for joins
    const userIds = [...new Set(requests.map(request => request.created_by))];

    // Fetch related data
    const users = await user_collection.find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }).toArray();

    // Create maps for quick lookup
    const userMap = users.reduce((map, user) => { map[user._id.toString()] = user.email; return map; }, {});

    // Format requests
    const formattedRequests = requests.map(request => ({
      _id: request._id,
      image: request.image || "",
      order: request.order || "",
      status: request.status || "",
      deliveryStatus: request.deliveryStatus || "",
      note: request.note || "",
      quantity: request.quantity || 0,
      seller: userMap[request.created_by] || "Unknown",
      requestTime: request.requestTime || new Date().toString(),
    }));

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: formattedRequests,
      message: "Stock requests fetched successfully."
    });
  } catch (error) {
    next(error);
  }
};

// Create stock request
const createStockRequest = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const user_id = req.headers.user_id;
    const { image, order, status, deliveryStatus, note, quantity, seller } = req.body;

    const newRequest = {
      workspace_id,
      created_by: user_id,
      image,
      order,
      status,
      deliveryStatus,
      note,
      quantity,
      seller,
      requestTime: new Date().toString(),
      delete: false,
      created_at: new Date(),
    };

    const result = await stock_request_collection.insertOne(newRequest);

    return response_sender({
      res,
      status_code: 201,
      error: false,
      data: { _id: result.insertedId },
      message: "Stock request created successfully."
    });
  } catch (error) {
    next(error);
  }
};

// Update stock request
const updateStockRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await stock_request_collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        message: "Stock request not found."
      });
    }

    return response_sender({
      res,
      status_code: 200,
      error: false,
      message: "Stock request updated successfully."
    });
  } catch (error) {
    next(error);
  }
};

// Delete stock request
const deleteStockRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await stock_request_collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { delete: true, deleted_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        message: "Stock request not found."
      });
    }

    return response_sender({
      res,
      status_code: 200,
      error: false,
      message: "Stock request deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockRequests,
  createStockRequest,
  updateStockRequest,
  deleteStockRequest,
};
