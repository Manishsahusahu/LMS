import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

const getAllCourses = async (req, res, next) => {
  const allCourses = await Course.find({}).select("-lectures");

  try {
    res.status(200).json({
      success: true,
      message: "All courses are here",
      allCourses,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
const getLecturesByCourseId = async (req, res, next) => {
  const { id } = req.params;
  console.log("id: ", id);
  const course = await Course.findById(id);

  if (!course) return next(new AppError("No course found", 400));

  try {
    res.status(200).json({
      success: true,
      message: "All Lectures for course id are here",
      lectures: course.lectures,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy)
      return next(new AppError("All fields are mandatory", 400));

    const course = await Course.create({
      title,
      description,
      category,
      thumbnail: {
        public_id: "temp",
        secure_url: "temp",
      },
      createdBy,
    });
    if (!course)
      return next(
        new AppError("Course could not be created, please try again later", 400)
      );

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });
      if (result) {
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }
      fs.rm(`uploads/${req.file.filename}`);
    }
    await course.save();
    res.status(200).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(new AppError("id not found", 400));
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body, // whatever info you get from req.body just override them in to the database with corresponding to id.
      },
      {
        runValidators: true, // check if data of req.body is in compliance with schema of database.
      }
    );
    if (!updatedCourse) return next(new AppError("course not found", 400));

    res.status(200).json({
      success: true,
      message: "course updated successfully",
      updatedCourse,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
const removeCourse = async (req, res, next) => {};

export {
  getAllCourses,
  getLecturesByCourseId,
  updateCourse,
  createCourse,
  removeCourse,
};
