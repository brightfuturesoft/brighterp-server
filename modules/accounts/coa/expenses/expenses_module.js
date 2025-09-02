// src/api/v1/utils/crudFactory.js
const { ObjectId } = require("mongodb");
const { enrichData, response_sender } = require("../../../hooks/data_update");
const { workspace_collection, user_collection } = require("../../../../collection/collections/auth");

const expenses_module = (collection, entityName) => {
  return {
    // GET all
    getAll: async (req, res, next) => {
      try {
        const workspace_id = req.headers.workspace_id;

        // Workspace check
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

        const items = await collection.find({ workspace_id, delete: { $ne: true } }).toArray();

        return response_sender({
          res,
          status_code: 200,
          error: false,
          data: items,
          message: `${entityName} fetched successfully.`,
        });
      } catch (error) {
        next(error);
      }
    },

    // ✅ CREATE
    create: async (req, res, next) => {
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

        // Prevent duplicates
        const find_item = await collection.findOne({
          ac_name: input_data.ac_name,
          workspace_id,
          delete: { $ne: true },
        });

        if (find_item) {
          return response_sender({
            res,
            status_code: 400,
            error: true,
            data: null,
            message: "Account already exists.",
          });
        }

        let updated_data = enrichData(input_data);
        updated_data.workspace_id = workspace_id;
        const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
        updated_data.created_by = user_name?.name || "System";
        updated_data.delete = false;

        const result = await collection.insertOne(updated_data);

        return response_sender({
          res,
          status_code: 200,
          error: false,
          data: result,
          message: `${entityName} created successfully.`,
        });
      } catch (error) {
        next(error);
      }
    },

    //  UPDATE
    update: async (req, res, next) => {
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

        // Prevent duplicates
        const find_item = await collection.findOne({
          ac_name: input_data.ac_name,
          _id: { $ne: new ObjectId(input_data.id) },
          delete: { $ne: true },
        });

        if (find_item) {
          return response_sender({
            res,
            status_code: 400,
            error: true,
            data: null,
            message: "Account already exists.",
          });
        }

        let updated_data = enrichData(input_data);
        updated_data.workspace_id = workspace_id;
        const user_name = await user_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
        updated_data.created_by = user_name?.name || "System";

        const result = await collection.updateOne(
          { _id: new ObjectId(input_data.id) },
          { $set: updated_data }
        );

        return response_sender({
          res,
          status_code: 200,
          error: false,
          data: result,
          message: `${entityName} updated successfully.`,
        });
      } catch (error) {
        next(error);
      }
    },
  };
};

module.exports = expenses_module;
