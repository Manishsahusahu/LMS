import jwt from "jsonwebtoken";
import AppError from "../utils/error.util.js";

const isLoggedIn = (req, res, next) => {
//   console.log(res.cookie);
  const { token } = req.cookies;

  if (!token) return next(new AppError("Please login", 400));

  const userDetails = jwt.verify(token, process.env.JWT_SECRET);
  req.user = userDetails;
  next();
};

export { isLoggedIn };
