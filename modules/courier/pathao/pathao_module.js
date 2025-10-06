const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { pathao_couriers_collection } = require("../../../collection/collections/courier/courier");
const { workspace_collection } = require("../../../collection/collections/auth");

// GET Pathao Couriers
const get_pathao_couriers = async (req, res, next) => {
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

    const couriers = await pathao_couriers_collection
      .find({ workspace_id, delete: { $ne: true } })
      .toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: couriers,
      message: "Pathao couriers fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Pathao Courier
const create_pathao_courier = async (req, res, next) => {
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

    const result = await pathao_couriers_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Pathao courier created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE Pathao Courier
import { ObjectId } from "mongodb";
import { workspace_collection, pathao_couriers_collection } from "../db";
import { response_sender } from "../utils/responseSender";
import { enrichData } from "../utils/enrichData";

export const update_pathao_courier = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    // Check workspace exists
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

    // Validate required fields
    const { base_url, client_id, client_secret } = input_data;
    if (!base_url || !client_id || !client_secret) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Base URL, Client ID, and Client Secret are required",
      });
    }

    // Prepare updated data
    let updated_data = enrichData({ base_url, client_id, client_secret });
    updated_data.workspace_id = workspace_id;

    // Who updated
    const user = await workspace_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.updated_by = user?.name || "Unknown";

    // Upsert logic: if ID exists, filter by ID; else filter by workspace_id
    const filter = input_data.id ? { _id: new ObjectId(input_data.id) } : { workspace_id };

    const result = await pathao_couriers_collection.updateOne(
      filter,
      { $set: updated_data },
      { upsert: true }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Pathao courier updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};


// DELETE Pathao Courier (soft delete)
const delete_pathao_courier = async (req, res, next) => {
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

    const result = await pathao_couriers_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Pathao courier deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get_pathao_couriers,
  create_pathao_courier,
  update_pathao_courier,
  delete_pathao_courier,
};
