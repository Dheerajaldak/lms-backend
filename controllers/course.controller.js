import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

const getAllCourses = async function (req, res, next) {
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success: true,
            message: 'All courses fetched successfully',
            courses,
        });
    } catch (e) {
        return next(new AppError(e.message || 'Failed to fetch courses', 500));
    }
};

const getLectureByCourseId = async function (req, res, next) {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures,
        });
    } catch (e) {
        return next(new AppError(e.message || 'Failed to fetch course lectures', 500));
    }
};

const createCourse = async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description || !category || !createdBy) {
        return next(new AppError('All fields are required', 400));
    }

    try {
        // Create the course
        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: { public_id: '', secure_url: '' }, // Initialize thumbnail field
        });

        if (!course) {
            return next(new AppError('Course could not be created, please try again', 500));
        }

        if (req.file) {
            try {
                // Upload thumbnail to Cloudinary
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                });

                if (result) {
                    // Update the course with the Cloudinary image details
                    course.thumbnail.public_id = result.public_id;
                    course.thumbnail.secure_url = result.secure_url;
                }

                // Remove the file from the server after uploading to Cloudinary
                fs.rm(`uploads/${req.file.filename}`);
            } catch (e) {
                return next(
                    new AppError(e.message, 500));

            }

        }

        // Save the course after updating thumbnail
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            course,
        });

    } catch (e) {
        return next(new AppError(e.message || 'Course creation failed, please try again', 500));
    }
};

const updateCourse = async (req, res, next) => {
    // Example of how to update the course (you can add more logic here)
    try {
        const { id } = req.params;
        const { title, description, category, createdBy } = req.body;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('Course not found', 404));
        }

        // Update course fields if provided
        if (title) course.title = title;
        if (description) course.description = description;
        if (category) course.category = category;
        if (createdBy) course.createdBy = createdBy;

        // Save the updated course
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course,
        });
    } catch (e) {
        return next(new AppError(e.message || 'Course update failed', 500));
    }
};

const removeCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 500));
        }

        // Remove the thumbnail image from Cloudinary if it exists
        // if (course.thumbnail.public_id) {
        //     await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
        // }

        // Delete the course from the database
        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
        });
    } catch (e) {
        return next(new AppError(e.message || 'Failed to delete the course', 500));
    }
};
const addLectureToCourseById = async (req, res, next) => {

    try {
        const { title, description } = req.body;
        const { id } = req.params;
        if (!title || !description) {
            return next(new AppError('All fields are required', 400));
        }
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError('Course with given id does not exist', 500));
        }

        const lectureData = {
            title,
            description,
            lecture:{}
        };
        if (req.file) {
            try {
                // Upload thumbnail to Cloudinary
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                });
                if (result) {
                    // Update the course with the Cloudinary image details
                    lectureData.lecture.public_id = result.public_id;
                    lectureData.lecture.secure_url = result.secure_url;
                }
                // Remove the file from the server after uploading to Cloudinary
                fs.rm(`uploads/${req.file.filename}`);
            } catch (e) {
                return next(
                    new AppError(e.message, 500));
            }
        }
        course.lectures.push(lectureData);

        course.numbersOfLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Lecture successfully added to the course',
            course
        })

    } catch (e) {
        return next(
            new AppError(e.message, 500));

    }

}
export {
    getAllCourses,
    getLectureByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById
};
