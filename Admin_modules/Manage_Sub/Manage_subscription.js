const { subscription_collection } = require("../../collection/collections/admin/admin_collection");
const { response_sender } = require("../../modules/hooks/respose_sender");

const create_subscription = async (req, res, next) => {
      try {
            const data = req.body;
            console.log(data);
            const subscription = await subscription_collection.insertOne(data);
            response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: subscription,
                  message: "Subscription created successfully.",
            })
      } catch (error) {
            next(error);
      }
}

const get_all_subscription = async (req, res, next) => {
      try {
            const subscription = await subscription_collection.find({}).toArray();
            response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: subscription,
                  message: "Subscription list.",
            })
      } catch (error) {
            next(error);
      }
}


module.exports = { create_subscription, get_all_subscription };
