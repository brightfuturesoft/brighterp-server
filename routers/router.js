const express = require('express');
const router = express.Router();
const image_router = require('../modules/image/image_router');  
const initial_route = require('../modules/hooks/initial_route'); 
const auth_router = require('../modules/auth/auth_router');
const item_router = require('../modules/items/item_router'); 
const ecommerce_router = require('../modules/ecommerce/ecommerce_route'); 

const modulesRoutes = [
      {
            path: '/',         
            route: initial_route,
      },
      {
            path: '/image',    
            route: image_router,
      },
      {
            path: '/auth',      
            route: auth_router,
      },
      {
            path: '/items',      
            route: item_router,
      },
      {
            path:'/ecommerce',
            route:ecommerce_router
      }
];

modulesRoutes.forEach(route => router.use(route.path, route.route));
module.exports = router;
