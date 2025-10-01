const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");
const { blog_collection } = require("../../../collection/collections/ecommerce/ecommerce");

// GET Blogs
const get_blogs = async (req, res, next) => {
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

    const blogs = await blog_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: blogs,
      message: "Blogs fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Blog
const create_blog = async (req, res, next) => {
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

    const result = await blog_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Blog created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE Blog
const update_blog = async (req, res, next) => {
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
    updated_data.updated_by = user_name?.name || "Unknown";

    const result = await blog_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Blog updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Blog (soft delete)
const delete_blog = async (req, res, next) => {
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

    const result = await blog_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get_blogs,
  create_blog,
  update_blog,
  delete_blog,
};
