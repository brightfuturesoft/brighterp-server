const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");

// GET Wishlist
const get_wishlist = async (req, res, next) => {
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

    const wishlist = await wis.find({ workspace_id, delete: { $ne: true } }).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: wishlist,
      message: "Wishlist fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Wishlist
const create_wishlist = async (req, res, next) => {
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

    const result = await wishlist_collection.insertOne(updated_data);
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Wishlist item created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE Wishlist
const update_wishlist = async (req, res, next) => {
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

    const result = await wishlist_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Wishlist updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Wishlist (soft delete)
const delete_wishlist = async (req, res, next) => {
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

    const result = await wishlist_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Wishlist item deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_wishlist,
  get_wishlist,
  update_wishlist,
  delete_wishlist,
};
