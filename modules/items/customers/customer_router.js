const express = require("express");
const router = express.Router();

const { check_user } = require("../../hooks/check_user");
const {
  create_customer,
  get_customers,
  update_customer,
  delete_customer,
} = require("./customer_module");

router.post("/create-customer", check_user, create_customer);
router.get("/get-customers", check_user, get_customers);
router.put("/update-customer", check_user, update_customer);
router.delete("/delete-customer", check_user, delete_customer);

module.exports = router;
