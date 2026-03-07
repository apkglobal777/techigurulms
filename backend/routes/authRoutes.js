const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  getMyEnrollments,
  getPublicProfile,
  uploadAvatar,
  sendSignupOTP,
  verifyAndRegister,
  forgotPassword,
  resetPasswordWithOTP,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ── Multer setup for avatar uploads ───────────────────────────────────────────
const avatarDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    valid ? cb(null, true) : cb(new Error('Only image files are allowed'));
  }
});

// ── Public Routes ──────────────────────────────────────────────────────────────

// Legacy register (no OTP) — kept for backward compat
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users/:id/profile', getPublicProfile);

// OTP-based Signup
router.post('/send-signup-otp', sendSignupOTP);
router.post('/verify-register', verifyAndRegister);

// Forgot / Reset Password via OTP
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordWithOTP);

// ── Protected Routes ───────────────────────────────────────────────────────────
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.get('/my-enrollments', protect, getMyEnrollments);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
