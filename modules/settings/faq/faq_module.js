const { ObjectId } = require("mongodb");
const { response_sender } = require("../../hooks/respose_sender");
const { faq_collection } = require("../../../collection/collections/auth");
const { image_collection } = require("../../../collection/collections/image_collection");
const sharp = require("sharp");

const create_faq = async (req, res, next) => {
  try {
    const { question, answer, workspace_id, created_by, images } = req.body;

    if (!question || !answer || !workspace_id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Question, answer, and workspace_id are required.",
      });
    }

    // Validate images array if provided
    let imageUrls = [];
    if (images && Array.isArray(images)) {
      imageUrls = images.filter(url => typeof url === 'string');
    }

    const doc = {
      _id: new ObjectId(),
      question,
      answer,
      workspace_id,
      created_by: created_by ? new ObjectId(created_by) : null,
      images: imageUrls,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await faq_collection.insertOne(doc);
    if (result.insertedId) {
      return response_sender({
        res,
        status_code: 201,
        error: false,
        data: doc,
        message: "FAQ created successfully.",
      });
    }
    return response_sender({
      res,
      status_code: 400,
      error: true,
      data: null,
      message: "Failed to create FAQ.",
    });
  } catch (error) {
    next(error);
  }
};

const get_faqs = async (req, res, next) => {
  try {
    const { workspace_id } = req.query;

    if (!workspace_id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Workspace ID is required.",
      });
    }

    const faqs = await faq_collection
      .find({ workspace_id })
      .sort({ created_at: -1 })
      .toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: faqs,
      message: "FAQs fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const update_faq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, images } = req.body;

    if (!id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "FAQ ID is required.",
      });
    }

    const updateData = { updated_at: new Date() };
    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;

    // Validate images array if provided
    if (images && Array.isArray(images)) {
      updateData.images = images.filter(url => typeof url === 'string');
    }

    const result = await faq_collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount > 0) {
      return response_sender({
        res,
        status_code: 200,
        error: false,
        data: null,
        message: "FAQ updated successfully.",
      });
    }
    return response_sender({
      res,
      status_code: 404,
      error: true,
      data: null,
      message: "FAQ not found.",
    });
  } catch (error) {
    next(error);
  }
};

const delete_faq = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "FAQ ID is required.",
      });
    }

    const result = await faq_collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      return response_sender({
        res,
        status_code: 200,
        error: false,
        data: null,
        message: "FAQ deleted successfully.",
      });
    }
    return response_sender({
      res,
      status_code: 404,
      error: true,
      data: null,
      message: "FAQ not found.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_faq,
  get_faqs,
  update_faq,
  delete_faq,
};
