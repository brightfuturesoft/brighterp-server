const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { color_collection } = require("../../../collection/collections/item/items");
const { workspace_collection, user_collection } = require("../../../collection/collections/auth");


const get_color = async (req, res, next) => {
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
            const manufactures = await color_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: manufactures,
                  message: "Color fetched successfully.",
            });
      } catch (error) {
            next(error);
      }
}

const create_color = async (req, res, next) => {
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
            const find_color = await color_collection.findOne({ code: input_data.code });
            if (find_color) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        data: null,
                        message: "Color already exist.",
                  });
            }
            let updated_data = enrichData(input_data);
            updated_data.workspace_id = workspace_id;
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;

            const result = await color_collection.insertOne(updated_data);
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Color created successfully.",
            });
      } catch (error) {
            next(error);
      }
};

const update_color = async (req, res, next) => {
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
            const find_color = await color_collection.findOne({ _id: new ObjectId(input_data.id) });
            if (!find_color) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        data: null,
                        message: "Color not found.",
                  });
            }
            let updated_data = enrichData(input_data);
            updated_data.workspace_id = workspace_id;
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;

            const result = await color_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Color update successfully.",
            });
      } catch (error) {
            next(error);
      }
};

const delete_color = async (req, res, next) => {
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
            const result = await color_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Color deleted successfully.",
            });
      } catch (error) {
            next(error);
      }
};

module.exports = { create_color, get_color, update_color, delete_color }
