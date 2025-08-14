# Bright ERP Server (Ecommerce Edition)

**Bright ERP Server** is a robust backend system developed by **Bright Future Soft**, tailored for managing Ecommerce businesses efficiently. It serves as the core API layer for the Bright ERP platform—handling everything from user authentication to product, order, inventory, and financial management.

---

## 🚀 Core Features

- 🔐 Secure JWT-based Authentication & Role-based Access Control
- 👤 User, Staff, and Customer Management
- 🛍️ Product Catalog with Variants, Categories, Brands
- 📦 Inventory and Stock Management
- 🧾 Order Management (Cart → Checkout → Payment → Fulfillment)
- 💰 Invoice, Tax, and Payment Integration
- 📊 Sales Reports and Dashboard Insights
- 📬 Email/SMS Notification Support
- 🌐 RESTful API – Ready for Web & Mobile Clients
- 🏢 Multi-branch / Multi-vendor Support (Optional)


## 📁 Project Structure

```
bright-erp-server/
│
├── collection/
│   ├── collections/
│   │   ├── auth.js
│   │   ├── image_collection.js
│   ├── uri.js
├── mail
│   ├── config.js
├── modules/
│   ├── auth/
│   │   ├── sign_in/
│   │   │   ├── sign_in.js
│   │   ├── sign_up/
│   │   │   ├── sign_up.js
│   │   ├── auth_router.js
│   │
│   │
│   ├── hooks/
│   │   ├── response_sender.js
│   ├── ├── global_error_handler.js
│   ├── ├── handleZodError.js
│   ├── ├── initial_route.js
│   │
│   ├── images/
│   │   ├── image_module.js
│   │   ├── image_router.js
│   │
│   ├── routers/
│   │   ├── router.js
│   │
├── .env
├── .gitignore
├── index.js
├── package.json
└── README.md

```



##  Setup Instructions

**Clone the repository**
   ```bash
   git clone https://github.com/codewithmahadihasan/b_erp_server.git
   cd b_erp_server
```

**Install dependencies**

   ```bash
   npm install
   ```

**Set up `.env`**

   ```env
MONGO_URI=
PORT=
SERVER_URL
NODE_ENV=

   ```

**Start the server**

   ```bash
   npm run dev || nodemon
   ```

---

## 📬 API Documentation

      

 ```bash
 🔗 Base URL: http://localhost:5005
 ```

---
