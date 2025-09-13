const express = require('express');
const router = express.Router();
const order_router = require('./orders/order_route');

const modules_Routes = [
      {
            path: '/orders',        
            route: order_router,
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
