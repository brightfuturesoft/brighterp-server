const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");
const { direct_sales_collection } = require("../../../collection/collections/sale/sale");

// GET Direct Sales
const get_direct_sales = async (req, res, next) => {
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

    const sales = await direct_sales_collection.find({ workspace_id, delete: { $ne: true } }).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: sales,
      message: "Direct sales fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Direct Sale
const create_direct_sale = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    // Check workspace
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

    // Generate order number
    let lastOrder = await direct_sales_collection
      .find({ workspace_id })
      .sort({ _id: -1 }) // last inserted first
      .limit(1)
      .toArray();

    let newOrderNumber = 'ORD00001';
    if (lastOrder.length > 0 && lastOrder[0].order_number) {
      const lastNumber = parseInt(lastOrder[0].order_number.replace('ORD', ''), 10);
      const nextNumber = lastNumber + 1;
      newOrderNumber = 'ORD' + nextNumber.toString().padStart(5, '0');
    }

    // Enrich input data
    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;
    updated_data.order_number = newOrderNumber; 
    updated_data.order_status = 'processing';

    const user_name = await workspace_collection.findOne({ _id: new ObjectId(req.headers.authorization) });
    updated_data.created_by = user_name?.name || "Unknown";

    // Insert
    const result = await direct_sales_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Direct sale created successfully.",
    });
  } catch (error) {
    next(error);
  }
};


// UPDATE Direct Sale
const update_direct_sale = async (req, res, next) => {
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

    const result = await direct_sales_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Direct sale updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Direct Sale (soft delete)
const delete_direct_sale = async (req, res, next) => {
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

    const result = await direct_sales_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Direct sale deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get_direct_sales,
  create_direct_sale,
  update_direct_sale,
  delete_direct_sale,
};
