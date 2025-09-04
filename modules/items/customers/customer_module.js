const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const {
  workspace_user,
  user_collection,
  workspace_collection,
} = require("../../../collection/collections/auth");
const {
  workspace_collections,
} = require("../../../collection/collections/item/items");

/**
 * Get Customers
 */
const get_customers = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    const check_workspace = await workspace_collection?.findOne({
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

    const customers = await workspace_collections
      ?.find({ workspace_id, delete: { $ne: true } })
      .toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: customers,
      message: "Customers fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Customer
 */
const create_customer = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;
    // console.log(workspace_id);

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

    // Prevent duplicate by phone/email inside same workspace
    const existing_customer = await workspace_collections.findOne({
      $or: [{ phone: input_data.phone }, { email: input_data.email }],
      workspace_id,
      delete: { $ne: true },
    });

    if (existing_customer) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Customer already exists.",
      });
    }

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user_name?.name || "System";

    const result = await workspace_collections?.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Customer created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Customer
 */
const update_customer = async (req, res, next) => {
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

    // Check for duplicate phone/email except self
    const duplicate = await workspace_collections.findOne({
      $or: [{ phone: input_data.phone }, { email: input_data.email }],
      _id: { $ne: new ObjectId(input_data.id) },
      workspace_id,
      delete: { $ne: true },
    });

    if (duplicate) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Customer with this phone/email already exists.",
      });
    }

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user_name?.name || "System";

    const result = await workspace_collections.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Customer updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Customer (Soft Delete)
 */
const delete_customer = async (req, res, next) => {
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

    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.deleted_by = user_name?.name || "System";

    const result = await workspace_collections.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_customer,
  get_customers,
  update_customer,
  delete_customer,
};
