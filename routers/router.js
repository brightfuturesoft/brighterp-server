const express = require('express');
const router = express.Router();

const ecommerce_router = require('../modules/ecommerce/ecommerce_route');
const image_router = require('../modules/image/image_router');  // Adjust the path if necessary
const initial_route = require('../modules/hooks/initial_route'); // Adjust the path if necessary
const auth_router = require('../modules/auth/auth_router'); // Adjust the path if necessary
const item_router = require('../modules/items/item_router'); // Adjust the path if necessary
const transaction_route = require('../modules/accounts/transaction/transaction_route');
const hrm_route = require('../modules/hrm/hrm_route');
const coa_router = require('../modules/accounts/coa/coa_router')
const settings_router = require('../modules/settings/settings_router');
const customers_order_router = require('../modules/customers_orders/customers_order_router');
const customers_router = require('../modules/customers/customers_router');
const direct_pos_router = require('../modules/direct_pos/direct_pos_router');
const admin_router = require('../Admin_modules/Admin_router');
const home_router = require('../modules/home/home_router');
const sale_router = require('../modules/sale/sale_router');



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
            path: '/ecommerce',
            route: ecommerce_router
      },
      {
            path: '/direct-pos',
            route: direct_pos_router
      },
      {
            path: "/coa",
            route: coa_router,
      },
      {
            path: "/transaction",
            route: transaction_route,
      },
      {

            path: "/hrm",
            route: hrm_route,
      },
      {
            path: '/settings',
            route: settings_router,
      },
      {
            path: '/customers-order',
            route: customers_order_router,
      },
      {
            path: '/customers',
            route: customers_router,
      },
      {
            path: '/admin',
            route: admin_router,
      },
      {
            path:"/home",
            route:home_router
      },{
            path:"/sale",
            route:sale_router
      }

];

modulesRoutes.forEach(route => router.use(route.path, route.route));
module.exports = router;
