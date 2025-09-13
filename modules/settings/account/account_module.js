const { ObjectId } = require("mongodb");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { response_sender } = require("../../hooks/respose_sender");
const { user_collection } = require("../../../collection/collections/auth");
const send_email = require("../../../mail/send_email");
const sharp = require('sharp');


const OTP_EXPIRY = 5 * 60 * 1000;

// --- Auth Controllers ---



const change_password = async (req, res, next) => {
  try {
    const { email, current_password, new_password } = req.body;

    if (!email || !current_password || !new_password) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "Email, current password, and new password are required.",
      });
    }

    const find_user = await user_collection.findOne({ email });
    if (!find_user) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "User not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(current_password, find_user.password);
    if (!isPasswordValid) {
      return response_sender({
        res,
        status_code: 401,
        error: true,
        data: null,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user_collection.updateOne(
      { _id: find_user._id },
      { $set: { password: hashedPassword, updated_at: new Date() } }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: null,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// --- 2FA Controllers ---

const enable_2fa = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return response_sender({ res, status_code: 400, error: true, message: "User ID is required." });
    }

    const user = await user_collection.findOne({ _id: new ObjectId(user_id) });
    if (!user) {
      return response_sender({ res, status_code: 404, error: true, message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await user_collection.updateOne(
      { _id: user._id },
      {
        $set: {
          twoFAEnabled: true,
          twoFAOtp: otp,
          twoFAOtpExpiry: new Date(Date.now() + OTP_EXPIRY),
        },
      }
    );

    await send_email({
      email: user.email,
      subject: "Your 2FA OTP for Bright ERP",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<p>Hello ${user.name},</p><p>Your OTP for 2FA is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });

    return response_sender({ res, status_code: 200, error: false, message: "2FA enabled. OTP sent to your email." });
  } catch (err) {
    next(err);
  }
};

const verify_2fa = async (req, res, next) => {
  try {
    const { user_id, token } = req.body;
    if (!user_id || !token) {
      return response_sender({ res, status_code: 400, error: true, message: "User ID and OTP token are required." });
    }

    const user = await user_collection.findOne({ _id: new ObjectId(user_id) });
    if (!user || !user.twoFAEnabled) {
      return response_sender({ res, status_code: 400, error: true, message: "2FA is not enabled for this user." });
    }

    if (!user.twoFAOtp || !user.twoFAOtpExpiry) {
      return response_sender({ res, status_code: 400, error: true, message: "No OTP generated. Please enable 2FA first." });
    }

    if (new Date() > user.twoFAOtpExpiry) {
      return response_sender({ res, status_code: 400, error: true, message: "OTP has expired. Please request a new one." });
    }

    if (user.twoFAOtp !== token) {
      return response_sender({ res, status_code: 400, error: true, message: "Invalid OTP." });
    }

    // ✅ Verified: keep twoFAEnabled true, clear OTP fields
    await user_collection.updateOne(
      { _id: user._id },
      { $set: { twoFAEnabled: true }, $unset: { twoFAOtp: "", twoFAOtpExpiry: "" } }
    );

    return response_sender({ res, status_code: 200, error: false, message: "2FA verified successfully." });
  } catch (err) {
    next(err);
  }
};

const disable_2fa = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return response_sender({ res, status_code: 400, error: true, message: "User ID is required." });
    }

    await user_collection.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { twoFAEnabled: false }, $unset: { twoFAOtp: "", twoFAOtpExpiry: "" } }
    );

    return response_sender({ res, status_code: 200, error: false, message: "2FA disabled successfully." });
  } catch (err) {
    next(err);
  }
};

const get_2fa_status = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        data: null,
        message: "User ID is required.",
      });
    }

    const user = await user_collection.findOne({ _id: new ObjectId(user_id) });

    if (!user) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        data: null,
        message: "User not found.",
      });
    }

    return response_sender({
      res,
      status_code: 200,
      error: false,
      data: { twoFAEnabled: !!user.twoFAEnabled },
      message: "2FA status fetched successfully.",
    });
  } catch (err) {
    next(err);
  }
};

const update_profile_info = async (req, res, next) => {
  try {
    const { user_id, name, phone, email } = req.body;
    const imageFile = req.file;

    if (!user_id) {
      return response_sender({
        res,
        status_code: 400,
        error: true,
        message: "User ID is required."
      });
    }

    const user = await user_collection.findOne({ _id: new ObjectId(user_id) });
    if (!user) {
      return response_sender({
        res,
        status_code: 404,
        error: true,
        message: "User not found."
      });
    }

    let updateData = { updated_at: new Date() };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    // Handle image upload using image module
    if (imageFile) {
      const mimeType = imageFile.mimetype;

      if (!["image/jpeg", "image/jpg", "image/png"].includes(mimeType)) {
        return response_sender({ res, status_code: 400, error: true, message: "Unsupported image format" });
      }

      // Use image module to upload image
      const { image_collection } = require("../../../collection/collections/image_collection");
      
      let sharpInstance = sharp(imageFile.buffer).resize({ width: 300 });
      let compressedBuffer;

      if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
        compressedBuffer = await sharpInstance.jpeg({ quality: 90 }).toBuffer();
      } else if (mimeType === "image/png") {
        compressedBuffer = await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
      }

      // Store image in image collection
      const imageResult = await image_collection.insertOne({
        image: compressedBuffer,
        createdAt: new Date(),
        title: `profile_${user_id}`,
        userId: user._id
      });

      // Store image URL in user profile (using the same format as image module)
      const fileExtension = mimeType.split("/")[1];
      const imageUrl = `${process.env.SERVER_URL}/image/${imageResult.insertedId}.${fileExtension}`;
      updateData.profile_image_url = imageUrl;
      updateData.avatar = imageUrl; // Also set avatar field for compatibility
    }

    await user_collection.updateOne({ _id: user._id }, { $set: updateData });

    // Fetch updated user data to return
    const updatedUser = await user_collection.findOne(
      { _id: user._id },
      { projection: { password: 0, profile_image: 0 } }
    );

    return response_sender({
      res,
      status_code: 200,
      error: false,
      message: "Profile updated successfully.",
      data: { user: updatedUser }
    });

  } catch (err) {
    next(err);
  }
};
module.exports = {
  update_profile_info,
  change_password,
  enable_2fa,
  verify_2fa,
  disable_2fa,
  get_2fa_status,
};
