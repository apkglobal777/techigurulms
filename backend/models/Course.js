const mongoose = require('mongoose');
const slugify = require('slugify');

// --- A. SUB-SCHEMAS FOR NEW UI FEATURES ---

// 1. Resources Schema (PDFs/Links)
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: true }); // Ensure they get IDs

// 2. Code Snippets Schema
const codeSnippetSchema = new mongoose.Schema({
  language: { type: String, default: 'javascript' },
  code: { type: String, default: '' }
}, { _id: true });

// 3. Quizzes (MCQs) Schema
const quizOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [quizOptionSchema] // Array of options
}, { _id: true });

// --- B. LESSON SCHEMA (Embedded) ---
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz'],
    default: 'video'
  },
  videoKey: {
    type: String,
    // Required only if type is video
    required: function() { return this.type === 'video'; }
  },
  videoDuration: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isFree: {
    type: Boolean,
    default: false
  },

  // --- NEW FIELDS ALIGNED WITH FRONTEND UI ---
  resources: [resourceSchema],
  codeSnippets: [codeSnippetSchema],
  quizzes: [quizSchema]
}, { _id: true });

// --- C. SECTION SCHEMA ---
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true
  },
  lessons: [lessonSchema]
}, { _id: true });

// --- D. MAIN COURSE SCHEMA ---
const courseSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  subtitle: { type: String },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Development', 'Business', 'Design', 'Marketing', 'Lifestyle', 'IT & Software']
  },
  level: {
    type: String,
    enum: ['All Levels', 'Beginner', 'Intermediate', 'Expert'],
    default: 'All Levels'
  },
  language: { type: String, default: 'English' },
  price: { type: Number, required: true, default: 0 },
  discountPrice: { type: Number },
  thumbnail: {
    url: { type: String, default: 'https://via.placeholder.com/640x360.png?text=Course+Thumbnail' },
    public_id: String
  },
  learningPoints: [String],
  requirements: [String],
  tags: [String],

  // Curriculum Structure
  sections: [sectionSchema],

  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  studentsEnrolled: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Inactive'],
    default: 'Draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// FIX: Removed 'next' parameter.
// Since this function is async, it implicitly returns a promise.
// Mongoose waits for the promise to resolve.
courseSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

// Virtual for total course duration calculation
courseSchema.virtual('totalDuration').get(function() {
  let totalSeconds = 0;
  if (this.sections && this.sections.length > 0) {
    this.sections.forEach(section => {
      if (section.lessons) {
        section.lessons.forEach(lesson => {
          if (lesson.type === 'video' && lesson.videoDuration) {
            totalSeconds += lesson.videoDuration;
          }
        });
      }
    });
  }
  return totalSeconds;
});

module.exports = mongoose.model('Course', courseSchema);