const { ObjectId } = require("mongodb");
const { category_collection } = require("../../../collection/collections/item/items");
const { enrichData } = require("../../hooks/data_update");
const { workspace_collection, user_collection } = require("../../../collection/collections/auth");
const { response_sender } = require("../../hooks/respose_sender");



const get_category = async (req, res, next) => {
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

            const categories = await category_collection.aggregate([
                  { $match: { workspace_id, delete: { $ne: true } } },
                  {
                        $lookup: {
                              from: "product_collection",
                              localField: "_id",
                              foreignField: "category_id", 
                              as: "products"
                        }
                  },
                  {
                        $addFields: {
                              itemCount: { $size: "$products" }
                        }
                  },
                  {
                        $project: {
                              products: 0 
                        }
                  }
            ]).toArray();

            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: categories,
                  message: "Category fetched successfully.",
            });
      } catch (error) {
            next(error);
      }
};

const create_category = async (req, res, next) => {
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
            //check this category already exist or not
            const check_category = await category_collection.findOne({ code: input_data.code });
            if (check_category) {
                  return response_sender({
                        res,
                        status_code: 409,
                        error: true,
                        data: null,
                        message: "Category already exist.",
                  });
            }
            updated_data.workspace_id = workspace_id;
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;

            const result = await category_collection.insertOne(updated_data);
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Category created successfully.",
            });
      } catch (error) {
            next(error);
      }
};


const update_category = async (req, res, next) => {
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
            //check this category already exist or not
            const check_category = await category_collection.findOne({ _id: new ObjectId(input_data._id) });
            if (!check_category) {
                  return response_sender({
                        res,
                        status_code: 404,
                        error: true,
                        data: null,
                        message: "Category not found.",
                  });
            }
            updated_data.workspace_id = workspace_id;
            const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) })
            updated_data.created_by = user_name.name;
            delete updated_data._id;

            const result = await category_collection.updateOne({ _id: new ObjectId(input_data._id) }, { $set: updated_data });
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Category updated successfully.",
            });
      } catch (error) {
            next(error);
      }
};

const delete_category = async (req, res, next) => {
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

            const result = await category_collection.updateOne({ _id: new ObjectId(input_data.id) }, { $set: updated_data });
            console.log(result);
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: result,
                  message: "Category deleted successfully.",
            });
      } catch (error) {
            next(error);
      }
};

module.exports = { create_category, get_category, update_category, delete_category }
