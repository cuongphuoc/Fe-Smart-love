const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  fundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoupleFund',
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    required: true,
    enum: ['one-time', 'daily', 'weekly', 'monthly']
  },
  amount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  frequency: {
    type: Number,
    default: 1 // For weekly/monthly, how often to repeat
  },
  daysOfWeek: {
    type: [Number], // 0-6 for Sunday-Saturday
    default: []
  },
  dayOfMonth: {
    type: Number, // 1-31
    default: null
  },
  time: {
    type: String, // HH:mm format
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  lastNotified: {
    type: Date,
    default: null
  },
  notificationToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
reminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if reminder should trigger
reminderSchema.methods.shouldTrigger = function() {
  const now = new Date();
  
  // Check if reminder is enabled and not expired
  if (!this.isEnabled || (this.endDate && now > this.endDate)) {
    return false;
  }

  // Check if it's too soon since last notification
  if (this.lastNotified) {
    const timeSinceLastNotification = now - this.lastNotified;
    
    // Minimum 1 hour between notifications
    if (timeSinceLastNotification < 3600000) {
      return false;
    }
  }

  const [hours, minutes] = this.time.split(':').map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hours, minutes, 0, 0);

  switch (this.type) {
    case 'one-time':
      return !this.lastNotified && 
             Math.abs(now - scheduledTime) < 300000; // Within 5 minutes

    case 'daily':
      return Math.abs(now - scheduledTime) < 300000;

    case 'weekly':
      return this.daysOfWeek.includes(now.getDay()) &&
             Math.abs(now - scheduledTime) < 300000;

    case 'monthly':
      return now.getDate() === this.dayOfMonth &&
             Math.abs(now - scheduledTime) < 300000;

    default:
      return false;
  }
};

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder; 