const express = require("express");
const { get_and_update_order_id, get_product_for_pos } = require("./pos_module");
const { check_user } = require("../../hooks/check_user");
const orders_router = require("./orders/orders_router");
const router = express.Router();


router.use("/order", orders_router);
router.get("/get-and-update-order-id", check_user, get_and_update_order_id);
router.get("/get-product-for-pos", check_user, get_product_for_pos);


module.exports = router;
