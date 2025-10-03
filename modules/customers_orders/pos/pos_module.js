const { ObjectId } = require("mongodb");
const { workspace_collection } = require("../../../collection/collections/auth");
const { order_counter_collection } = require("../../../collection/collections/customers_order/customers_order");
const { response_sender } = require("../../hooks/respose_sender");
const { item_collection } = require("../../../collection/collections/item/items");

const get_and_update_order_id = async (req, res, next) => {
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

            let counter = await order_counter_collection.findOne({ workspace_id: new ObjectId(workspace_id) });

            let new_order_id;

            if (counter && counter.active_order_id) {
                  new_order_id = counter.active_order_id;
            } else {
                  let next_number = counter ? counter.last_order_number + 1 : 1;
                  let formatted_number = String(next_number).padStart(2, "0");
                  new_order_id = `${check_workspace.unique_id}_${formatted_number}`;
                  await order_counter_collection.updateOne(
                        { workspace_id: new ObjectId(workspace_id) },
                        {
                              $set: { active_order_id: new_order_id },
                              $inc: { last_order_number: 1 }
                        },
                        { upsert: true }
                  );
            }


            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: { order_id: new_order_id },
                  message: "Order ID fetched successfully",
            });
      } catch (error) {
            next(error);
      }
};

const get_product_for_pos = async (req, res, next) => {
      try {
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

            const products = await item_collection
                  .find({
                        workspace_id,
                        delete: { $ne: true },
                        status: "Active",
                        item_type: "product",
                        availeablein_pos: true,
                  })
                  .toArray();

            // Flatten all variants into one array
            const all_variations = products.flatMap(product =>
                  Array.isArray(product.variants)
                        ? product.variants.map(variation => ({
                              ...variation,
                              _id: product._id,
                              category: product.categories || [],
                              item_name: product.item_name,
                              unit: product.unit,

                        }))
                        : []
            );

            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: all_variations,
                  message: "Product variations fetched successfully.",
            });
      } catch (error) {
            next(error);
      }
};




module.exports = {
      get_and_update_order_id,
      get_product_for_pos,
};
