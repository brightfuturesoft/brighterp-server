const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const httpStatus = require("http-status");
const { GlobalHandler } = require("./modules/hooks/golobal_error");
const routes = require("./routers/router");
const path = require("path");

const app = express();
const port = process.env.PORT || 5005;

app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true,
}));



// CORS configuration
const corsOptions = {
      origin:
            process.env.NODE_ENV === 'development'
                  ? [
                        'http://localhost:3000',
                        'http://localhost:5173',
                        'http://127.0.0.1:3000',
                        'http://192.168.0.101:3000',
                  ]
                  : ['https://brighterpserver.vercel.app'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "index.html"));
});
// Routes
app.use('/api/v1', routes);

// Root route


// Error handling middleware
app.use(GlobalHandler);

// 404 Error handler
app.use((req, res, next) => {
      res.status(httpStatus.NOT_FOUND).json({
            error: true,
            message: 'Not Found',
            path: req.originalUrl,
            request_id: new Date().getTime(),
            status_code: 404
      });
});

// Import cron jobs here
require("./modules/hrm/attendance/corn_job");

// Start server
app.listen(port, () => {
      console.log(`Example app listening at : ` + `http://localhost:${port}`);
});
