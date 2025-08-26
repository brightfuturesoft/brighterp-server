const { ObjectId } = require("mongodb");

const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection, user_collection } = require("../../../collection/collections/auth");
const { brand_collection } = require("../../../collection/collections/item/items");


const get_brand = async (req, res, next) => {
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
            const manufactures = await brand_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: manufactures,
                  message: "Brand fetched successfully.",
            });
      } catch (error) {
            next(error);
      }
}

const create_brand = async (req, res, next) => {
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
            const find_brand = await brand_collection.findOne({ code: input_data.code });
            if (find_brand) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        data: null,
                        message: "Brand already exist.",
                  });
            }
            let updated_data = enrichData(input_data);
            updated_data.workspace_id = workspace_id;
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;

            const result = await brand_collection.insertOne(updated_data);
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Brand created successfully.",
            });
      } catch (error) {
            next(error);
      }
};

const update_brand = async (req, res, next) => {
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
            const find_brand = await brand_collection.findOne({ code: input_data.code });
            if (find_brand) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        data: null,
                        message: "Brand already exist.",
                  });
            }
            let updated_data = enrichData(input_data);
            updated_data.workspace_id = workspace_id;
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;

            const result = await brand_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Brand update successfully.",
            });
      } catch (error) {
            next(error);
      }
};

const delete_brand = async (req, res, next) => {
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

            const result = await brand_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
            console.log(result);
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Brand deleted successfully.",
            });
      } catch (error) {
            next(error);
      }
};

module.exports = { create_brand, get_brand, update_brand, delete_brand }
