const Reminder = require('../models/reminder');
const CoupleFund = require('../models/coupleFund');
const { sendPushNotification } = require('../utils/notifications');

// Get reminders for a fund
exports.getReminders = async (req, res) => {
  try {
    const { fundId } = req.params;
    const userId = req.headers['user-id'];

    const reminders = await Reminder.find({ fundId, userId });

    return res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('Error getting reminders:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const { fundId, title, description, type, amount, startDate, endDate, frequency, daysOfWeek, dayOfMonth } = req.body;
    const userId = req.headers['user-id'];

    // Validate fund exists
    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    // Create reminder
    const reminder = new Reminder({
      fundId,
      userId,
      title,
      description,
      type,
      amount,
      startDate,
      endDate,
      frequency,
      daysOfWeek,
      dayOfMonth
    });

    await reminder.save();

    return res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update a reminder
exports.updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.headers['user-id'];
    const updateData = req.body;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, userId },
      updateData,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    return res.json({
      success: true,
      data: reminder
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.headers['user-id'];

    const reminder = await Reminder.findOneAndDelete({ _id: reminderId, userId });

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    return res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check and trigger reminders
exports.checkReminders = async () => {
  try {
    const reminders = await Reminder.find({ isEnabled: true });
    const now = new Date();

    for (const reminder of reminders) {
      if (reminder.shouldTrigger()) {
        // Get fund details
        const fund = await CoupleFund.findById(reminder.fundId);
        if (!fund) continue;

        // Prepare notification message
        let message = reminder.description || reminder.title;
        if (reminder.amount > 0) {
          message += ` (${reminder.amount.toLocaleString()}đ)`;
        }

        // Send push notification
        await sendPushNotification(
          reminder.notificationToken,
          'Smart Love Reminder',
          message,
          {
            fundId: fund._id.toString(),
            reminderType: reminder.type
          }
        );

        // Update last notified time
        reminder.lastNotified = now;
        await reminder.save();
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}; 