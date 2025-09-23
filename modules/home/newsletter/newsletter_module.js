const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");
const { newsletter_collection } = require("../../../collection/collections/home/home");

// GET Newsletters
const get_newsletters = async (req, res, next) => {
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

    const newsletters = await newsletter_collection
      .find({ workspace_id, delete: { $ne: true } })
      .toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: newsletters,
      message: "Newsletters fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Newsletter
const create_newsletter = async (req, res, next) => {
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
    updated_data.createdAt = new Date();

    const user_name = await workspace_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user_name?.name || "Unknown";

    const result = await newsletter_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Newsletter created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE Newsletter
const update_newsletter = async (req, res, next) => {
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

    const result = await newsletter_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Newsletter updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Newsletter (soft delete)
const delete_newsletter = async (req, res, next) => {
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

    const result = await newsletter_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Newsletter deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get_newsletters,
  create_newsletter,
  update_newsletter,
  delete_newsletter,
};
