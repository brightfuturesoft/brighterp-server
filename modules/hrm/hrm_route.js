const express = require('express');
const router = express.Router();
const employees_router=require('./employees/employees_route')

// Define module routes
const modulesRoutes = [
      {
            path: '/employees',
            route: employees_router,
      }
];

// Attach each route to the main router
modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;