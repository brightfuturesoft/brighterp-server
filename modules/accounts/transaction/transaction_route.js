const express = require('express');
const router = express.Router();
const journal_router=require('./journal/journal_route');


// Define module routes
const modulesRoutes = [
      {
            path: '/journal',
            route: journal_router,
      }
];

// Attach each route to the main router
modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
