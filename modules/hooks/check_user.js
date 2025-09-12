const { ObjectId } = require("mongodb");
const { user_collection } = require("../../collection/collections/auth");
const { response_sender } = require("./respose_sender");

const check_user = async (req, res, next) => {
      try {
            const user_id = req.headers.authorization;
            if (!user_id) {
                  return response_sender({
                        res,
                        status_code: 401,
                        error: true,
                        data: null,
                        message: "User Token is required.",
                  });
            }
            const user_validation = await user_collection.findOne({ _id: new ObjectId(user_id) });
            if (!user_validation) {
                  return response_sender({
                        res,
                        status_code: 401,
                        error: true,
                        data: null,
                        message: "User not found.",
                  });
            }
            next();
      }
      catch (error) {
            next(error);
      }
};

module.exports = { check_user };
