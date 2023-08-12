import { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: "String",
      required: [true, "title should not be empty"],
      minLength: [8, "title should be atleast 8 characters long"],
      maxLength: [60, "title should be less than 60 characters"],
      trim: true,
    },
    description: {
      type: "String",
      required: [true, "description should not be empty"],
      minLength: [8, "description should be atleast 8 characters long"],
      maxLength: [200, "description should be less than 200 characters"],
      trim: true,
    },
    category: {
      type: "String",
      required: [true, "category is required"],
    },
    thumbnail: {
      public_url: {
        type: "String",
        required: true,
      },
      secure_url: {
        type: "String",
        required: true,
      },
    },
    lectures: [
      {
        title: {
          type: "String",
        },
        description: {
          type: "String",
        },
        lecture: {
          public_url: {
            type: "String",
            required: true,
          },
          secure_url: {
            type: "String",
            required: true,
          },
        },
      },
    ],
    numberOfLectures: {
      type: "Number",
      default: 0,
    },
    createdBy: {
      type: "String",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Course", courseSchema);
