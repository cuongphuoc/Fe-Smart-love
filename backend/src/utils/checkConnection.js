const mongoose = require('mongoose');
const Task = require('../models/Task');

// MongoDB Connection URI
const MONGO_URI = 'mongodb+srv://sonmac9103:sonmac9103@cluster0.yor2o0q.mongodb.net/todolist';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Check connection and get tasks
const checkConnection = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all tasks
    const tasks = await Task.find({}).sort({ dueDate: 1 });
    
    // Display tasks
    console.log('\n=== TASKS IN DATABASE ===');
    console.log(`Total Tasks: ${tasks.length}`);
    
    if (tasks.length > 0) {
      tasks.forEach((task, index) => {
        console.log(`\nTask ${index + 1}:`);
        console.log(`ID: ${task._id}`);
        console.log(`Title: ${task.title}`);
        console.log(`Completed: ${task.completed ? 'Yes' : 'No'}`);
        console.log(`Due Date: ${task.dueDate.toLocaleString()}`);
        console.log(`Created At: ${task.createdAt ? task.createdAt.toLocaleString() : 'N/A'}`);
      });
    } else {
      console.log('No tasks found in the database.');
    }
    
    // Close connection
    console.log('\nDatabase query completed successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error checking database: ${error.message}`);
    process.exit(1);
  }
};

// Run the check function
checkConnection(); 