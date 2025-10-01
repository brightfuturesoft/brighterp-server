const { ObjectId } = require("mongodb");
const { response_sender } = require("../../hooks/respose_sender");
const { item_collection } = require("../../../collection/collections/item/items");
const { workspace_collection, user_collection } = require("../../../collection/collections/auth");
const { warehouse_collection } = require("../../../collection/collections/warehouse");

// Helper function to calculate status
const calculateStatus = (quantity) => {
  if (quantity === 0) return "StockOut";
  if (quantity < 10) return "LowestStock";
  if (quantity < 50) return "AverageStock";
  return "GoodStock";
};

// Get stock summary
const getStockSummary = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;

    // Fetch items
    const items = await item_collection.find({
      workspace_id: workspace_id,
      delete: { $ne: true }
    }).toArray();

    // Calculate summary
    const summary = {
      GoodStock: { variations: 0, totalQTY: 0, value: 0 },
      AverageStock: { variations: 0, totalQTY: 0, value: 0 },
      LowestStock: { variations: 0, totalQTY: 0, value: 0 },
      StockOut: { variations: 0, totalQTY: 0, value: 0 }
    };

    items.forEach(item => {
      const status = calculateStatus(item.quantity || 0);
      summary[status].variations += 1;
      summary[status].totalQTY += item.quantity || 0;
      summary[status].value += (item.quantity || 0) * (item.price || 0);
    });

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: summary,
      message: "Stock summary fetched successfully."
    });
  } catch (error) {
    next(error);
  }
};

// Get stock items with optional status filter
const getStockItems = async (req, res, next) => {
  try {
    const workspace_id = req.headers.workspace_id;
    const { status } = req.query; // Optional filter

    // Fetch items
    let query = {
      workspace_id: workspace_id,
      delete: { $ne: true }
    };

    const items = await item_collection.find(query).toArray();

    // Get unique IDs for joins
    const workspaceIds = [...new Set(items.map(item => item.workspace_id))];
    const userIds = [...new Set(items.map(item => item.created_by))];
    const warehouseIds = [...new Set(items.map(item => item.warehouse_id))];

    // Fetch related data
    const workspaces = await workspace_collection.find({ _id: { $in: workspaceIds.map(id => new ObjectId(id)) } }).toArray();
    const users = await user_collection.find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }).toArray();
    const warehouses = await warehouse_collection.find({ _id: { $in: warehouseIds.map(id => new ObjectId(id)) } }).toArray();

    // Create maps for quick lookup
    const workspaceMap = workspaces.reduce((map, ws) => { map[ws._id.toString()] = ws.name; return map; }, {});
    const userMap = users.reduce((map, user) => { map[user._id.toString()] = user.email; return map; }, {});
    const warehouseMap = warehouses.reduce((map, wh) => { map[wh._id.toString()] = wh.name; return map; }, {});

    // Format items
    const formattedItems = items.map(item => {
      const itemStatus = calculateStatus(item.quantity || 0);
      if (status && itemStatus !== status) return null; // Filter if status provided

      return {
        product: item.name,
        image: item.image,
        seller: userMap[item.created_by] || "Unknown",
        shop: workspaceMap[item.workspace_id] || "Unknown",
        quantity: `Total ${item.quantity || 0}`,
        price: item.price || 0,
        status: itemStatus,
        warehouse: warehouseMap[item.warehouse_id] || "Unknown"
      };
    }).filter(item => item !== null);

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: formattedItems,
      message: "Stock items fetched successfully."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockSummary,
  getStockItems
};
