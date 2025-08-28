const express = require('express');
const router = express.Router();


const account_router = require('./account/account_router');
const company_router = require('./company/company_route');
const general_router = require('./general/general_router');
const integration_router = require('./integrations/integration_router');
const payment_router = require('./payment/payment_router');
const shipping_router = require('./shipping/shiping_router');
const user_role_router = require('./user_role/user_role_router');


const modulesRoutes = [
      {
            path: '/account',
            route: account_router,
      },
      {
            path: '/company',
            route: company_router,
      },
      {
            path: '/general',
            route: general_router,
      },
      {
            path: '/integration',
            route: integration_router,
      },
      {
            path: '/payment',
            route: payment_router,
      },
      {
            path: '/shipping',
            route: shipping_router,
      },
      {
            path: '/user-role',
            route: user_role_router,
      },
];


modulesRoutes.forEach(route => router.use(route.path, route.route));

module.exports = router;
