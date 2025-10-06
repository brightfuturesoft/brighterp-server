const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");
const { redx_couriers_collection } = require("../../../collection/collections/courier/courier");

// GET Redx Couriers
const get_redx_couriers = async (req, res, next) => {
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

    const couriers = await redx_couriers_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: couriers,
      message: "Redx couriers fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Redx Courier
const create_redx_courier = async (req, res, next) => {
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
    const user_name = await workspace_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.created_by = user_name?.name || "Unknown";

    const result = await redx_couriers_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Redx courier created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE Redx Courier
const update_redx_courier = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    // Check workspace exists
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

    // Validate required fields if needed
    const { base_url, apiKey, apiSecret } = input_data;
    if (!base_url || !apiKey || !apiSecret) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Base URL, API Key, and API Secret are required",
      });
    }

    // Prepare updated data
    let updated_data = enrichData({ base_url, apiKey, apiSecret });
    updated_data.workspace_id = workspace_id;

    const user_name = await workspace_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.updated_by = user_name?.name || "Unknown";

    // Upsert: update if id exists else insert by workspace_id
    const filter = input_data.id ? { _id: new ObjectId(input_data.id) } : { workspace_id };

    const result = await redx_couriers_collection.updateOne(
      filter,
      { $set: updated_data },
      { upsert: true }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Redx courier updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Redx Courier (soft delete)
const delete_redx_courier = async (req, res, next) => {
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
    updated_data.delete = true;
    const user_name = await workspace_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.updated_by = user_name?.name || "Unknown";

    delete updated_data._id;

    const result = await redx_couriers_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Redx courier deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get_redx_couriers,
  create_redx_courier,
  update_redx_courier,
  delete_redx_courier,
};
