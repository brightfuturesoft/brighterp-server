const { ObjectId } = require("mongodb");
const { enrichData } = require("../../../hooks/data_update")
const { response_sender } = require("../../../hooks/data_update")
const {expense_collection} = require("../../../../collection/collections/coa/coa")
const { workspace_collection, user_collection } = require("../../../../collection/collections/auth");

// ✅ GET all expenses
const get_expenses = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    // workspace check
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

    const expenses = await expense_collection.find({ workspace_id, delete: { $ne: true } }).toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: expenses,
      message: "Expenses fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ✅ CREATE expense
const create_expense = async (req, res, next) => {
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

    // Prevent duplicates by account name
    const find_expense = await expense_collection.findOne({
      ac_name: input_data.ac_name,
      workspace_id,
      delete: { $ne: true },
    });

    if (find_expense) {
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

    const result = await expense_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Expense account created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ✅ UPDATE expense
const update_expense = async (req, res, next) => {
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
    const find_expense = await expense_collection.findOne({
      ac_name: input_data.ac_name,
      _id: { $ne: new ObjectId(input_data.id) },
      delete: { $ne: true },
    });

    if (find_expense) {
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

    const result = await expense_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Expense account updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};



module.exports = { get_expenses, create_expense, update_expense };
