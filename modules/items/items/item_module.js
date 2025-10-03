const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection, user_collection } = require("../../../collection/collections/auth");
const { item_collection } = require("../../../collection/collections/item/items");


const get_item = async (req, res, next) => {
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
            const manufactures = await item_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: manufactures,
                  message: "Item fetched successfully.",
            });
      } catch (error) {
            next(error);
      }
}

const create_item = async (req, res, next) => {
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
            const find_item = await item_collection.findOne({ code: input_data.code });
            if (find_item) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        data: null,
                        message: "item already exist.",
                  });
            }
            let updated_data = enrichData(input_data);
            updated_data.workspace_id = workspace_id;
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;
            const result = await item_collection.insertOne(updated_data);
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Item created successfully.",
            });
      } catch (error) {
            next(error);
      }
};



const update_item = async (req, res, next) => {
  try {
    const input_data = req.body;
    const itemId = req.params.id;
    const workspace_id = req.headers.workspace_id;
    const user_id = req.headers.authorization;

    // Check workspace
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

    // Prepare updated data
    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    // Get user name
    const user_doc = await user_collection.findOne({ _id: new ObjectId(user_id) });
    updated_data.created_by = user_doc ? user_doc.name : "Unknown";

    // Update item using _id and workspace_id
    const result = await item_collection.updateOne(
      { _id: new ObjectId(itemId)},
      { $set: updated_data }
    );

    if (result.matchedCount === 0) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "Item not found or workspace mismatch",
      });
    }

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Item updated successfully.",
    });

  } catch (error) {
    next(error);
  }
};



const update_item_status = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const workspace_id = req.headers.workspace_id;
    const user_id = req.headers.authorization;

    if (!status) {
      return res.status(400).json({ error: true, message: "Status is required" });
    }

    // Check workspace
    const check_workspace = await workspace_collection.findOne({ _id: new ObjectId(workspace_id) });
    if (!check_workspace) {
      return res.status(404).json({ error: true, message: "Workspace not found" });
    }

    // Get user name
    const user_doc = await user_collection.findOne({ _id: new ObjectId(user_id) });
    const updated_by = user_doc ? user_doc.name : "Unknown";

    // Update only status
    const result = await item_collection.updateOne(
      { _id: new ObjectId(id), workspace_id },
      { $set: { status, updated_by: updated_by, updated_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: true, message: "Item not found or workspace mismatch" });
    }

    return res.status(200).json({
      error: false,
      data: result,
      message: "Item status updated successfully.",
    });

  } catch (error) {
    next(error);
  }
};


const delete_item = async (req, res, next) => {
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
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;
            delete updated_data._id;
            updated_data.delete = true;
            const result = await item_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Item deleted successfully.",
            });
      } catch (error) {
            next(error);
      }
};

module.exports = { create_item, get_item, update_item, delete_item, update_item_status }
