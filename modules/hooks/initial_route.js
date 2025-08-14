const express = require('express');
const router = express.Router();
const { response_sender } = require('./respose_sender'); // Ensure this is correct

// Define the route handler first
const initial_route = async (req, res, next) => {
     
      try {
            response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: null,
                  message: "API is up and running.",
            });
      } catch (error) {
            next(error);
      }
};

router.get("/", initial_route);

module.exports = router;
