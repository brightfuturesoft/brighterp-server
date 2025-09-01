const express = require('express');
const router = express.Router();
const expense_router=require('./expense/expenses_route')


// Define module routes
const modulesRoutes = [
      
     {
      path: "/expense",
      route: expense_router,

     }
];

// Attach each route to the main router
modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
