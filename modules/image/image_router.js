const express = require("express");
const multer = require("multer");
const { get_image_by_id, upload_image } = require("./image_module");
const router = express.Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define route to get image by ID
router.get("/:id", get_image_by_id);
router.put("/upload-image", upload.single("image"), upload_image);

module.exports = router;
