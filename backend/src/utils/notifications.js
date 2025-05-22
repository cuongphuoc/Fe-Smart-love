const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Send push notification
exports.sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!Expo.isExpoPushToken(token)) {
      console.error('Invalid Expo push token');
      return;
    }

    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'smart-love-reminders'
    };

    const chunks = expo.chunkPushNotifications([message]);

    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Send fund completion notification
exports.sendFundCompletionNotification = async (token, fundName) => {
  await exports.sendPushNotification(
    token,
    '🎉 Congratulations!',
    `Your fund "${fundName}" has reached its target!`,
    {
      type: 'fund_completion',
      fundName
    }
  );
};

// Send reminder notification
exports.sendReminderNotification = async (token, reminder, fund) => {
  let message = reminder.description || reminder.title;
  if (reminder.amount > 0) {
    message += ` (${reminder.amount.toLocaleString()}đ)`;
  }

  await exports.sendPushNotification(
    token,
    'Smart Love Reminder',
    message,
    {
      type: 'reminder',
      fundId: fund._id.toString(),
      reminderType: reminder.type
    }
  );
};

// Send contribution reminder
exports.sendContributionReminder = async (token, fund, daysLeft) => {
  const message = daysLeft > 0
    ? `${daysLeft} days left to reach your goal of ${fund.goal.amount.toLocaleString()}đ`
    : "It's time to contribute to your fund!";

  await exports.sendPushNotification(
    token,
    'Contribution Reminder',
    message,
    {
      type: 'contribution_reminder',
      fundId: fund._id.toString()
    }
  );
};

// Send goal progress notification
exports.sendGoalProgressNotification = async (token, fund, percentage) => {
  await exports.sendPushNotification(
    token,
    'Goal Progress Update',
    `You've reached ${percentage}% of your goal in "${fund.name}"!`,
    {
      type: 'goal_progress',
      fundId: fund._id.toString(),
      percentage
    }
  );
}; 