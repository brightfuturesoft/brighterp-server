const { ObjectId } = require("mongodb");
const { enrichData } = require("../../../hooks/data_update");
const { response_sender } = require("../../../hooks/respose_sender");
const { user_collection } = require("../../../../collection/collections/auth");
const { income_collection } = require("../../../../collection/collections/transaction/transaction");
// Get all expenses
const get_incomes= async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    const expenses = await income_collection
      .find({ workspace_id, delete: { $ne: true } })
      .toArray();

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

// Get single income
const get_income = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspace_id = req.headers.workspace_id;

    if (!id) return res.status(400).json({ error: true, message: "income ID required" });
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: true, message: "Invalid income ID" });

    const income = await income_collection.findOne({ _id: new ObjectId(id), workspace_id });
    if (!income) return res.status(404).json({ error: true, message: "income not found" });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: income,
      message: "income fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
// Create an income
const create_income = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    // ✅ keep status from frontend (default Draft if not sent)
    updated_data.status = input_data.status || "Draft";

    // generate reference number
    const count = await income_collection.countDocuments({ workspace_id });
    updated_data.referenceNumber = `EXP-${String(count + 1).padStart(5, "0")}`;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user?.name || "Unknown";

    const result = await income_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: { ...result, referenceNumber: updated_data.referenceNumber },
      message: "income created successfully.",
    });
  } catch (error) {
    next(error);
  }
};



// Update income
const update_income = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user?.name || "Unknown";

    const result = await income_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "income updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete income (soft delete)
const delete_income = async (req, res, next) => {
  try {
    const input_data = req.body;

    let updated_data = enrichData(input_data);
    updated_data.delete = true;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.deleted_by = user?.name || "Unknown";

    const result = await income_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "income deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_income,
  get_incomes,
  get_income,
  update_income,
  delete_income,
};
