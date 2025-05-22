const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const reminderController = require('../controllers/reminderController');

// NOTE: These routes are deprecated - use /api/couple-fund/transactions instead
// Keeping for backward compatibility
router.get('/couple-fund/transactions/:fundId', (req, res) => {
  console.log('[DEPRECATED ROUTE] Using /api/couple-fund/transactions/:fundId directly. Use coupleFundRoutes instead.');
  return transactionController.getTransactions(req, res);
});

router.post('/couple-fund/transactions', (req, res) => {
  console.log('[DEPRECATED ROUTE] Using /api/couple-fund/transactions directly. Use coupleFundRoutes instead.');
  return transactionController.addTransaction(req, res);
});

// Reminder routes
router.get('/couple-fund/reminders/:fundId', reminderController.getReminders);
router.post('/couple-fund/reminders', reminderController.createReminder);
router.put('/couple-fund/reminders/:reminderId', reminderController.updateReminder);
router.delete('/couple-fund/reminders/:reminderId', reminderController.deleteReminder);

module.exports = router; 