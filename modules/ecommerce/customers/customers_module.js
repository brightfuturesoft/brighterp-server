const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");
const { customers_collection } = require("../../../collection/collections/ecommerce/ecommerce");


// GET Customers
const get_customer = async (req, res, next) => {
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
    const customers = await customers_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
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


// CREATE Customer
const create_customer = async (req, res, next) => {
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
    updated_data.created_by = req.headers.authorization || "Unknown";

    const result = await customers_collection.insertOne(updated_data);
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


// UPDATE Customer
const update_customer = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    // --- Validate required inputs ---
    if (!workspace_id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "workspace_id is required in headers",
      });
    }

    if (!input_data?.id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Customer ID is required in request body",
      });
    }

    // --- Check workspace existence ---
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

    // --- Enrich and clean input data ---
    let updated_data = enrichData ? enrichData(input_data) : input_data;
    updated_data.workspace_id = workspace_id;
    updated_data.updated_by = req.headers.authorization || "Unknown";
    delete updated_data._id;

    // --- Perform the update operation ---
    const result = await customers_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    // --- Handle case: no match found ---
    if (result.matchedCount === 0) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Customer not found",
      });
    }

    // --- Success response ---
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Customer updated successfully.",
    });
  } catch (error) {
    console.error("Error in update_customer:", error);
    next(error);
  }
};

// DELETE Customer (soft delete)
const delete_customer = async (req, res, next) => {
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
    updated_data.updated_by = req.headers.authorization || "Unknown";
    delete updated_data._id;
    updated_data.delete = true;

    const result = await customers_collection.updateOne(
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


module.exports = { create_customer, get_customer, update_customer, delete_customer };
