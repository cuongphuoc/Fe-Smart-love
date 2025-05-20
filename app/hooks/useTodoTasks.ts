import { useState, useEffect, useCallback } from 'react';
import { todoService, Task } from '../api/todoService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for caching
const TASKS_CACHE_KEY = '@todo_list_cache';

// Interface for grouped tasks by date
export interface TasksByDate {
  date: string;
  tasks: Task[];
}

// Extended Task interface with Date object
export interface TaskWithDateObj extends Omit<Task, 'dueDate'> {
  dueDate: Date;
}

// Interface for the hook's return value
interface UseTodoTasksReturn {
  taskList: TasksByDate[];
  isLoading: boolean;
  error: Error | null;
  refreshTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteTasks: (ids: string[]) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
}

// Type guard to check if a value is a Date
function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export const useTodoTasks = (): UseTodoTasksReturn => {
  const [taskList, setTaskList] = useState<TasksByDate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper: Group tasks by date
  const groupTasksByDate = useCallback((tasks: Task[]): TasksByDate[] => {
    const grouped: { [date: string]: TaskWithDateObj[] } = {};
    
    tasks.forEach(task => {
      // Extract the date part from the ISO string
      const dateOnly = task.dueDate.split('T')[0];
      
      if (!grouped[dateOnly]) {
        grouped[dateOnly] = [];
      }
      
      // Convert dueDate string to Date object before adding to the group
      grouped[dateOnly].push({
        ...task,
        dueDate: new Date(task.dueDate)
      } as TaskWithDateObj);
    });
    
    // Convert to array and sort by date
    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({
        date,
        tasks: grouped[date] as unknown as Task[]
      }));
  }, []);

  // Function: Load tasks from the API
  const fetchTasks = useCallback(async (useCachedData = true) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to use cached data first if allowed
      let tasks: Task[] = [];
      
      if (useCachedData) {
        const cachedData = await AsyncStorage.getItem(TASKS_CACHE_KEY);
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          setTaskList(parsedCache);
          setIsLoading(false);
        }
      }
      
      // Fetch from API regardless of cache to ensure we have latest data
      tasks = await todoService.getAllTasks();
      
      // Group by date and update state
      const groupedTasks = groupTasksByDate(tasks);
      setTaskList(groupedTasks);
      
      // Cache the latest data
      await AsyncStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(groupedTasks));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupTasksByDate]);

  // Function: Refresh tasks
  const refreshTasks = useCallback(async () => {
    await fetchTasks(false);
  }, [fetchTasks]);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Function: Add a task
  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Ensure dueDate is in ISO format string for API
      const apiTask = {
        ...task,
        dueDate: isDate(task.dueDate as unknown as Date)
          ? (task.dueDate as unknown as Date).toISOString()
          : task.dueDate
      };
      
      // Call API to add task
      const newTask = await todoService.addTask(apiTask);
      
      // Refresh the task list to get the updated data
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error adding task'));
      console.error('Error adding task:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTasks]);

  // Function: Update a task
  const updateTask = useCallback(async (id: string, taskUpdate: Partial<Task>) => {
    try {
      setIsLoading(true);
      
      // Ensure dueDate is in ISO format string for API if present
      const apiTaskUpdate = {
        ...taskUpdate,
        dueDate: taskUpdate.dueDate && isDate(taskUpdate.dueDate as unknown as Date)
          ? (taskUpdate.dueDate as unknown as Date).toISOString()
          : taskUpdate.dueDate
      };
      
      // Call API to update task
      await todoService.updateTask(id, apiTaskUpdate);
      
      // Refresh the task list
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error updating task'));
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTasks]);

  // Function: Delete a task
  const deleteTask = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      
      // Call API to delete task
      await todoService.deleteTask(id);
      
      // Update local state immediately for better UX
      setTaskList(prevList => 
        prevList.map(section => ({
          ...section,
          tasks: section.tasks.filter(task => task.id !== id)
        })).filter(section => section.tasks.length > 0)
      );
      
      // Refresh to ensure sync with server
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error deleting task'));
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTasks]);

  // Function: Delete multiple tasks
  const deleteTasks = useCallback(async (ids: string[]) => {
    try {
      setIsLoading(true);
      
      // Call API to delete multiple tasks
      await todoService.deleteTasks(ids);
      
      // Update local state immediately
      setTaskList(prevList => 
        prevList.map(section => ({
          ...section,
          tasks: section.tasks.filter(task => !ids.includes(task.id))
        })).filter(section => section.tasks.length > 0)
      );
      
      // Refresh to ensure sync with server
      await refreshTasks();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error deleting tasks'));
      console.error('Error deleting tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTasks]);

  // Function: Toggle task completion status
  const toggleTaskComplete = useCallback(async (id: string) => {
    try {
      // Find the task to toggle
      let taskToToggle: Task | undefined;
      let newStatus = false;
      
      taskList.forEach(section => {
        section.tasks.forEach(task => {
          if (task.id === id) {
            taskToToggle = task;
            newStatus = !task.completed;
          }
        });
      });
      
      if (!taskToToggle) return;
      
      // Update local state immediately for better UX
      setTaskList(prevList => 
        prevList.map(section => ({
          ...section,
          tasks: section.tasks.map(task => 
            task.id === id ? { ...task, completed: newStatus } : task
          )
        }))
      );
      
      // Call API to toggle completion status
      await todoService.toggleTaskComplete(id, newStatus);
      
      // No need to refresh tasks as we've already updated the local state
      // and the API response shouldn't contain any new information
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error toggling task completion'));
      console.error('Error toggling task completion:', err);
      
      // Revert the optimistic update if API call fails
      await refreshTasks();
    }
  }, [taskList, refreshTasks]);

  return {
    taskList,
    isLoading,
    error,
    refreshTasks,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    toggleTaskComplete
  };
}; 