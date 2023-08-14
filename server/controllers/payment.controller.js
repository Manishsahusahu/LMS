import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";

const getRazorpayApiKey = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Razorpay api key",
    key: process.env.RAZORPAY_KEY_ID,
  });
};
const buySubscription = async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findById(id);

  if (!user) return next(new AppError("Kindly login", 400));

  if (user.role === "ADMIN") {
    return next(new AppError("Admin cannot buy subscription", 400));
  }
  const subscription = await razorpay.subscriptions.create({
    plan_id: process.env.RAZORPAY_PLAN_ID,
    customer_notify: 1,
  });

  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  await user.save();

  res.status(200).json({
    success: true,
    message: "subscription is created",
    subscription_id: subscription.id,
  });
};
const verifySubscription = async (req, res, next) => {};
const cancelSubscription = async (req, res, next) => {};
const allPayments = async (req, res, next) => {};

export {
  getRazorpayApiKey,
  buySubscription,
  verifySubscription,
  cancelSubscription,
  allPayments,
};
