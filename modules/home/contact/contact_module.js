const { ObjectId } = require("mongodb");
const { enrichData } = require("../../hooks/data_update");
const { response_sender } = require("../../hooks/respose_sender");
const { workspace_collection } = require("../../../collection/collections/auth");
const { contact_collection } = require("../../../collection/collections/home/home");
// GET Contacts
const get_contacts = async (req, res, next) => {
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

    const contacts = await contact_collection
      .find({ workspace_id, delete: { $ne: true } })
      .toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: contacts,
      message: "Contacts fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// CREATE Contact
const create_contact = async (req, res, next) => {
  try {
    const input_data = req.body;
    if (!input_data.name || !input_data.email) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Please provide a valid name and email.",
      });
    }
    const contactData = {
      ...input_data,
      createdAt: new Date(),
    };
    const result = await contact_collection.insertOne(contactData);
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Contact created successfully.",
    });
  } catch (error) {
    return response_sender({
      res,
      status_code: 500,
      error: true,
      data: null,
      message: "Something went wrong while creating the contact.",
    });
  }
};


// UPDATE Contact
const update_contact = async (req, res, next) => {
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

    const user_name = await workspace_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user_name?.name || "Unknown";

    const result = await contact_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Contact updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE Contact (soft delete)
const delete_contact = async (req, res, next) => {
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
    updated_data.delete = true;

    const user_name = await workspace_collection.findOne({
      _id: new ObjectId(req.headers.authorization),
    });
    updated_data.updated_by = user_name?.name || "Unknown";

    delete updated_data._id;

    const result = await contact_collection.updateOne(
      { _id: new ObjectId(input_data.id) },
      { $set: updated_data }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get_contacts,
  create_contact,
  update_contact,
  delete_contact,
};
