import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    fullName: {
      type: "String",
      required: [true, "Name should not be empty"],
      minLength: [5, "Name should be atleast 5 characters long"],
      maxLength: [50, "Name should be less than 50 characters"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: "String",
      required: [true, "Email cannot be empty"],
      lowercase: true,
      unique: [true, "Email is already registered"],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: "String",
      required: [true, "Password cannot be empty"],
      minLength: [8, "Password should be atleast 8 characters long"],
      select: false,
    },
    avatar: {
      public_id: {
        type: "String",
      },
      secure_url: {
        type: "String",
      },
    },
    role: {
      type: "String",
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    subscription: {
      id: String,
      status: String,
    },
    forgetPasswordToken: String,
    forgetPasswordExpiry: String,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods = {
  generateJWTToken() {
    return JWT.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },
  comparePassword: (plainTextPassword, encryptedPassword) => {
    return bcrypt.compare(plainTextPassword, encryptedPassword);
  },
  generatePasswordResetToken: function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    const encyptedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.forgetPasswordToken = encyptedToken;
    console.log("inital encrypted token to database", this.forgetPasswordToken);
    console.log("inital token to database", resetToken);
    this.forgetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15min from now

    return resetToken;
  },
};

export default model("User", userSchema);
