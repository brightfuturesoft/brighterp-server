const { ObjectId } = require("mongodb");
const sharp = require("sharp");
const { response_sender } = require("../../hooks/respose_sender");
const { warehouse_collection, area_collection, rack_collection, shelf_collection, cell_collection } = require("../../../collection/collections/warehouse");

// Add warehouse
const addWarehouse = async (req, res, next) => {
  try {
    const { name, slag, address, description } = req.body;
    const imageFile = req.file;

    let data = { name, slag, address, description };

    // Handle image upload using image module
    if (imageFile) {
      const mimeType = imageFile.mimetype;

      if (!["image/jpeg", "image/jpg", "image/png"].includes(mimeType)) {
        return response_sender({ res, status_code: 400, error: true, message: "Unsupported image format" });
      }

      // Use image module to upload image
      const { image_collection } = require("../../../collection/collections/image_collection");

      let sharpInstance = sharp(imageFile.buffer).resize({ width: 300 });
      let compressedBuffer;

      if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
        compressedBuffer = await sharpInstance.jpeg({ quality: 90 }).toBuffer();
      } else if (mimeType === "image/png") {
        compressedBuffer = await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
      }

      // Store image in image collection
      const imageResult = await image_collection.insertOne({
        image: compressedBuffer,
        createdAt: new Date(),
        title: `warehouse_${name}`,
      });

      // Store image URL in warehouse
      const fileExtension = mimeType.split("/")[1];
      const imageUrl = `${process.env.SERVER_URL}/image/${imageResult.insertedId}.${fileExtension}`;
      data.imageUrl = imageUrl;
    }

    const result = await warehouse_collection.insertOne(data);
    return response_sender({
      res,
      status_code: 201,
      error: false,
      data: { id: result.insertedId },
      message: "Warehouse added successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Combined update for warehouse, area, rack, shelf, cell
const updateWarehouseDetails = async (req, res, next) => {
  try {
    const { warehouse, areas, racks, shelfs, cells } = req.body;

    if (!warehouse || !warehouse._id) {
      return response_sender({ res, status_code: 400, error: true, message: "Warehouse ID is required" });
    }

    const warehouseId = new ObjectId(warehouse._id);

    // Update warehouse
    await warehouse_collection.updateOne({ _id: warehouseId }, { $set: warehouse });

    // Update areas
    if (Array.isArray(areas)) {
      for (const area of areas) {
        if (area._id) {
          await area_collection.updateOne({ _id: new ObjectId(area._id) }, { $set: area });
        } else {
          area.warehouseId = warehouseId;
          await area_collection.insertOne(area);
        }
      }
    }

    // Update racks
    if (Array.isArray(racks)) {
      for (const rack of racks) {
        if (rack._id) {
          await rack_collection.updateOne({ _id: new ObjectId(rack._id) }, { $set: rack });
        } else {
          rack.warehouseId = warehouseId;
          await rack_collection.insertOne(rack);
        }
      }
    }

    // Update shelfs
    if (Array.isArray(shelfs)) {
      for (const shelf of shelfs) {
        if (shelf._id) {
          await shelf_collection.updateOne({ _id: new ObjectId(shelf._id) }, { $set: shelf });
        } else {
          shelf.warehouseId = warehouseId;
          await shelf_collection.insertOne(shelf);
        }
      }
    }

    // Update cells
    if (Array.isArray(cells)) {
      for (const cell of cells) {
        if (cell._id) {
          await cell_collection.updateOne({ _id: new ObjectId(cell._id) }, { $set: cell });
        } else {
          cell.warehouseId = warehouseId;
          await cell_collection.insertOne(cell);
        }
      }
    }

    return response_sender({
      res,
      status_code: 200,
      error: false,
      message: "Warehouse details updated successfully",
    });
  } catch (error) {
    next(error);
  }
};



// Add area
const addArea = async (req, res, next) => {
  try {
    const { warehouseId, description } = req.body;
    const data = {
      warehouseId: new ObjectId(warehouseId),
      description: description,
      status: "Enable"
    };
    const result = await area_collection.insertOne(data);
    return response_sender({
      res,
      status_code: 201,
      error: false,
      data: { id: result.insertedId },
      message: "Area added successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Add rack
const addRack = async (req, res, next) => {
  try {
    const { areaId, description } = req.body;
    const area = await area_collection.findOne({ _id: new ObjectId(areaId) });
    if (!area) {
      return response_sender({ res, status_code: 400, error: true, message: "Area not found" });
    }
    const data = {
      warehouseId: area.warehouseId,
      areaId: new ObjectId(areaId),
      description: description,
      status: "Enable"
    };
    const result = await rack_collection.insertOne(data);
    return response_sender({
      res,
      status_code: 201,
      error: false,
      data: { id: result.insertedId },
      message: "Rack added successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Add shelf
const addShelf = async (req, res, next) => {
  try {
    const { rackId, description } = req.body;
    const rack = await rack_collection.findOne({ _id: new ObjectId(rackId) });
    if (!rack) {
      return response_sender({ res, status_code: 400, error: true, message: "Rack not found" });
    }
    const data = {
      warehouseId: rack.warehouseId,
      rackId: new ObjectId(rackId),
      description: description,
      status: "Enable"
    };
    const result = await shelf_collection.insertOne(data);
    return response_sender({
      res,
      status_code: 201,
      error: false,
      data: { id: result.insertedId },
      message: "Shelf added successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Add cell
const addCell = async (req, res, next) => {
  try {
    const { shelfId, description } = req.body;
    const shelf = await shelf_collection.findOne({ _id: new ObjectId(shelfId) });
    if (!shelf) {
      return response_sender({ res, status_code: 400, error: true, message: "Shelf not found" });
    }
    const rack = await rack_collection.findOne({ _id: shelf.rackId });
    if (!rack) {
      return response_sender({ res, status_code: 400, error: true, message: "Rack not found" });
    }
    const data = {
      warehouseId: shelf.warehouseId,
      areaId: rack.areaId,
      rackId: shelf.rackId,
      shelfId: new ObjectId(shelfId),
      description: description,
      status: "Enable"
    };
    const result = await cell_collection.insertOne(data);
    return response_sender({
      res,
      status_code: 201,
      error: false,
      data: { id: result.insertedId },
      message: "Cell added successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Get areas with warehouse name
const getAreas = async (req, res, next) => {
  try {
    const { warehouseId } = req.query;
    let match = {};
    if (warehouseId) {
      match.warehouseId = new ObjectId(warehouseId);
    }
    const areas = await area_collection.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: {
          path: "$warehouse",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: { $ifNull: ["$warehouse.name", ""] },
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: areas,
      message: "Areas fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getRacks = async (req, res, next) => {
  try {
    const { areaId, warehouseId } = req.query;
    let match = {};
    if (areaId) {
      match.areaId = new ObjectId(areaId);
    }
    if (warehouseId) {
      match.warehouseId = new ObjectId(warehouseId);
    }
    const racks = await rack_collection.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $lookup: {
          from: "area",
          localField: "areaId",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: "$warehouse.name",
          area: { $ifNull: ["$area.description", ""] },
          areaId: "$areaId",
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: racks,
      message: "Racks fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getShelfs = async (req, res, next) => {
  try {
    const { rackId, warehouseId } = req.query;
    let match = {};
    if (rackId) {
      match.rackId = new ObjectId(rackId);
    }
    if (warehouseId) {
      match.warehouseId = new ObjectId(warehouseId);
    }
    const shelfs = await shelf_collection.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $lookup: {
          from: "rack",
          localField: "rackId",
          foreignField: "_id",
          as: "rack",
        },
      },
      {
        $unwind: {
          path: "$rack",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "area",
          localField: "rack.areaId",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: "$warehouse.name",
          area: { $ifNull: ["$area.description", ""] },
          rack: { $ifNull: ["$rack.description", ""] },
          rackId: "$rackId",
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: shelfs,
      message: "Shelfs fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Get cells with warehouse name
const getCells = async (req, res, next) => {
  try {
    const cells = await cell_collection.aggregate([
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $lookup: {
          from: "area",
          localField: "areaId",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "rack",
          localField: "rackId",
          foreignField: "_id",
          as: "rack",
        },
      },
      {
        $unwind: {
          path: "$rack",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "shelf",
          localField: "shelfId",
          foreignField: "_id",
          as: "shelf",
        },
      },
      {
        $unwind: {
          path: "$shelf",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: "$warehouse.name",
          area: { $ifNull: ["$area.description", ""] },
          rack: { $ifNull: ["$rack.description", ""] },
          shelf: { $ifNull: ["$shelf.description", ""] },
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: cells,
      message: "Cells fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Get warehouses with counts of areas, racks, shelves, cells
const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await warehouse_collection.aggregate([
      {
        $lookup: {
          from: "area",
          localField: "_id",
          foreignField: "warehouseId",
          as: "areas",
        },
      },
      {
        $lookup: {
          from: "rack",
          localField: "_id",
          foreignField: "warehouseId",
          as: "racks",
        },
      },
      {
        $lookup: {
          from: "shelf",
          localField: "_id",
          foreignField: "warehouseId",
          as: "shelves",
        },
      },
      {
        $lookup: {
          from: "cell",
          localField: "_id",
          foreignField: "warehouseId",
          as: "cells",
        },
      },
      {
        $project: {
          name: 1,
          address: 1,
          status: 1,
          areaCount: { $size: "$areas" },
          rackCount: { $size: "$racks" },
          shelfCount: { $size: "$shelves" },
          cellCount: { $size: "$cells" },
        },
      },
    ]).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: warehouses,
      message: "Warehouses fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update area
const updateArea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Validate status value if present
    if (data.status) {
      const statusValue = data.status.toLowerCase();
      if (statusValue !== "enable" && statusValue !== "disable") {
        return response_sender({
          res,
          status_code: 400,
          error: true,
          message: "Invalid status value. Must be 'Enable' or 'Disable'.",
        });
      }
      const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
      const result = await area_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

      return response_sender({
        res,
        status_code: 200,
        error: false,
        data: result,
        message: "Area status updated successfully.",
      });
    }

    // For other updates, update description or other fields
    const updateData = { ...data };
    delete updateData.status; // Remove status if present to avoid overwriting

    // Convert warehouseId to ObjectId if present
    if (updateData.warehouseId) {
      updateData.warehouseId = new ObjectId(updateData.warehouseId);
    }

    const result = await area_collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Area updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update rack
const updateRack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.status) {
      const statusValue = data.status.toLowerCase();
      if (statusValue !== "enable" && statusValue !== "disable") {
        return response_sender({
          res,
          status_code: 400,
          error: true,
          message: "Invalid status value. Must be 'Enable' or 'Disable'.",
        });
      }
      const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
      const result = await rack_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

      return response_sender({
        res,
        status_code: 200,
        error: false,
        data: result,
        message: "Rack status updated successfully.",
      });
    }

    const updateData = { ...data };
    delete updateData.status;

    // Convert warehouseId to ObjectId if present
    if (updateData.warehouseId) {
      updateData.warehouseId = new ObjectId(updateData.warehouseId);
    }

    // Convert areaId to ObjectId if present
    if (updateData.areaId) {
      updateData.areaId = new ObjectId(updateData.areaId);
    }

    const result = await rack_collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Rack updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update shelf
const updateShelf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.status) {
      const statusValue = data.status.toLowerCase();
      if (statusValue !== "enable" && statusValue !== "disable") {
        return response_sender({
          res,
          status_code: 400,
          error: true,
          message: "Invalid status value. Must be 'Enable' or 'Disable'.",
        });
      }
      const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
      const result = await shelf_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

      return response_sender({
        res,
        status_code: 200,
        error: false,
        data: result,
        message: "Shelf status updated successfully.",
      });
    }

    const updateData = { ...data };
    delete updateData.status;

    // Convert warehouseId to ObjectId if present
    if (updateData.warehouseId) {
      updateData.warehouseId = new ObjectId(updateData.warehouseId);
    }

    const result = await shelf_collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Shelf updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update cell
const updateCell = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.status) {
      const statusValue = data.status.toLowerCase();
      if (statusValue !== "enable" && statusValue !== "disable") {
        return response_sender({
          res,
          status_code: 400,
          error: true,
          message: "Invalid status value. Must be 'Enable' or 'Disable'.",
        });
      }
      const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
      const result = await cell_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

      return response_sender({
        res,
        status_code: 200,
        error: false,
        data: result,
        message: "Cell status updated successfully.",
      });
    }

    let updateData = { ...data };
    delete updateData.status;

    if (updateData.warehouseId) {
      updateData.warehouseId = new ObjectId(updateData.warehouseId);
    }
    if (updateData.areaId) {
      updateData.areaId = new ObjectId(updateData.areaId);
    }
    if (updateData.rackId) {
      updateData.rackId = new ObjectId(updateData.rackId);
    }
    if (updateData.shelfId) {
      updateData.shelfId = new ObjectId(updateData.shelfId);
    }

    const result = await cell_collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Cell updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete area
const deleteArea = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await area_collection.deleteOne({ _id: new ObjectId(id) });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Area deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete rack
const deleteRack = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await rack_collection.deleteOne({ _id: new ObjectId(id) });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Rack deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete shelf
const deleteShelf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await shelf_collection.deleteOne({ _id: new ObjectId(id) });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Shelf deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Delete cell
const deleteCell = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await cell_collection.deleteOne({ _id: new ObjectId(id) });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Cell deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const updateWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await warehouse_collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Warehouse updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteWarehouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await warehouse_collection.deleteOne({ _id: new ObjectId(id) });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Warehouse deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const updateWarehouseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await warehouse_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Warehouse status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getWarehouseDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const warehouseId = new ObjectId(id);

    const warehouse = await warehouse_collection.findOne({ _id: warehouseId });
    if (!warehouse) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        message: "Warehouse not found",
      });
    }

    const areas = await area_collection.aggregate([
      { $match: { warehouseId } },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: {
          path: "$warehouse",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: { $ifNull: ["$warehouse.name", ""] },
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();

    const racks = await rack_collection.aggregate([
      { $match: { warehouseId } },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $lookup: {
          from: "area",
          localField: "areaId",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: "$warehouse.name",
          area: { $ifNull: ["$area.description", ""] },
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();

    const shelfs = await shelf_collection.aggregate([
      { $match: { warehouseId } },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $lookup: {
          from: "rack",
          localField: "rackId",
          foreignField: "_id",
          as: "rack",
        },
      },
      {
        $unwind: {
          path: "$rack",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "area",
          localField: "rack.areaId",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: "$warehouse.name",
          rack: { $ifNull: ["$rack.description", ""] },
          area: { $ifNull: ["$area.description", ""] },
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();

    const cells = await cell_collection.aggregate([
      { $match: { warehouseId } },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $lookup: {
          from: "area",
          localField: "areaId",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "rack",
          localField: "rackId",
          foreignField: "_id",
          as: "rack",
        },
      },
      {
        $unwind: {
          path: "$rack",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "shelf",
          localField: "shelfId",
          foreignField: "_id",
          as: "shelf",
        },
      },
      {
        $unwind: {
          path: "$shelf",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: "$warehouse.name",
          area: { $ifNull: ["$area.description", ""] },
          rack: { $ifNull: ["$rack.description", ""] },
          shelf: { $ifNull: ["$shelf.description", ""] },
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: {
        warehouse,
        areas,
        racks,
        shelfs,
        cells,
      },
      message: "Warehouse details fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update area status
const updateAreaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValue = status.toLowerCase();
    if (statusValue !== "enable" && statusValue !== "disable") {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Invalid status value. Must be 'Enable' or 'Disable'.",
      });
    }
    const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
    const result = await area_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Area status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update rack status
const updateRackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValue = status.toLowerCase();
    if (statusValue !== "enable" && statusValue !== "disable") {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Invalid status value. Must be 'Enable' or 'Disable'.",
      });
    }
    const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
    const result = await rack_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Rack status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update shelf status
const updateShelfStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValue = status.toLowerCase();
    if (statusValue !== "enable" && statusValue !== "disable") {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Invalid status value. Must be 'Enable' or 'Disable'.",
      });
    }
    const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
    const result = await shelf_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Shelf status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Update cell status
const updateCellStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValue = status.toLowerCase();
    if (statusValue !== "enable" && statusValue !== "disable") {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "Invalid status value. Must be 'Enable' or 'Disable'.",
      });
    }
    const normalizedStatus = statusValue === "enable" ? "Enable" : "Disable";
    const result = await cell_collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: normalizedStatus } });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: result,
      message: "Cell status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getFilteredRacks = async (req, res, next) => {
  try {
    const { areaId, warehouseId } = req.query;
    if (!areaId || !warehouseId) {
      return response_sender({ res, status_code: 400, error: true, message: "areaId and warehouseId are required" });
    }
    const match = {
      areaId: new ObjectId(areaId),
      warehouseId: new ObjectId(warehouseId)
    };
    const racks = await rack_collection.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "warehouse",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $unwind: "$warehouse",
      },
      {
        $lookup: {
          from: "area",
          localField: "areaId",
          foreignField: "_id",
          as: "area",
        },
      },
      {
        $unwind: {
          path: "$area",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: "$description",
          warehouse: "$warehouse.name",
          area: { $ifNull: ["$area.description", ""] },
          areaId: "$areaId",
          status: { $ifNull: ["$status", "Enable"] },
          _id: 1,
        },
      },
    ]).toArray();
    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: racks,
      message: "Filtered racks fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addWarehouse,
  addArea,
  addRack,
  addShelf,
  addCell,
  getWarehouses,
  getAreas,
  getRacks,
  getFilteredRacks,
  getShelfs,
  getCells,
  updateArea,
  updateRack,
  updateShelf,
  updateCell,
  updateAreaStatus,
  updateRackStatus,
  updateShelfStatus,
  updateCellStatus,
  deleteArea,
  deleteRack,
  deleteShelf,
  deleteCell,
  updateWarehouseDetails,
  updateWarehouse,
  deleteWarehouse,
  updateWarehouseStatus,
  getWarehouseDetails,
};
