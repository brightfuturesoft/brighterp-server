const express = require('express');
const router = express.Router();
const order_router = require('./orders/order_route');
const coustomer_router = require('./customers/customers_route');
const carts_router = require('./cart/cart_route');
const banners_router = require('./banners/banners_route');

const modules_Routes = [
      {
            path: '/orders',        
            route: order_router,
      },{
            path: '/customers',        
            route: coustomer_router, 
      },
      {
            path:'/carts',
            route:carts_router
      },{
            path:"/banners",
            route:banners_router
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
