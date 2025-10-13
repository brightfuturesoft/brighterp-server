const express = require('express');
const multer = require('multer');
const {
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
} = require('./ware_house_module');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all warehouses
router.get("/", getWarehouses);

// Get all areas
router.get("/areas", getAreas);

// Get all racks
router.get("/racks", getRacks);

// Get all shelfs
router.get("/shelfs", getShelfs);

// Get all cells
router.get("/cells", getCells);

router.get("/racks/filtered", getFilteredRacks);

router.post("/warehouse", upload.single("image"), addWarehouse);
router.post("/area", addArea);
router.post("/rack", addRack);
router.post("/shelf", addShelf);
router.post("/cell", addCell);

router.put("/area/:id", updateArea);
router.put("/rack/:id", updateRack);
router.put("/shelf/:id", updateShelf);
router.put("/cell/:id", updateCell);

router.put("/area/:id/status", updateAreaStatus);
router.put("/rack/:id/status", updateRackStatus);
router.put("/shelf/:id/status", updateShelfStatus);
router.put("/cell/:id/status", updateCellStatus);

// New combined update endpoint
router.put("/updateWarehouseDetails", updateWarehouseDetails);

router.delete("/area/:id", deleteArea);
router.delete("/rack/:id", deleteRack);
router.delete("/shelf/:id", deleteShelf);
router.delete("/cell/:id", deleteCell);

router.put("/warehouse/:id", upload.single("image"), updateWarehouse);
router.delete("/warehouse/:id", deleteWarehouse);
router.put("/warehouse/:id/status", updateWarehouseStatus);
router.get("/warehouse/:id/details", getWarehouseDetails);

module.exports = router;
