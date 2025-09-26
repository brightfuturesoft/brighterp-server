const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const {
  workspace_collection,
} = require("../../../collection/collections/auth");
const {
  orders_collection,
} = require("../../../collection/collections/direct_pos/direct_post");

// GET Orders
const get_orders = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const check_workspace = await workspace_collection.findOne({
      _id: new ObjectId(workspace_id),
    });
    if (!check_workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Workspace not found",
      });
    }

    const orders = await orders_collection
      .find({ workspace_id, delete: { $ne: true } })
      .toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: orders,
      message: "Orders fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

//Get Return order
const get_return_orders = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const check_workspace = await workspace_collection.findOne({
      _id: new ObjectId(workspace_id),
    });
    if (!check_workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Workspace not found",
      });
    }

    const orders = await orders_collection
      .find({ workspace_id, delete: { $ne: true }, status:"Return"})
      .toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: orders,
      message: "Orders fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

//Get Refund order
const get_refund_orders = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const check_workspace = await workspace_collection.findOne({
      _id: new ObjectId(workspace_id),
    });
    if (!check_workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Workspace not found",
      });
    }

    const orders = await orders_collection
      .find({ workspace_id, delete: { $ne: true }, status:"Refund"})
      .toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: orders,
      message: "Orders fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Order
const create_order = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;
    const check_workspace = await workspace_collection.findOne({
      _id: new ObjectId(workspace_id),
    });
    if (!check_workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Workspace not found",
      });
    }
    const prefix = (check_workspace?.name || "ORDER")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const lastOrder = await orders_collection
      .find({ workspace_id, delete:false })
      .sort({ createdAt: -1 }) 
      .limit(1)
      .toArray();

    let nextNumber;
    if (lastOrder.length === 0 || !lastOrder[0].order_number) {
      nextNumber = 1;
    } else {
      const parts = lastOrder[0].order_number.split("_");
      const lastNumber = parseInt(parts[parts.length - 1]);
      nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }
    const order_number = `${prefix}_${String(nextNumber).padStart(4, "0")}`;
    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;
    updated_data.order_number = order_number;
    updated_data.createdAt = new Date();
    const user_name = await workspace_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user_name?.name || "Unknown";
    const result = await orders_collection.insertOne(updated_data);
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: { ...result, order_number },
      message: "Order created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE Order
const update_order = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    const check_workspace = await workspace_collection.findOne({
      _id: new ObjectId(workspace_id),
    });
    if (!check_workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Workspace not found",
      });
    }

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user_name = await workspace_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user_name?.name || "Unknown";

    const result = await orders_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Order updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Order (soft delete)
const delete_order = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    const check_workspace = await workspace_collection.findOne({
      _id: new ObjectId(workspace_id),
    });
    if (!check_workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Workspace not found",
      });
    }

    let updated_data = enrichData(input_data);
    updated_data.delete = true;

    const user_name = await workspace_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user_name?.name || "Unknown";

    delete updated_data._id;

    const result = await orders_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get_orders,
  create_order,
  update_order,
  delete_order,
  get_return_orders,
  get_refund_orders
};
