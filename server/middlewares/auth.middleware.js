import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isLoggedIn = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new AppError("Please login", 400));

  const userDetails = jwt.verify(token, process.env.JWT_SECRET);
  req.user = userDetails;
  next();
};

const authorizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRoles = req.user.role;
    if (!roles.includes(currentUserRoles))
      return next(
        new AppError("You don't have permission for this operation", 400)
      );
    next();
  };

const authorizeSubscriber = async (req, res, next) => {
  const { role, subscription } = req.user;
  if (role !== "ADMIN" && subscription.status !== "active")
    return next(new AppError("Please subscribe to access this route", 403));

  next();
};

export { isLoggedIn, authorizedRoles, authorizeSubscriber };
