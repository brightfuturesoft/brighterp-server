const { ObjectId } = require("mongodb");
const { workspace_customers_collection } = require("../../collection/collections/workspace_customers/workspace_customers");
const { response_sender } = require("../hooks/respose_sender");
const { workspace_collection } = require("../../collection/collections/auth");

const get_pos_customer = async (req, res, next) => {
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
            const get_customer = await workspace_customers_collection.find({ workspace_id: workspace_id, customer_type: "pos" }).toArray();
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: get_customer,
                  message: "Customer fetched successfully",
            });
      }
      catch (error) {
            next(error);
      }
};

const create_customer = async (req, res, next) => {
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
            const add_customer = await workspace_customers_collection.insertOne(input_data);
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: add_customer,
                  message: "Customer created successfully",
            });

      }
      catch (error) {
            next(error);
      }
};


const update_customer = async (req, res, next) => {
      try {
            const input_data = req.body;
            const workspace_id = req.headers.workspace_id;
            const customer_id = req.payload.id;
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
            const update_customer = await workspace_customers_collection.updateOne({ _id: new ObjectId(customer_id) }, { $set: { ...input_data } });
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: update_customer,
                  message: "Customer updated successfully",
            });
      }
      catch (error) {
            next(error);
      }
};


module.exports = {
      create_customer,
      get_pos_customer,
      update_customer
};
