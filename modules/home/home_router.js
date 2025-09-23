const express = require('express');
const router = express.Router();
const newsletter_router = require('./newsletter/newsletter_route');
const contact_router = require('./contact/contact_route');


const modules_Routes = [
      {
            path: '/newsletter',        
            route: newsletter_router,
      },{
            path:"/contact",
            route:contact_router
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
