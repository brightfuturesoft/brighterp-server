const express = require('express');
const router = express.Router();
const item_router = require('./items/items_router');
const category_router = require('./categories/category_router');
const brand_router = require('./brand/brand_router');
const color_router = require('./color/color_router');
const size_router = require('./size_type/size_router');
const attribute_router = require('./attribute_set/attribute_router');
const manufacturer_router = require('./manufacturer/manufacture_router');


// Define module routes
const modulesRoutes = [
      {
            path: '/item',         // Default path
            route: item_router,
      },
      {
            path: '/category',    // Image routes
            route: category_router,
      },
      {
            path: '/brand',      // Auth routes
            route: brand_router,
      },
      {
            path: '/color',      // Items routes
            route: color_router,
      },
      {
            path: '/size',      // Items routes
            route: size_router,
      },
      {
            path: '/attribute',      // Items routes
            route: attribute_router,
      },
      {
            path: '/manufacturer',      // Items routes
            route: manufacturer_router,
      },
      {
            path: '/size',      // Items routes
            route: size_router,
      }
];

// Attach each route to the main router
modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
