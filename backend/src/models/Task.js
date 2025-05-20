const mongoose = require('mongoose');

// Define the Task schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Convert dates to ISO strings for frontend
      ret.dueDate = ret.dueDate.toISOString();
      return ret;
    }
  }
});

// Create and export the Task model
module.exports = mongoose.model('Task', taskSchema, 'tasks'); 