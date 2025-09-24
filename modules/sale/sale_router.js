const express = require('express');
const router = express.Router();
const newsletter_router = require('./direct_sale/direct_sale_route');
const quataions_router = require('./quataions/quations_route');


const modules_Routes = [
      {
            path: '/direct_sale',        
            route: newsletter_router,
      },{
            path:"/quataions",
            route:quataions_router
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
