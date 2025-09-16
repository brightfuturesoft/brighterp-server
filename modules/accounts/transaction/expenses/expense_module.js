const { ObjectId } = require("mongodb");
const { enrichData } = require("../../../hooks/data_update");
const { response_sender } = require("../../../hooks/respose_sender");
const { user_collection } = require("../../../../collection/collections/auth");
const { expense_collection } = require("../../../../collection/collections/transaction/transaction");
// Get all expenses
const get_expenses = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    const expenses = await expense_collection
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

// Get single expense
const get_expense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspace_id = req.headers.workspace_id;

    if (!id) return res.status(400).json({ error: true, message: "Expense ID required" });
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: true, message: "Invalid Expense ID" });

    const expense = await expense_collection.findOne({ _id: new ObjectId(id), workspace_id });
    if (!expense) return res.status(404).json({ error: true, message: "Expense not found" });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: expense,
      message: "Expense fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
// Create an expense
const create_expense = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    // ✅ keep status from frontend (default Draft if not sent)
    updated_data.status = input_data.status || "Draft";

    // generate reference number
    const count = await expense_collection.countDocuments({ workspace_id });
    updated_data.referenceNumber = `EXP-${String(count + 1).padStart(5, "0")}`;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user?.name || "Unknown";

    const result = await expense_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: { ...result, referenceNumber: updated_data.referenceNumber },
      message: "Expense created successfully.",
    });
  } catch (error) {
    next(error);
  }
};



// Update expense
const update_expense = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;
    
    // Validation
    if (!input_data.id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Expense ID is required.",
      });
    }
    
    if (!ObjectId.isValid(input_data.id)) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Invalid expense ID format.",
      });
    }
    
    if (!ObjectId.isValid(req.headers.authorization)) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Invalid user ID.",
      });
    }

    if (!workspace_id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Workspace ID is required.",
      });
    }

    // Prepare update data
    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;
    
    // Get user for audit trail
    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    
    if (!user) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        message: "User not found.",
      });
    }
    
    updated_data.updated_by = user?.name || "Unknown";
    updated_data.updated_at = new Date();
    
    // Remove the id from update data to avoid conflicts
    delete updated_data.id;
    
    // Update the expense with proper filter
    const result = await expense_collection.updateOne(
      { 
        _id: new ObjectId(input_data.id), 
        workspace_id: workspace_id 
      },
      { $set: updated_data }
    );
    
    if (result.matchedCount === 0) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        message: "Expense not found or access denied.",
      });
    }
    
    if (result.modifiedCount === 0) {
      return response_sender({
        res,
        status_code: 200,
        error: false,
        message: "No changes were made to the expense.",
        data: { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }
      });
    }
    
    // Fetch and return updated expense
    const updatedExpense = await expense_collection.findOne({
      _id: new ObjectId(input_data.id),
      workspace_id: workspace_id
    });
    
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: updatedExpense,
      message: "Expense updated successfully.",
    });
    
  } catch (error) {
    console.error("Error updating expense:", error);
    return response_sender({
      res,
      status_code: 500,
      error: true,
      message: "Internal server error while updating expense.",
    });
  }
};


// Delete expense (soft delete)
const delete_expense = async (req, res, next) => {
  try {
    const input_data = req.body;

    let updated_data = enrichData(input_data);
    updated_data.delete = true;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.deleted_by = user?.name || "Unknown";

    const result = await expense_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_expense,
  get_expenses,
  get_expense,
  update_expense,
  delete_expense,
};
