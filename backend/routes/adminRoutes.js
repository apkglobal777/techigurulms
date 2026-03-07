const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    isAdmin,
    getPendingInstructors, getAllInstructors, approveInstructor, rejectInstructor,
    getPendingCourses, getAllCourses, approveCourse, rejectCourse,
    getPlatformStats, getAllUsers,
    getAllStudentCertificates, approveStudentCertificate, rejectStudentCertificate,
    getUnverifiedUsers, resendVerificationLink, resendVerificationToAll
} = require('../controllers/adminController');

// All admin routes require login + admin check
router.use(protect, isAdmin);

// Stats
router.get('/stats', getPlatformStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/unverified', getUnverifiedUsers);                          // List unverified accounts
router.post('/users/resend-verification-all', resendVerificationToAll);       // Bulk send links to ALL unverified
router.post('/users/:id/resend-verification', resendVerificationLink);        // Send link to one specific user

// Instructors
router.get('/instructors', getAllInstructors);
router.get('/instructors/pending', getPendingInstructors);
router.put('/instructors/:id/approve', approveInstructor);
router.put('/instructors/:id/reject', rejectInstructor);

// Courses
router.get('/courses', getAllCourses);
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);

// Student Certificates
router.get('/student-certs', getAllStudentCertificates);
router.put('/student-certs/:id/approve', approveStudentCertificate);
router.put('/student-certs/:id/reject', rejectStudentCertificate);

module.exports = router;
