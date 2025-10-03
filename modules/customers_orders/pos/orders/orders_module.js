const { ObjectId } = require("mongodb");

const { response_sender } = require("../../../hooks/respose_sender");
const { workspace_collection } = require("../../../../collection/collections/auth");
const { pos_orders_collection, order_counter_collection } = require("../../../../collection/collections/customers_order/customers_order");
const { enrichData } = require("../../../hooks/data_update");
const { item_collection } = require("../../../../collection/collections/item/items");


// 🔹 Create Order
const create_order = async (req, res, next) => {
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
            const result = await pos_orders_collection.insertOne(updated_data);
            const get_order_id = await order_counter_collection.findOne(
                  { workspace_id: new ObjectId(workspace_id) },
            );

            //      need to also stock_quantity update item sku
            await item_collection.updateOne(
            );

            await order_counter_collection.findOneAndUpdate(
                  { workspace_id: new ObjectId(workspace_id) },
                  [
                        {
                              $set: {
                                    last_order_number: { $add: ["$last_order_number", 1] },
                                    active_order_id: {
                                          $concat: [check_workspace.unique_id, "_", { $toString: { $add: ["$last_order_number", 1] } }]
                                    }
                              }
                        }
                  ],
                  { upsert: true, returnDocument: "after" }
            );


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

            const orders = await pos_orders_collection.find(filter).toArray();

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


const get_single_order = async (req, res, next) => {
      const { order_number } = req.query;
      const check_order = await pos_orders_collection.findOne({ order_number: order_number });
      return response_sender({
            res,
            status_code: 200,
            error: false,
            data: check_order,
            message: "Order fetched successfully.",
      });
}

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

const get_transaction_id = async (req, res, next) => {
      try {
            const { workspace_id } = req.headers;
            const { shopName } = req.query;

            if (!workspace_id || !shopName) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        message: "workspace_id and shopName are required",
                  });
            }
            const counter = await counters_collection.findOneAndUpdate(
                  { workspace_id, shopName },
                  { $inc: { lastNumber: 1 } },
                  { upsert: true, returnDocument: "after" }
            );

            const transactionId = `${shopName}-${counter.lastNumber}`;

            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: { transactionId },
                  message: "TransactionId generated successfully",
            });
      } catch (error) {
            next(error);
      }
};

module.exports = {
      create_order,
      get_orders,
      get_single_order,
      update_order,
      delete_order,
      get_transaction_id,
};
