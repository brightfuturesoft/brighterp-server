const { ObjectId } = require("mongodb");
const { workspace_collection } = require("../../../collection/collections/auth");
const { response_sender } = require("../../hooks/respose_sender");

const update_company = async (req, res, next) => {
      try {
            const data = req.body;
            const workspace_id = req.headers.workspace_id;
            const find_workspace = await workspace_collection.findOne({ _id: new ObjectId(workspace_id) });
            if (!find_workspace) {
                  return response_sender({
                        res,
                        status_code: 404,
                        error: true,
                        data: null,
                        message: "Workspace not found.",
                  });
            }
            await workspace_collection.updateOne({ _id: new ObjectId(workspace_id) }, { $set: { ...data } });
            const company = await workspace_collection.findOne({ _id: new ObjectId(workspace_id) });
            response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: company,
                  message: "Company updated successfully.",
            });
      } catch (error) {
            next(error);
      }
}


const get_company_by_domain = async (req, res, next) => {
      try {
            const domain = req.headers.domain;

            const find_workspace = await workspace_collection.findOne({
                  $or: [
                        { "domain_info.domain": domain },
                        {
                              "domain_info.subdomain": domain
                        }
                  ]
            });

            if (!find_workspace) {
                  return response_sender({
                        res,
                        status_code: 404,
                        error: true,
                        data: null,
                        message: "Workspace not found.",
                  });
            }

            const company = await workspace_collection.findOne({
                  _id: new ObjectId(find_workspace.company_id)
            });

            response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: company,
                  message: "Company fetched successfully.",
            });
      } catch (error) {
            next(error);
      }
};




module.exports = {
      update_company,
      get_company_by_domain
}
