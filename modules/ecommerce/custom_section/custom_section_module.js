const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");
const { custom_sections_collection } = require("../../../collection/collections/ecommerce/ecommerce");

// GET Custom Sections
const get_custom_section = async (req, res, next) => {
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

    const sections = await custom_sections_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: sections,
      message: "Custom sections fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Custom Section
const create_custom_section = async (req, res, next) => {
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

    const result = await custom_sections_collection.insertOne(updated_data);
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Custom section created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE Custom Section
const update_custom_section = async (req, res, next) => {
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
    updated_data.updated_by = req.headers.authorization || "Unknown";
    delete updated_data._id;

    const result = await custom_sections_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Custom section updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Custom Section (soft delete)
const delete_custom_section = async (req, res, next) => {
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

    const result = await custom_sections_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Custom section deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_custom_section,
  get_custom_section,
  update_custom_section,
  delete_custom_section,
};
