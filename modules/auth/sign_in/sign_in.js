const { ObjectId } = require("mongodb");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { response_sender } = require("../../hooks/respose_sender");
const { user_collection, workspace_collection } = require("../../../collection/collections/auth");

const ENCRYPTION_KEY = process.env.COOKIE_SECRET_KEY || '12345678901234567890123456789012'; // Replace with env variable in production!
const IV_LENGTH = 16; // AES block size for CBC mode

function encrypt(text) {
      let iv = crypto.randomBytes(IV_LENGTH);
      let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let encrypted = cipher.update(text, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(encryptedText) {
      let [ivHex, encryptedHex] = encryptedText.split(':');
      let iv = Buffer.from(ivHex, 'hex');
      let encrypted = Buffer.from(encryptedHex, 'hex');
      let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
}

const sign_in = async (req, res, next) => {
      try {
            const input_data = req.body;

            // Validate that necessary fields are present
            if (!input_data.email || !input_data.password) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        data: null,
                        message: "Email and password are required.",
                  });
            }

            // Find the user by email
            const find_user = await user_collection.findOne({ email: input_data.email });

            if (!find_user) {
                  return response_sender({
                        res,
                        status_code: 400,
                        error: true,
                        data: null,
                        message: "Email is not registered.",
                  });
            }

            const isPasswordValid = await bcrypt.compare(input_data.password, find_user.password);
            if (!isPasswordValid) {
                  return response_sender({
                        res,
                        status_code: 401,
                        error: true,
                        data: null,
                        message: "Password is incorrect. Please try again.",
                  });
            }


            // If the user is found and the password is valid, fetch the workspace
            const workspace = await workspace_collection.findOne({ _id: new ObjectId(find_user.workspace_id) });

            // Remove password from user data
            const { password, ...userData } = find_user;

            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: {
                        user: userData,
                        workspace
                  },
                  message: "User signed in successfully.",
            });

      } catch (error) {
            next(error);
      }
};



const sign_out = async (req, res, next) => {



      try {
            res.clearCookie('erp_user');
            res.clearCookie('erp_workspace');
            return response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  data: null,
                  message: "User signed out successfully.",
            });

      } catch (error) {
            next(error);
      }
};

module.exports = {
      sign_in, sign_out
};
