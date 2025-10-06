const express = require('express');
const router = express.Router();
const steedfast_router = require('./steedfast/steedfast_route');
const pathao_router = require('./pathao/pathao_route');


const modules_Routes = [
      {
            path: '/steedfast',        
            route: steedfast_router,
      },{
            path:"/pathao",
            route:pathao_router
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
