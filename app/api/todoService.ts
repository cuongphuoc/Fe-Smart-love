import axios from 'axios';
import { Platform } from 'react-native';

// Your computer's IP address on your local network
// IMPORTANT: Change this to your computer's actual IP address
// const YOUR_IP_ADDRESS = 'http://ĐỊA_CHỈ_API_CỦA_MẠNG:5000/api'; // Your computer's IP address

// Determine if running in development mode
const isDev = __DEV__;

// Determine the base URL based on the platform
const getBaseUrl = () => {
  // Check if we're running on web
  if (Platform.OS === 'web') {
    if (isDev) {
      // For web in development, use the relative URL which will work with
      // Expo's dev server proxy or a separate server on the same origin
      return '/api'; // This will be relative to the current domain
      
      // Alternative for web if using a different origin server:
      // return `http://${window.location.hostname}:5000/api`;
    } else {
      // For production web builds, you might use a different URL
      return '/api';
    }
  } else if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // Use the same IP address for both Android and iOS
    return `http://192.168.1.8:5000/api`;
  } else {
    // Default fallback
    return `http://192.168.1.8:5000/api`;
  }
};

// Alternative: You can set this to your computer's IP address directly:
// const API_BASE_URL = `http://${YOUR_IP_ADDRESS}:5000/api`;

const API_BASE_URL = getBaseUrl();
console.log('Using API URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);

// Create axios instance with timeout
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds timeout for development
});

// Add a request interceptor to handle common tasks
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url} status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout! Server might be down or unreachable.');
      console.error(`Timeout trying to connect to: ${error.config?.baseURL}${error.config?.url}`);
      
      // Specific advice for web users
      if (Platform.OS === 'web') {
        console.error('For web: Make sure your backend server is running and CORS is properly configured.');
        console.error('Try updating the API URL in getBaseUrl() function to point to your actual server.');
      }
    }
    
    if (!error.response) {
      console.error('Network error! No response received from server.');
    }
    
    return Promise.reject(error);
  }
);

// Task interface
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // ISO format date string
  deviceId?: string; // Device identifier for filtering tasks
}

// API response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Todo service API functions
export const todoService = {
  // Get all tasks
  getAllTasks: async (deviceId?: string): Promise<Task[]> => {
    try {
      console.log('Fetching tasks from:', `${API_BASE_URL}/tasks`);
      console.log('Network request starting...');
      
      // Add deviceId as query parameter if provided
      const params = deviceId ? { deviceId } : {};
      const response = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
      console.log('Response received:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch tasks');
      }
      
      const tasks = response.data.data.map(task => ({
        ...task,
        dueDate: task.dueDate // Keep as string until needed as Date object
      }));
      
      // If deviceId is specified but API doesn't support filtering,
      // filter tasks on the client side
      const filteredTasks = deviceId 
        ? tasks.filter(task => !task.deviceId || task.deviceId === deviceId)
        : tasks;
      
      console.log('Processed tasks:', filteredTasks);
      return filteredTasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (axios.isAxiosError(error)) {
        console.error('Network or server error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        if (!error.response) {
          console.error('No response received - possible network connectivity issue');
        }
      }
      throw error;
    }
  },
  
  // Add a new task
  addTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    try {
      console.log('Adding task:', task);
      const response = await apiClient.post<ApiResponse<Task>>('/tasks', task);
      console.log('Add task response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },
  
  // Update an existing task
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    try {
      console.log('Updating task:', id, task);
      const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, task);
      console.log('Update task response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  // Delete a task
  deleteTask: async (id: string): Promise<boolean> => {
    try {
      console.log('Deleting task:', id);
      const response = await apiClient.delete<ApiResponse<boolean>>(`/tasks/${id}`);
      console.log('Delete task response:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  // Delete multiple tasks
  deleteTasks: async (ids: string[]): Promise<boolean> => {
    try {
      console.log('Deleting tasks:', ids);
      const response = await apiClient.delete<ApiResponse<boolean>>('/tasks', {
        data: { ids }
      });
      console.log('Delete tasks response:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting tasks:', error);
      throw error;
    }
  },
  
  // Toggle task completion status
  toggleTaskComplete: async (id: string, completed?: boolean): Promise<Task> => {
    try {
      console.log('Toggling task completion:', id);
      // Nếu không có giá trị completed, hãy gửi giá trị mặc định true
      const response = await apiClient.patch<ApiResponse<Task>>(
        `/tasks/${id}/toggle`,
        { completed: completed !== undefined ? completed : true }
      );
      console.log('Toggle task response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }
};

export default todoService; 