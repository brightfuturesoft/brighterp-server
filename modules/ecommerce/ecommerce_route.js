const express = require('express');
const router = express.Router();
const order_router = require('./orders/order_route');
const coustomer_router = require('./customers/customers_route');
const carts_router = require('./cart/cart_route');
const banners_router = require('./banners/banners_route');
const contacts_router = require('./contact/contact_route');
const blogs_router = require('./blogs/blogs_route');
const blogs_category = require('./blog_category/blog_category_route');
const coupon_router = require('./coupon/coupon_route');
const policy_router = require('./policy/policy_route');
const partnership_brands_router = require('./policy/policy_route');

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
      },{
            path:"/contacts",
            route:contacts_router
      },{
            path:'/blogs',
            route:blogs_router
      },{
            path:'/blog-category',
            route:blogs_category
      },{
            path:'/coupon',
            route:coupon_router
      },{
            path:'/policy',
            route:policy_router
      },{
            path:'/partnership_brands',
            route:partnership_brands_router
      }
];

modules_Routes.forEach(route => router.use(route.path, route.route));
module.exports = router;
