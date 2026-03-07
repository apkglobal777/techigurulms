const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_EMAILS = ['vc2802204@gmail.com', 'techiguru.in@gmail.com'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },

  // ── Instructor-specific fields ─────────────────────────────────────────────
  // Instructors must be approved by admin before their courses are listed
  instructorStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  instructorBio: { type: String, maxlength: 1000 },
  expertise: [String],          // Areas of expertise
  socialLinks: {
    website: String,
    linkedin: String,
    twitter: String,
    youtube: String,
  },
  totalStudents: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalCourses: { type: Number, default: 0 },

  // ── Student-specific fields ────────────────────────────────────────────────
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500 },
  title: { type: String, trim: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // ── Certificate & Points System ────────────────────────────────────────────
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  earnedCertificates: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    issuedAt: { type: Date, default: Date.now },
    certificateUrl: String,
    certificateId: String,
  }],
  profilePoints: { type: Number, default: 0 },  // Points earned from certificates
  badges: [String],

  // Tracks external cert programs the student has redirected to (enables upload)
  redirectedCertificates: [{
    certId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    redirectedAt: { type: Date, default: Date.now }
  }],

  // Courses unlocked by spending points
  unlockedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // ── Misc ──────────────────────────────────────────────────────────────────
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,

  // ── Email OTP ─────────────────────────────────────────────────────────────
  emailOTP: { type: String, select: false },
  emailOTPExpire: { type: Date, select: false },
  isEmailVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

// ── Pre-save: Role assignment, password hashing ────────────────────────────
userSchema.pre('save', async function () {
  // 1. Admin/Instructor auto-assignment for whitelisted emails
  if (this.isModified('email') || this.isNew) {
    if (ADMIN_EMAILS.includes(this.email.toLowerCase())) {
      this.role = 'admin';
      this.instructorStatus = 'approved';
    }
  }

  // 2. Instructors that are NOT admin need approval
  if (this.isModified('role') && this.role === 'instructor') {
    if (!ADMIN_EMAILS.includes(this.email.toLowerCase())) {
      this.instructorStatus = 'pending';
    }
  }

  // 3. Password hashing
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

// Virtual: Is instructor approved to publish?
userSchema.virtual('canPublish').get(function () {
  return this.role === 'admin' || (this.role === 'instructor' && this.instructorStatus === 'approved');
});

module.exports = mongoose.model('User', userSchema);