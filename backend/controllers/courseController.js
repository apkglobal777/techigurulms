const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// @desc    Get courses (Public, Paginated, Filtered)
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const status = req.query.status || 'Active';

    // Search by Keyword
    const keyword = req.query.keyword
      ? { title: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    // Filter by Category
    const category = req.query.category && req.query.category !== 'All'
      ? { category: req.query.category }
      : {};

    // Filter by Level
    const level = req.query.level && req.query.level !== 'All'
      ? { level: req.query.level }
      : {};

    const query = { ...keyword, ...category, ...level, status };

    const count = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar title')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ courses, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio title');

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = async (req, res) => {
  try {
    const {
      title, description, price, category, status,
      thumbnail, sections, level, learningPoints, requirements
    } = req.body;

    const newCourse = new Course({
      instructor: req.user._id,
      title,
      description,
      price,
      category,
      status: status || 'Draft',
      // FIX: Wrap string URL in an object to match Schema
      thumbnail: thumbnail ? { url: thumbnail } : undefined,
      level,
      learningPoints,
      requirements,
      // IMPORTANT: This 'sections' array contains the nested
      // resources, codeSnippets, and quizzes from the frontend
      sections: sections || []
    });

    const createdCourse = await newCourse.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(400).json({ message: 'Invalid course data', error: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Instructor only)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      // Authorization Check
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this course' });
      }

      // Update Fields
      course.title = req.body.title || course.title;
      course.description = req.body.description || course.description;
      course.price = req.body.price !== undefined ? req.body.price : course.price;
      course.category = req.body.category || course.category;
      course.status = req.body.status || course.status;
      
      // FIX: Handle thumbnail update. If string is sent, wrap it in object.
      if (req.body.thumbnail) {
        course.thumbnail = { url: req.body.thumbnail };
      }

      course.level = req.body.level || course.level;
      course.learningPoints = req.body.learningPoints || course.learningPoints;
      course.requirements = req.body.requirements || course.requirements;

      // Update Sections (Full Replace)
      // This ensures removed items (quizzes, resources) are actually deleted
      if (req.body.sections) {
        course.sections = req.body.sections;
      }

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Instructor Courses
// @route   GET /api/courses/mycourses
// @access  Private (Instructor)
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({ updatedAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Upload Course Image/File
// @route   POST /api/courses/upload
// @access  Private
const uploadCourseImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Convert backslashes to forward slashes for URL compatibility
    const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
    res.status(200).json({ url: imagePath, message: 'File uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  uploadCourseImage,
};