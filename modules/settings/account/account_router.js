const express = require('express');
const multer = require('multer');
const {
  change_password,
  enable_2fa,
  verify_2fa,
  disable_2fa,
  get_2fa_status,
  update_profile_info, 
} = require('./account_module');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Auth & 2FA routes ---
router.post("/change-password", change_password);
router.post("/2fa/enable", enable_2fa);
router.post("/2fa/verify", verify_2fa);
router.post("/2fa/disable", disable_2fa);
router.get("/2fa/status", get_2fa_status);

// --- Profile update route ---
router.put("/update-profile", upload.single("image"), update_profile_info);

module.exports = router;
