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
            console.log(input_data);
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

            console.log(input_data);
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

            const result = await item_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
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

            console.log(input_data._id);

            const result = await item_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
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

module.exports = { create_item, get_item, update_item, delete_item }
