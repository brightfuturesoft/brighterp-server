const { ObjectId } = require("mongodb");
const { enrichData } = require("../../../hooks/data_update");
const { response_sender } = require("../../../hooks/respose_sender");
const { journal_collection } = require("../../../../collection/collections/transaction/transaction");
const { user_collection } = require("../../../../collection/collections/auth");

// Get all journals
const get_journals = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    const journals = await journal_collection
      .find({ workspace_id, delete: { $ne: true } })
      .toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: journals,
      message: "Journals fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
// // Get single journal
// const get_journal = async (req, res, next) => {
//   try {
//     const workspace_id = req.headers.workspace_id;
//     const { id } = req.params;

//     if (!id) return res.status(400).json({ error: true, message: "Journal ID required" });

//     const journal = await journal_collection.findOne({ _id: new ObjectId(id), workspace_id });

//     if (!journal) {
//       return res.status(404).json({ error: true, message: "Journal not found" });
//     }

//     return response_sender({
//       res,
//       status_code: 200,
//       error: false,
//       data: journal,
//       message: "Journal fetched successfully.",
//     });
//   } catch (err) {
//     next(err);
//   }
// };


// Create a journal
const create_journal = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.created_by = user?.name || "Unknown";

    const result = await journal_collection.insertOne(updated_data);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Journal created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update journal
const update_journal = async (req, res, next) => {
  try {
    const input_data = req.body;
    const workspace_id = req.headers.workspace_id;

    let updated_data = enrichData(input_data);
    updated_data.workspace_id = workspace_id;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user?.name || "Unknown";

    const result = await journal_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Journal updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete journal (soft delete)
const delete_journal = async (req, res, next) => {
  try {
    const input_data = req.body;

    let updated_data = enrichData(input_data);
    updated_data.delete = true;

    const user = await user_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.deleted_by = user?.name || "Unknown";

    const result = await journal_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Journal deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { create_journal, get_journals, update_journal, delete_journal };
