const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  workspace_collection,
  user_collection,
  password_backup,
  otp_collection,
} = require("../../../collection/collections/auth");
const { response_sender } = require("../../hooks/respose_sender");
const send_email = require("../../../mail/send_email");
const generateVerificationEmail = require("../../../mail/template/vericicationmail");
const { ObjectId } = require("mongodb");

// Encryption function
const encrypt = (text) => {
  const algorithm = "aes-256-ctr"; // Choose an encryption algorithm
  const secretKey = crypto.randomBytes(32); // Generate a secure 32-byte key for AES-256
  const iv = crypto.randomBytes(16); // Generate an initialization vector

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv); // Create the cipher
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]); // Encrypt the text

  // Return the IV and encrypted data as a hex string along with the secret key
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
    secretKey: secretKey.toString("hex"), // Store this securely
  };
};

const create_a_workspace = async (req, res, next) => {
  try {
    const user_data = req.body.user;
    const workspace_data = req.body.workSpace; 

    if (!user_data.email || !workspace_data.name) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Email and workspace name are required.",
      });
    }

    const find_user = await user_collection.findOne({ email: user_data.email });
    if (find_user) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "User already exist.",
      });
    }

    const created_workspace = await create_workspace(workspace_data);
    user_data.workspace_id = created_workspace.insertedId.toString();
    const created_user = await create_user(user_data);

    const encryptedUserId = encrypt(created_user.insertedId.toString());

    await send_email({
      email: user_data.email,
      subject: "Verify your email | Bright ERP",
      text: "Verify your email | Bright ERP",
      html: generateVerificationEmail(
        user_data.name,
        workspace_data.name,
        `http://localhost:5173/verify-account/${created_user.insertedId}`
      ),
    });

    response_sender({
      res,
      status_code: 200,
      error: false,
      data: null,
      message: "Workspace created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const create_user = async (data) => {
  if (!data) {
    throw new Error("User data is required");
  }

  // Ensure password exists in the data
  const password = data.password;
  if (!password) {
    throw new Error("Password is required");
  }

  const user_data = {
    ...data,
    password: password,
  };

  await password_backup.insertOne(user_data);

  const saltRounds = 10; // You can adjust the salt rounds for security vs. performance
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = {
    ...data,
    password: hashedPassword, // Store the hashed password instead of the plain one
    created_at: new Date(),
    updated_at: new Date(),
    role: "workspace_admin",
    is_active: false,
  };

  const created_user = await user_collection.insertOne(user);
  return created_user;
};

const create_workspace = async (data) => {
  if (!data) {
    throw new Error("Workspace data is required");
  }

  const workspace = {
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
    description: "",
    is_active: true,
    permissions: [],
    address_info: {
      country: "",
      state: "",
      city: "",
      zip_code: "",
      address: "",
    },
    basic_info: {
      name: data.name,
      description: "",
      legal_name: data.name,
      registration_number: "",
      vat_number: "",
      industry: "",
    },
    contact_info: {
      official_email: "",
      support_email: "",
      phone_number: [""],
      fax_number: "",
    },
    social_info: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      whatsapp: "",
      telegram: "",
    },
    domain_info: {
      domain: "",
      subdomain: "",
    },

    message_info: {
      message_chat: false,
      whatsapp: false,
      messenger: false,
      phone_number: false,
    },
  };

  const created_workspace = await workspace_collection.insertOne(workspace);
  return created_workspace;
};

const verify_user = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "User ID is required.",
      });
    }
    const user = await user_collection.findOne({ _id: new ObjectId(token) });
    if (!user) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "User not found.",
      });
    }
    await user_collection.updateOne(
      { _id: user._id },
      { $set: { is_active: true } }
    );
    response_sender({
      res,
      status_code: 200,
      error: false,
      data: null,
      message: "User verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const check_workspace_by_unique_id = async (req, res, next) => {
  try {
    const unique_id = req.query.unique_id;
    console.log(unique_id);

    if (!unique_id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Unique ID is required.",
      });
    }

    const workspace = await workspace_collection.findOne({
      "domain_info.domain": unique_id,
    });
    console.log(workspace);
    if (!workspace) {
      return response_sender({
        res,
        status_code: 404,
        error: false,
        data: { available: false },
        message: "Workspace is not available.",
      });
    }
    response_sender({
      res,
      status_code: 200,
      error: false,
      data: workspace,
      message: "Workspace is navailable.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_a_workspace,
  verify_user,
  check_workspace_by_unique_id,
};
