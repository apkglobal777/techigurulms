const User = require('../models/User');
const Course = require('../models/Course');
const StudentCertificate = require('../models/StudentCertificate');
const crypto = require('crypto');
const { sendVerificationLinkEmail } = require('../utlis/emailService');

const ADMIN_EMAILS = ['vc2802204@gmail.com', 'techiguru.in@gmail.com'];

// ── Middleware check: must be admin ────────────────────────────────────────────
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || ADMIN_EMAILS.includes(req.user.email))) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/instructors/pending
const getPendingInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor', instructorStatus: 'pending' })
            .select('-password').sort({ createdAt: -1 });
        res.json(instructors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/instructors
const getAllInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor' }).select('-password').sort({ createdAt: -1 });
        res.json(instructors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/instructors/:id/approve
const approveInstructor = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'instructor') return res.status(400).json({ message: 'User is not an instructor' });

        user.instructorStatus = 'approved';
        await user.save({ validateModifiedOnly: true });
        res.json({ message: 'Instructor approved successfully', user: user.getPublicProfile() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/instructors/:id/reject
const rejectInstructor = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.instructorStatus = 'rejected';
        await user.save({ validateModifiedOnly: true });
        res.json({ message: 'Instructor rejected', user: user.getPublicProfile() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// COURSE APPROVAL
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/courses/pending
const getPendingCourses = async (req, res) => {
    try {
        const courses = await Course.find({ approvalStatus: 'pending' })
            .populate('instructor', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({})
            .populate('instructor', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/courses/:id/approve
const approveCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.approvalStatus = 'approved';
        course.approvedAt = new Date();
        course.approvedBy = req.user._id;
        // Auto-set status to Active when approved
        if (course.status === 'Draft') course.status = 'Active';
        await course.save();
        res.json({ message: 'Course approved and published', course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/courses/:id/reject
const rejectCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.approvalStatus = 'rejected';
        course.rejectionReason = req.body.reason || 'Does not meet quality standards';
        course.status = 'Inactive';
        await course.save();
        res.json({ message: 'Course rejected', course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM STATS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/stats
const getPlatformStats = async (req, res) => {
    try {
        const [totalUsers, totalStudents, totalInstructors, pendingInstructors,
            totalCourses, pendingCourses, approvedCourses] = await Promise.all([
                User.countDocuments(),
                User.countDocuments({ role: 'student' }),
                User.countDocuments({ role: 'instructor' }),
                User.countDocuments({ role: 'instructor', instructorStatus: 'pending' }),
                Course.countDocuments(),
                Course.countDocuments({ approvalStatus: 'pending' }),
                Course.countDocuments({ approvalStatus: 'approved' }),
            ]);

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
        const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5)
            .populate('instructor', 'name').select('title status approvalStatus studentsEnrolled createdAt');

        res.json({
            users: { total: totalUsers, students: totalStudents, instructors: totalInstructors, pendingInstructors },
            courses: { total: totalCourses, pending: pendingCourses, approved: approvedCourses },
            recentUsers, recentCourses
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL VERIFICATION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/users/unverified
// Returns accounts that explicitly have isEmailVerified: false + completed registration
const getUnverifiedUsers = async (req, res) => {
    try {
        const users = await User.find({
            isEmailVerified: false,
            name: { $exists: true, $ne: '' },   // has completed the name step
            password: { $exists: true },         // has completed registration
        })
            .select('name email role createdAt lastLogin')
            .sort({ createdAt: -1 });

        res.json({ count: users.length, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/admin/users/:id/resend-verification
// Generates a secure token and sends a verification link to the user (valid 24h)
const resendVerificationLink = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('+verifyToken +verifyTokenExpire');
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'This user has already verified their email.' });
        }

        // Generate cryptographically secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        user.verifyToken = hashedToken;
        user.verifyTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save({ validateModifiedOnly: true });

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`;

        await sendVerificationLinkEmail(user.email, user.name, verifyUrl);

        res.json({
            message: `Verification link sent to ${user.email} (valid 24 hours)`,
            email: user.email
        });
    } catch (err) {
        console.error('resendVerificationLink error:', err);
        res.status(500).json({ message: 'Failed to send verification link: ' + err.message });
    }
};

// POST /api/admin/users/resend-verification-all
// Sends a verification link to EVERY account that hasn't verified their email yet
const resendVerificationToAll = async (req, res) => {
    try {
        const unverifiedUsers = await User.find({
            isEmailVerified: false,
            name: { $exists: true, $ne: '' },
            password: { $exists: true },
        })
            .select('+verifyToken +verifyTokenExpire name email');

        if (unverifiedUsers.length === 0) {
            return res.json({ message: 'No unverified users found.', sent: 0, failed: 0, results: [] });
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const results = [];
        let sent = 0;
        let failed = 0;

        for (const user of unverifiedUsers) {
            try {
                const rawToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

                await User.findByIdAndUpdate(user._id, {
                    verifyToken: hashedToken,
                    verifyTokenExpire: new Date(Date.now() + 24 * 60 * 60 * 1000),
                });

                const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${rawToken}`;
                await sendVerificationLinkEmail(user.email, user.name, verifyUrl);

                results.push({ email: user.email, name: user.name || '(no name)', status: 'sent' });
                sent++;
            } catch (emailErr) {
                results.push({ email: user.email, name: user.name || '(no name)', status: 'failed', error: emailErr.message });
                failed++;
            }
        }

        res.json({
            message: `Bulk resend complete. Sent: ${sent}, Failed: ${failed}`,
            sent,
            failed,
            results
        });
    } catch (err) {
        console.error('resendVerificationToAll error:', err);
        res.status(500).json({ message: 'Bulk resend failed: ' + err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT CERTIFICATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/student-certs
const getAllStudentCertificates = async (req, res) => {
    try {
        const certs = await StudentCertificate.find({})
            .populate('student', 'name email avatar')
            .populate('certificateProgram', 'title genre thumbnail points')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/student-certs/:id/approve
const approveStudentCertificate = async (req, res) => {
    try {
        const cert = await StudentCertificate.findById(req.params.id)
            .populate('certificateProgram', 'title points');
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });
        if (cert.status === 'approved') return res.status(400).json({ message: 'Already approved' });

        const pointsToAward = cert.certificateProgram?.points || 50;

        cert.status = 'approved';
        cert.pointsAwarded = pointsToAward;
        cert.approvedBy = req.user._id;
        cert.approvedAt = new Date();
        cert.adminNote = req.body.note || '';
        await cert.save();

        // Award points to student
        await User.findByIdAndUpdate(cert.student, {
            $inc: { profilePoints: pointsToAward }
        });

        res.json({
            message: `Certificate approved! ${pointsToAward} points awarded to student.`,
            cert
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/student-certs/:id/reject
const rejectStudentCertificate = async (req, res) => {
    try {
        const cert = await StudentCertificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        cert.status = 'rejected';
        cert.adminNote = req.body.note || 'Does not meet requirements';
        cert.approvedBy = req.user._id;
        await cert.save();

        res.json({ message: 'Certificate rejected', cert });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    isAdmin,
    getPendingInstructors, getAllInstructors, approveInstructor, rejectInstructor,
    getPendingCourses, getAllCourses, approveCourse, rejectCourse,
    getPlatformStats, getAllUsers,
    getAllStudentCertificates, approveStudentCertificate, rejectStudentCertificate,
    getUnverifiedUsers, resendVerificationLink, resendVerificationToAll
};
