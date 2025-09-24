const express = require('express');
const router = express.Router();
const newsletter_router = require('./newsletter/newsletter_route');


const modules_Routes = [
      {
            path: '/direct_sale',        
            route: newsletter_router,
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
