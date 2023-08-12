import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.utils.js";
import crypto from "crypto";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return next(new AppError("All the fields are required", 400));

  const userExists = await User.findOne({ email });
  if (userExists) return next(new AppError("Email is already registered", 400));

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        "https://www.oberlo.com/media/1603969791-image-1.jpg?fit=max&fm=jpg&w=1824",
    },
  });
  if (!user)
    return next(
      new AppError("Sorry! User registration failed, Please try again later"),
      400
    );

  // TODO: FILE UPLOAD
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250, // in px
        height: 250,
        gravity: "faces",
        crop: "fill",
      });
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // remove from local server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(new AppError(error, 500));
    }
  }

  await user.save();
  user.password = undefined;

  const token = await user.generateJWTToken(user.id, email);

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError("All fields are mandatory", 400));

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password, user.password))
      return next(new AppError("User credentials are invalid", 400));

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
const logout = async (req, res, next) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: "User details:",
      user,
    });
  } catch (error) {
    return next(new AppError("Fetching of user details failed", 400));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email should not be empty", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Email is not registered", 400));

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

  try {
    await sendEmail(
      email,
      "Reset password",
      `Open the link to reset your password ${resetUrl}`
    );

    res.status(200).json({
      success: true,
      message: `Email has been sent to ${email} successfully`,
    });
  } catch (error) {
    user.forgetPasswordExpiry = undefined;
    user.forgetPasswordToken = undefined;
    await user.save();

    return next(new AppError(error.message, 400));
  }
};

const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const forgetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    forgetPasswordToken,
    forgetPasswordExpiry: { $gt: Date.now() }, // expiry should greater than current time
  });
  if (!user) return next(new AppError("Reset password link has expired!", 400));

  user.password = password;
  user.forgetPasswordExpiry = undefined;
  user.forgetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Reset password done successfully",
  });
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if (!oldPassword || !newPassword)
    return next(new AppError("All fields are mandatory", 400));
  const user = await User.findById(id).select("+password");
  if (!user) return next(new AppError("User not found", 400));

  const isPasswordValid = user.comparePassword(oldPassword, user.password);
  if (!isPasswordValid)
    return next(new AppError("Please enter valid old password", 400));

  user.password = newPassword;
  await user.save();

  user.password = undefined;
  res.status(200).json({
    success: true,
    message: "Password has been changed successfully",
  });
};

const updateUser = async (req, res, next) => {
  const { fullName } = req.body;
  const { id } = req.user;
  console.log("ID IS ", id)
  const user = await User.findById(id);
  if (!fullName) return next(new AppError("Enter the fullname", 400));
  if (!user) return next(new AppError("user not found", 400));

  if (user) {
    user.fullName = fullName;
  }

  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250, // in px
        height: 250,
        gravity: "faces",
        crop: "fill",
      });
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // remove from local server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(new AppError(error, 500));
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "User details updated successfully",
  });
};

export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
};
