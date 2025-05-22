const Task = require('../models/Task');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { deviceId } = req.query;
    let filter = {};
    
    // If deviceId is provided, filter tasks by deviceId
    if (deviceId) {
      filter = { deviceId };
    }
    
    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving tasks',
      error: error.message
    });
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `No task found with id: ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving task',
      error: error.message
    });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `No task found with id: ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `No task found with id: ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: true
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// Delete multiple tasks
exports.deleteTasks = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of task IDs'
      });
    }
    
    const result = await Task.deleteMany({ _id: { $in: ids } });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No tasks found with the provided IDs'
      });
    }
    
    res.status(200).json({
      success: true,
      data: true,
      message: `Successfully deleted ${result.deletedCount} tasks`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting tasks',
      error: error.message
    });
  }
};

// Toggle task completion status
exports.toggleTaskComplete = async (req, res) => {
  try {
    const { completed } = req.body;
    
    if (completed === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the completed status'
      });
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `No task found with id: ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error toggling task completion',
      error: error.message
    });
  }
}; 