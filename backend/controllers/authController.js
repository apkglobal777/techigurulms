const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../utlis/emailService');

const ADMIN_EMAILS = ['vc2802204@gmail.com', 'techiguru.in@gmail.com'];

// Helper: Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Send Signup OTP ──────────────────────────────────────────────────────────
const sendSignupOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await User.findOne({ email: email.toLowerCase(), isEmailVerified: true });
    if (existing) return res.status(400).json({ message: 'Account with this email already exists' });

    const otp = generateOTP();
    const expire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert a pending (unverified) user record to hold the OTP
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailOTP: otp, emailOTPExpire: expire, isEmailVerified: false },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: false }
    );

    await sendOTPEmail(email, otp, 'signup');
    res.json({ message: 'OTP sent to your email. Valid for 10 minutes.' });
  } catch (error) {
    console.error('sendSignupOTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP: ' + error.message });
  }
};

// ── Verify OTP & Register ─────────────────────────────────────────────────────
const verifyAndRegister = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Load pending user with OTP fields
    const pending = await User.findOne({ email: email.toLowerCase() }).select('+emailOTP +emailOTPExpire');
    if (!pending) return res.status(400).json({ message: 'Please request an OTP first' });
    if (pending.isEmailVerified) return res.status(400).json({ message: 'Account already verified. Please login.' });
    if (!pending.emailOTP || pending.emailOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
    if (!pending.emailOTPExpire || pending.emailOTPExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Assign role/status
    let assignedRole = role || 'student';
    if (ADMIN_EMAILS.includes(email.toLowerCase())) assignedRole = 'admin';

    // Update pending user to a full verified account
    pending.name = name;
    pending.password = password;
    pending.role = assignedRole;
    pending.isEmailVerified = true;
    pending.emailOTP = undefined;
    pending.emailOTPExpire = undefined;
    pending.instructorStatus = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'approved' : 'pending';
    await pending.save();

    const isPendingInstructor = assignedRole === 'instructor' && !ADMIN_EMAILS.includes(email.toLowerCase());

    res.status(201).json({
      ...pending.getPublicProfile(),
      token: generateToken(pending._id),
      pendingApproval: isPendingInstructor,
      message: isPendingInstructor
        ? 'Registration successful! Your instructor account is pending admin approval.'
        : 'Registration successful!',
    });
  } catch (error) {
    console.error('verifyAndRegister error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ── Register (legacy — kept for backwards compatibility) ─────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, bio, title } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase(), isEmailVerified: true });
    if (userExists) return res.status(400).json({ message: 'Account with this email already exists' });

    let assignedRole = role || 'student';
    if (ADMIN_EMAILS.includes(email.toLowerCase())) assignedRole = 'admin';

    const user = await User.create({
      name, email, password,
      role: assignedRole,
      bio: bio || '',
      title: title || '',
      isEmailVerified: true, // Legacy route skips OTP
      instructorStatus: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'approved' : 'pending',
    });

    if (!user) return res.status(400).json({ message: 'Invalid user data' });

    const isPendingInstructor = assignedRole === 'instructor' && !ADMIN_EMAILS.includes(email.toLowerCase());

    res.status(201).json({
      ...user.getPublicProfile(),
      token: generateToken(user._id),
      pendingApproval: isPendingInstructor,
      message: isPendingInstructor
        ? 'Registration successful! Your instructor account is pending admin approval.'
        : 'Registration successful!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block unverified accounts (only if they came through the OTP flow)
    if (!user.isEmailVerified && user.name) {
      return res.status(401).json({ message: 'Please verify your email before logging in.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });

    res.json({
      ...user.getPublicProfile(),
      token: generateToken(user._id),
      pendingApproval: user.role === 'instructor' && user.instructorStatus === 'pending',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ── Forgot Password — Send OTP ────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isEmailVerified) {
      // Return success anyway to prevent email enumeration
      return res.json({ message: 'If an account with this email exists, a reset OTP has been sent.' });
    }

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save({ validateModifiedOnly: true });

    await sendOTPEmail(email, otp, 'forgot');
    res.json({ message: 'Password reset OTP sent to your email. Valid for 10 minutes.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Failed to send reset OTP: ' + error.message });
  }
};

// ── Reset Password with OTP ───────────────────────────────────────────────────
const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+emailOTP +emailOTPExpire');
    if (!user) return res.status(400).json({ message: 'No account found with this email' });

    if (!user.emailOTP || user.emailOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
    if (!user.emailOTPExpire || user.emailOTPExpire < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.password = newPassword;
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    res.json({ message: 'Password reset successful! You can now login with your new password.' });
  } catch (error) {
    console.error('resetPasswordWithOTP error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ── Get current user ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('earnedCertificates.course', 'title thumbnail category');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.getPublicProfile());
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, bio, title, avatar, instructorBio, expertise, socialLinks } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (title !== undefined) user.title = title;
    if (avatar !== undefined) user.avatar = avatar;
    if (instructorBio !== undefined) user.instructorBio = instructorBio;
    if (expertise !== undefined) user.expertise = expertise;
    if (socialLinks !== undefined) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save({ validateModifiedOnly: true });

    res.json({
      ...updated.getPublicProfile(),
      token: generateToken(updated._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get My Enrolled Courses with Progress ─────────────────────────────────────
const getMyEnrollments = async (req, res) => {
  try {
    const Course = require('../models/Course');
    const courses = await Course.find({
      'enrollments.student': req.user._id,
      approvalStatus: 'approved',
    })
      .populate('instructor', 'name avatar title instructorBio')
      .select('title thumbnail description category level sections studentsEnrolled rating price enrollments slug');

    const withProgress = courses.map(c => {
      const enrollment = c.enrollments.find(e => e.student.toString() === req.user._id.toString());
      return {
        _id: c._id,
        title: c.title,
        thumbnail: c.thumbnail,
        description: c.description,
        category: c.category,
        level: c.level,
        studentsEnrolled: c.studentsEnrolled,
        rating: c.rating,
        price: c.price,
        instructor: c.instructor,
        totalLessons: c.sections?.reduce((a, s) => a + (s.lessons?.length || 0), 0) || 0,
        progress: enrollment?.progress || 0,
        completed: enrollment?.completed || false,
        enrolledAt: enrollment?.enrolledAt,
      };
    });

    res.json(withProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// ── Get Public Instructor Profile ──────────────────────────────────────────────
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio title instructorBio expertise socialLinks totalStudents totalCourses role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ── Upload Avatar ──────────────────────────────────────────────────────────────
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old avatar from disk if it's a local file
    if (user.avatar && (user.avatar.startsWith('/uploads') || user.avatar.startsWith('\\uploads'))) {
      const fs = require('fs');
      const oldPath = require('path').join(__dirname, '..', user.avatar.replace(/\\/g, '/'));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const relativePath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = relativePath;
    await user.save({ validateModifiedOnly: true });

    res.json({ avatar: relativePath, message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser, loginUser, getMe, updateUserProfile,
  getMyEnrollments, getPublicProfile, uploadAvatar,
  sendSignupOTP, verifyAndRegister,
  forgotPassword, resetPasswordWithOTP,
};
