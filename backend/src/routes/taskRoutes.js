const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  deleteTasks,
  toggleTaskComplete
} = require('../controllers/taskController');

// Routes matching the API described in BACKEND_INTEGRATION.md
router.route('/')
  .get(getAllTasks)
  .post(createTask)
  .delete(deleteTasks);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/toggle')
  .patch(toggleTaskComplete);

module.exports = router; 