import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";

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

export { register, login, logout, getProfile };
