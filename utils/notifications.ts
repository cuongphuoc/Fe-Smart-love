import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {  
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }
  
  return token;
}

// Schedule a local notification
export async function scheduleNotification({
  title,
  body,
  data = {},
  trigger = null,
}: {
  title: string;
  body: string;
  data?: Object;
  trigger?: any;
}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null means send immediately
    });
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
}

// Send a notification for fund completion
export async function sendFundCompletionNotification(fundTitle: string) {
  // Get current date and time in a readable format
  const now = new Date();
  const dateTimeString = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  // Array of congratulatory messages
  const congratsMessages = [
    "Amazing job! Keep up the excellent work!",
    "Well done! Your dedication has paid off!",
    "Fantastic achievement! You're making great progress!",
    "Brilliant! Your financial goals are becoming reality!",
    "Outstanding effort! You should be proud of this milestone!"
  ];
  
  // Select a random congratulatory message
  const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
  
  return scheduleNotification({
    title: '🎉 Fund Completed Successfully! 🎉',
    body: `Congratulations! You have completed "${fundTitle}" on ${dateTimeString}. ${randomMessage}`,
    data: {
      type: 'fund_completed',
      fundTitle,
      completedAt: now.toISOString(),
    },
  });
}

// Send a notification when a task is completed
export async function sendTaskCompletionNotification(taskTitle: string) {
  // Get current date and time in a readable format
  const now = new Date();
  const dateTimeString = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  // Array of congratulatory messages
  const congratsMessages = [
    "Great job on completing this task!",
    "One more task finished! You're on a roll!",
    "Task completed! Keep up the momentum!",
    "Well done! Your productivity is impressive!",
    "Another task checked off your list! Excellent work!"
  ];
  
  // Select a random congratulatory message
  const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
  
  return scheduleNotification({
    title: '✅ Task Completed! ✅',
    body: `You completed "${taskTitle}" on ${dateTimeString}. ${randomMessage}`,
    data: {
      type: 'task_completed',
      taskTitle,
      completedAt: now.toISOString(),
    },
  });
} 