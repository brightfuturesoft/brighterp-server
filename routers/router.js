const express = require('express');
const router = express.Router();

const image_router = require('../modules/image/image_router');  // Adjust the path if necessary
const initial_route = require('../modules/hooks/initial_route'); // Adjust the path if necessary
const auth_router = require('../modules/auth/auth_router'); // Adjust the path if necessary
const item_router = require('../modules/items/item_router'); // Adjust the path if necessary
const coa_router = require('../modules/accounts/coa/coa_router')
const settings_router = require('../modules/settings/settings_router');
const customers_order_router = require('../modules/customers_orders/customers_order_router');
const customers_router = require('../modules/customers/customers_router');

// Define module routes
const modulesRoutes = [
      {
            path: '/',         // Default path
            route: initial_route,
      },
      {
            path: '/image',    // Image routes
            route: image_router,
      },
      {
            path: '/auth',      // Auth routes
            route: auth_router,
      },
      {
            path: '/items',      // Items routes
            route: item_router,
      },
      {
            path: "/coa",
            route: coa_router,
      },
      {
            path: '/settings',      // Consolidated settings routes
            route: settings_router,
      },
      {
            path: '/customers-order',      // Settings routes
            route: customers_order_router,
      },
      {
            path: '/customers',      // Settings routes
            route: customers_router,
      },
];

// Attach each route to the main router
modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
