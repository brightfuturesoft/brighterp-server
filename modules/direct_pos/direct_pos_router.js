const express = require('express');
const router = express.Router();
const outlet_router = require('./outlet/outlet_route');
const order_router = require('./order/order_route');

const modules_Routes = [
      {
            path: '/outlets',        
            route: outlet_router,
      },{
            path:'/orders',
            route:order_router
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
