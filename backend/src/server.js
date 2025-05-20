const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));

// Middleware
app.use(express.json()); // Parse JSON bodies

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
  console.log(`For external access, use your computer's IP address: http://192.168.1.6:${PORT}/api`);
}); 