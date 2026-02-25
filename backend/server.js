const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// --- Import Routes & Utils ---
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const certificateRoutes = require('./routes/certificateRoutes'); 
const seedInstructors = require('./utlis/Seeder');

dotenv.config();

// --- Connect to Database ---
connectDB().then(() => {
    seedInstructors(); 
});

const app = express();

// --- CORS CONFIGURATION (Fixed) ---
app.use(cors({
    origin: true, // Allows all origins dynamically while supporting credentials
    credentials: true
}));

app.use(express.json());

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes); 

// --- STATIC FOLDER ---
// Serve images/files uploaded to /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 Handler
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