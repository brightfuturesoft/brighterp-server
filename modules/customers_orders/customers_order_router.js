const express = require('express');
const router = express.Router();


const pos_router = require('./pos/pos_router');
const e_commerce_router = require('./e-commarce/e_commarce_router');



const modulesRoutes = [
      {
            path: '/pos',
            route: pos_router,
      },
      {
            path: '/e-commerce',
            route: e_commerce_router,
      },

];


modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
