const express = require("express");
const all_store_router = require("./Manage_shop/Manage_shop_router");
const subscription_router = require("./Manage_Sub/Manage_subscription_router");
const router = express.Router();

const modulesRoutes = [
      {
            path: '/get-all-shop',         // Default path
            route: all_store_router,
      },
      {
            path: '/subscription',         // Default path
            route: subscription_router,
      },
]

modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
