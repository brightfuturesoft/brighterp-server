const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");

const {
  workspace_collection,
  user_collection,
} = require("../../../collection/collections/auth");
const {
  orders_collection,
} = require("../../../collection/collections/item/items");

// 🔹 Create Order
const create_order = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    // ✅ Validate workspace
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

    // ✅ Generate transactionId: ShopName-1, ShopName-2, ...
    const shopName = input_data.shopName || "Shop";
    const lastOrder = await orders_collection
      .find({ workspace_id, shopName })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (lastOrder.length > 0) {
      const lastTxId = lastOrder[0].transactionId;
      const parts = lastTxId.split("-");
      const lastNum = parseInt(parts[1]) || 0;
      nextNumber = lastNum + 1;
    }

    input_data.transactionId = `${shopName}-${nextNumber}`;

    // ✅ Prepare data
    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user_name?.name || "System";

    // ✅ Insert
    const result = await orders_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: { ...updated_data, _id: result.insertedId },
      message: "Order created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 Get Orders
const get_orders = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const { shopName } = req.query;

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

    const filter = { workspace_id, delete: { $ne: true } };
    if (shopName) filter.shopName = shopName;

    const orders = await orders_collection.find(filter).toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: orders,
      message: "Order(s) fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 Update Order
const update_order = async (req, res, next) => {
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
    updated_data.workspace_id = workspace_id;

    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user_name?.name || "System";

    const result = await orders_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Order updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// 🔹 Delete Order (soft delete)
const delete_order = async (req, res, next) => {
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
    updated_data.workspace_id = workspace_id;
    updated_data.delete = true;

    const user_name = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.deleted_by = user_name?.name || "System";

    const result = await orders_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { create_order, get_orders, update_order, delete_order };
