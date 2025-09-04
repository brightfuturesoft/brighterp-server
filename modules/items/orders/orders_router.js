const express = require("express");
const router = express.Router();

const { check_user } = require("../../hooks/check_user");
const {
  create_order,
  get_orders,
  update_order,
  delete_order,
  get_transaction_id,
} = require("./orders_module");

router.post("/create-order", check_user, create_order);
router.get("/get-orders", check_user, get_orders);
router.put("/update-order", check_user, update_order);
router.delete("/delete-order", check_user, delete_order);
router.get("/get-transaction-id", check_user, get_transaction_id);

module.exports = router;
