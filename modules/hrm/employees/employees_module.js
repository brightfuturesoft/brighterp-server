const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { employees_collection } = require("../../../collection/collections/hrm/employees");
const { user_collection } = require("../../../collection/collections/auth");

// Get all employees
const get_employees = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    const employees = await employees_collection
      .find({ workspace_id, delete: { $ne: true } })
      .toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: employees,
      message: "Employees fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Get single employee
const get_employee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspace_id = req.headers.workspace_id;

    if (!id) return res.status(400).json({ error: true, message: "Employee ID required" });

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: "Invalid Employee ID" });
    }

    const employee = await employees_collection.findOne({ _id: new ObjectId(id), workspace_id });

    if (!employee) return res.status(404).json({ error: true, message: "Employee not found" });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: employee,
      message: "Employee fetched successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// Create an employee
const create_employee = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user?.name || "Unknown";

    const result = await employees_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Employee created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update employee
const update_employee = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    if (!input_data.id) {
      return res.status(400).json({ error: true, message: "Employee ID required" });
    }

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user?.name || "Unknown";

    const result = await employees_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Employee updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete employee (soft delete)
const delete_employee = async (req, res, next) => {
  try {
    const input_data = req.body;

    if (!input_data.id) {
      return res.status(400).json({ error: true, message: "Employee ID required" });
    }

    let updated_data = enrichData(input_data);
    updated_data.delete = true;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.deleted_by = user?.name || "Unknown";

    const result = await employees_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_employee,
  get_employees,
  get_employee,
  update_employee,
  delete_employee,
};
