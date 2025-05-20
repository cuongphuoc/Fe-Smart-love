const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const coupleFundRoutes = require('./routes/coupleFundRoutes');

// Load environment variables
dotenv.config();
console.log('Environment variables:', process.env.NODE_ENV, process.env.PORT, process.env.MONGO_URI);

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Enable CORS for all requests with more permissive options
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow all methods
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id'] // Allow these headers
}));

// Middleware for parsing JSON with increased size limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
  
  // Create subdirectories
  const fundImagesDir = path.join(uploadsDir, 'funds');
  const avatarImagesDir = path.join(uploadsDir, 'avatars');
  
  if (!fs.existsSync(fundImagesDir)) {
    fs.mkdirSync(fundImagesDir, { recursive: true });
    console.log('Created funds images directory at:', fundImagesDir);
  }
  
  if (!fs.existsSync(avatarImagesDir)) {
    fs.mkdirSync(avatarImagesDir, { recursive: true });
    console.log('Created avatars images directory at:', avatarImagesDir);
  }
}

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(uploadsDir));
console.log(`Serving static files from: ${uploadsDir}`);

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/couple-fund', coupleFundRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Smart Love API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API is accessible at: http://localhost:${PORT}/api`);
  console.log(`Static files are accessible at: http://localhost:${PORT}/uploads`);
}); 