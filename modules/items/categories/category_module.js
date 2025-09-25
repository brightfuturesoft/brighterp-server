const { ObjectId } = require("mongodb");
const { category_collection, item_collection } = require("../../../collection/collections/item/items");
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
                              from: "item", // use collection name as string here
                              let: { categoryId: { $toString: "$_id" } },
                              pipeline: [
                                    {
                                          $match: {
                                                $expr: {
                                                      $in: ["$$categoryId", "$categories.value"] // check if categoryId exists in array
                                                }
                                          }
                                    }
                              ],
                              as: "products"
                        }
                  },
                  {
                        $addFields: {
                              itemCount: { $size: "$products" } // count number of matched items
                        }
                  },
                  {
                        $project: {
                              products: 0 // hide the full array
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
            const check_category = await category_collection.findOne({ code: input_data.code, workspace_id,
            delete: false });
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

const import_category = async (req, res, next) => {
    try {
        const { categories } = req.body;
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return response_sender({
                res,
                status_code: 400,
                error: true,
                data: null,
                message: "No categories provided for import",
            });
        }

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

        const user = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
        if (!user) {
            return response_sender({
                res,
                status_code: 404,
                error: true,
                data: null,
                message: "User not found",
            });
        }
        const codes = categories.map(c => c.code);
        const existingCategories = await category_collection.find({
            code: { $in: codes },
            workspace_id,
            delete: false
        }).toArray();
        const existingCodes = existingCategories.map(c => c.code);
        const categoriesToInsert = categories.map(cat => ({
            ...enrichData(cat),
            workspace_id,
            created_by: user.name,
            createdAt: new Date(),
            updatedAt: new Date(),
            delete: false,
        })).filter(cat => !existingCodes.includes(cat.code));

        if (categoriesToInsert.length === 0) {
            return response_sender({
                res,
                status_code: 200,
                error: false,
                data: null,
                message: "No new categories to import",
            });
        }

        const result = await category_collection.insertMany(categoriesToInsert);

        return response_sender({
            res,
            status_code: 200,
            error: false,
            data: result,
            message: `${result.insertedCount} categories imported successfully`,
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

const delete_many_category = async (req, res, next) => {
    try {
        const { ids } = req.body; 
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return response_sender({
                res,
                status_code: 400,
                error: true,
                data: null,
                message: "No category IDs provided for deletion",
            });
        }

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

        const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
        const updated_data = {
            delete: true,
            created_by: user_name.name,
        };
        const objectIds = ids.map(id => new ObjectId(id));
        const result = await category_collection.updateMany(
            { _id: { $in: objectIds } },
            { $set: updated_data }
        );
        return response_sender({
            res,
            status_code: 200,
            error: false,
            data: result,
            message: `${result.modifiedCount} categories deleted successfully`,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {import_category, create_category, get_category, update_category, delete_category, delete_many_category }
