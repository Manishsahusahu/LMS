import { Schema, model } from "mongoose";

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
    forgetPasswordToken: String,
    forgetPasswordExpiry: String,
  },
  { TimeStamp: true }
);

export default model("User", userSchema);
