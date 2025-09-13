const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const {
  workspace_collection,
  user_collection,
} = require("../../../collection/collections/auth");
const {
  item_collection,
  category_collection,
} = require("../../../collection/collections/item/items");

const get_item = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const { item_type } = req.query;

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

    const filter = {
      workspace_id,
      delete: { $ne: true }, // exclude deleted items
    };

    if (item_type) {
      filter.item_type = item_type;
    }

    // ✅ Apply filter properly
    const items = await item_collection.find(filter).toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: items,
      message: "Item(s) fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const create_item = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    // ✅ check workspace
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

    // ✅ check if item already exists
    const find_item = await item_collection.findOne({ code: input_data.code });
    if (find_item) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Item already exists.",
      });
    }

    // ✅ enrich and prepare data
    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user_name?.name || "Unknown";
    updated_data.createAt = new Date();
    updated_data.updatedAt = new Date();
    updated_data.delete = false;

    // ✅ insert item
    const result = await item_collection.insertOne(updated_data);

    // ✅ increment itemCount in all categories assigned
    if (Array.isArray(updated_data.categories)) {
      const categoryIds = updated_data.categories.map(
        (c) => new ObjectId(c.value)
      );
      await category_collection.updateMany(
        { _id: { $in: categoryIds } },
        { $inc: { itemCount: 1 } }
      );
    }

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

    console.log(input_data);
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
    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user_name.name;

    const result = await item_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Item update successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const delete_item = async (req, res, next) => {
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
    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user_name.name;
    delete updated_data._id;
    updated_data.delete = true;

    console.log(input_data._id);

    const result = await item_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );
    console.log(result);
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

module.exports = { create_item, get_item, update_item, delete_item };
