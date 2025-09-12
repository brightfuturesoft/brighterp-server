const { ObjectId } = require("mongodb");
const { user_collection } = require("../../collection/collections/auth");
const { response_sender } = require("./respose_sender");

const check_user = async (req, res, next) => {
      try {
            // Extract token from Authorization header (Bearer token)
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                  return response_sender({
                        res,
                        status_code: 401,
                        error: true,
                        data: null,
                        message: "Unauthorized",
                  });
            }
            // Assuming Bearer token format: "Bearer <token>"
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

            // Validate token as user_id (or decode token if JWT)
            const user_id = token;

            if (!user_id) {
                  return response_sender({
                        res,
                        status_code: 401,
                        error: true,
                        data: null,
                        message: "Unauthorized",
                  });
            }
            const user_validation = await user_collection.findOne({ _id: new ObjectId(user_id) });
            if (!user_validation) {
                  return response_sender({
                        res,
                        status_code: 401,
                        error: true,
                        data: null,
                        message: "Unauthorized",
                  });
            }
            // Attach user object to req.user for downstream use
            req.user = user_validation;
            next();
      }
      catch (error) {
            next(error);
      }
};

module.exports = { check_user };
