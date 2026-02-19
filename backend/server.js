const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// --- 1. Import the seeder function ---

// Adjust the path if needed
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const certificateRoutes = require('./routes/certificateRoutes'); 
const seedInstructors = require('./utlis/Seeder');

dotenv.config();

// --- 2. Connect to Database and run Seeder ---
connectDB().then(() => {
    // This will check and create the default instructors if they don't exist
    seedInstructors(); 
});

const app = express();

app.use(cors({
    // origin: 'http://localhost:5173', 
    origin: 'http://techiguru.in', 
    // origin: 'https://techiguru.vercel.app', 
    // origin: 'http://techiguru-frontend.s3-website.ap-south-1.amazonaws.com', 
    credentials: true
}));

app.use(express.json());

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes); 

// Static folder for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 Error Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));