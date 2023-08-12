import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";

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
  console.log("id: ", id)
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

export { getAllCourses, getLecturesByCourseId };
