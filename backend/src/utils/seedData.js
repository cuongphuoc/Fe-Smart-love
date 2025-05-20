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

// Seed the database
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Delete existing tasks
    await Task.deleteMany({});
    console.log('Existing tasks deleted');
    
    // Insert sample tasks
    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`${createdTasks.length} tasks added to database`);
    
    // Display added tasks
    console.log('\nAdded tasks:');
    createdTasks.forEach((task, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(`Title: ${task.title}`);
      console.log(`Due Date: ${task.dueDate.toLocaleString()}`);
      console.log(`Completed: ${task.completed ? 'Yes' : 'No'}`);
    });
    
    // Close connection
    console.log('\nDatabase seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run seed function
seedData(); 