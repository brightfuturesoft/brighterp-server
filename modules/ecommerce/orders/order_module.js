const { ObjectId } = require("mongodb");
const { order_collection } = require("../../../collection/collections/ecommerce/ecommerce");
const { workspace_collection } = require("../../../collection/collections/auth");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");


// GET Orders
const get_order = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const check_workspace = await workspace_collection.findOne({ _id: new ObjectId(workspace_id) });
    if (!check_workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Workspace not found",
      });
    }
    const orders = await order_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
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
    const check_workspace = await workspace_collection.findOne({ _id: new ObjectId(workspace_id) });
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
    const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.created_by = user_name?.name || "Unknown";
    const result = await order_collection.insertOne(updated_data);
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
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
    const check_workspace = await workspace_collection.findOne({ _id: new ObjectId(workspace_id) });
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
    const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.updated_by = user_name?.name || "Unknown";
    const result = await order_collection.updateOne(
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
    const check_workspace = await workspace_collection.findOne({ _id: new ObjectId(workspace_id) });
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
    const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.updated_by = user_name?.name || "Unknown";
    delete updated_data._id;
    updated_data.delete = true;
    const result = await order_collection.updateOne(
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


module.exports = { create_order, get_order, update_order, delete_order };
