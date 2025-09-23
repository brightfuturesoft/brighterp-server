const { workspace_collection } = require("../../collection/collections/auth");
const { response_sender } = require("../../modules/hooks/respose_sender");

const get_all_store = async (req, res, next) => {
      try {
            const all_store = await workspace_collection.find({}).toArray();
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: all_store,
                  message: "All store list",
            })
      } catch (error) {
            next(error);
      }
}



module.exports = { get_all_store };
