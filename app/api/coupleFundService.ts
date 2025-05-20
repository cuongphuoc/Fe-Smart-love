import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom error class
class ApiError extends Error {
  type: string;
  
  constructor(message: string, type: string) {
    super(message);
    this.type = type;
    this.name = 'ApiError';
  }
}


// Get the API URL from environment variables
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.2:5000';

// Determine if running in development mode
const isDev = __DEV__;

// Determine the base URL based on the platform
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return isDev ? '/api' : '/api';
  } else if (Platform.OS === 'android') {
    return isDev ? 'http://192.168.1.2:5000/api' : API_URL + '/api';
  } else if (Platform.OS === 'ios') {
    return isDev ? 'http://192.168.1.2:5000/api' : API_URL + '/api';
  }
  return API_URL + '/api';
};

const API_BASE_URL = getBaseUrl();
console.log('Using API URL:', API_BASE_URL);

// Create axios instance with timeout and better error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increase timeout to 60 seconds
  headers: {
    'Content-Type': 'application/json',
    'user-id': 'default_user' // Default user ID
  }
});

// Add custom retry configuration
apiClient.defaults.maxRetries = 3;
apiClient.defaults.retryDelay = 1000;

// Extend AxiosRequestConfig type
declare module 'axios' {
  interface AxiosRequestConfig {
    maxRetries?: number;
    retryCount?: number;
    retryDelay?: number;
  }
}

// Custom error types
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
};

// Add request interceptor to include user-id from AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        config.headers['user-id'] = userId;
      }
    } catch (error) {
      console.error('Error getting userId from AsyncStorage:', error);
    }
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with improved error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url} status: ${response.status}`);
    return response;
  },
  (error) => {
    let apiError;
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout! Server might be down or unreachable.');
      apiError = new ApiError(error.message, API_ERROR_TYPES.TIMEOUT_ERROR);
    } else if (!error.response) {
      console.error('Network error! No response received from server.');
      apiError = new ApiError(error.message, API_ERROR_TYPES.NETWORK_ERROR);
    } else {
      let type = API_ERROR_TYPES.SERVER_ERROR;
      switch (error.response.status) {
        case 404:
          type = API_ERROR_TYPES.NOT_FOUND;
          break;
        case 422:
          type = API_ERROR_TYPES.VALIDATION_ERROR;
          break;
      }
      apiError = new ApiError(error.message, type);
    }
    
    return Promise.reject(apiError);
  }
);

// Add retry interceptor
apiClient.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !config.maxRetries) return Promise.reject(err);

  config.retryCount = config.retryCount || 0;
  
  if (config.retryCount >= config.maxRetries) {
    return Promise.reject(err);
  }
  
  config.retryCount += 1;
  console.log(`Retrying request (${config.retryCount}/${config.maxRetries})...`);
  
  // Delay before retrying
  const delayMs = config.retryDelay || 1000;
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  return apiClient(config);
});

// Interface definitions
export interface Partner {
  _id?: string;
  name: string;
  email: string;
  contribution: number;
}

export interface Transaction {
  _id?: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'expense';
  category: string;
  description?: string;
  date: string;
  createdBy: string;
}

export interface Goal {
  name: string;
  amount: number;
  deadline?: string;
  completed: boolean;
}

export interface CoupleFund {
  _id?: string;
  name: string;
  balance: number;
  partners: Partner[];
  transactions: Transaction[];
  goal: Goal;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilter {
  type?: 'deposit' | 'withdraw' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

// API response interfaces
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// Add sync timestamp to interface
interface SyncInfo {
  lastSync: string;
  userId: string;
}

// Add sync info storage key
const SYNC_INFO_KEY = 'couple_funds_sync_info';

// Modified service with sync handling
const coupleFundService = {
  // Get sync info
  getSyncInfo: async (): Promise<SyncInfo | null> => {
    try {
      const syncInfo = await AsyncStorage.getItem(SYNC_INFO_KEY);
      return syncInfo ? JSON.parse(syncInfo) : null;
    } catch (error) {
      console.error('Error getting sync info:', error);
      return null;
    }
  },

  // Save sync info
  saveSyncInfo: async (syncInfo: SyncInfo) => {
    try {
      await AsyncStorage.setItem(SYNC_INFO_KEY, JSON.stringify(syncInfo));
    } catch (error) {
      console.error('Error saving sync info:', error);
    }
  },

  // Get all funds with sync
  getAllFunds: async (): Promise<CoupleFund[]> => {
    try {
      console.log('Fetching funds with sync...');
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      
      // Get last sync info
      const syncInfo = await coupleFundService.getSyncInfo();
      console.log('Last sync info:', syncInfo);

      const response = await apiClient.get<ApiResponse<CoupleFund[]>>('/couple-fund', {
        headers: {
          'user-id': userId,
          'last-sync': syncInfo?.lastSync || ''
        }
      });

      if (response.data.success) {
        const funds = response.data.data;
        console.log('Received', funds.length, 'funds from server');

        // Save sync info
        await coupleFundService.saveSyncInfo({
          lastSync: response.data.timestamp || new Date().toISOString(),
          userId
        });

        // Save to local storage
        await AsyncStorage.setItem(SYNC_INFO_KEY, JSON.stringify({
          lastSync: response.data.timestamp || new Date().toISOString(),
          userId
        }));
        
        return funds;
      }
      
      throw new Error('Failed to fetch funds');
    } catch (error) {
      console.error('Error fetching funds:', error);
      throw error;
    }
  },

  // Update fund with sync
  updateFund: async (id: string, fundData: Partial<CoupleFund>): Promise<CoupleFund> => {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      const response = await apiClient.put<ApiResponse<CoupleFund>>('/couple-fund', 
        { id, ...fundData },
        { headers: { 'user-id': userId } }
      );

      if (response.data.success) {
        const updatedFund = response.data.data;
        
        // Update local storage
        const storedData = await AsyncStorage.getItem(SYNC_INFO_KEY);
        if (storedData) {
          const syncInfo = JSON.parse(storedData);
          const updatedSyncInfo = {
            ...syncInfo,
            lastSync: new Date().toISOString()
          };
          await AsyncStorage.setItem(SYNC_INFO_KEY, JSON.stringify(updatedSyncInfo));
        }

        return updatedFund;
      }
      
      throw new Error('Failed to update fund');
    } catch (error) {
      console.error('Error updating fund:', error);
      throw error;
    }
  },

  // Get fund data
  getFund: async (): Promise<CoupleFund> => {
    try {
      console.log('Fetching couple fund data');
      const response = await apiClient.get<ApiResponse<CoupleFund>>('/couple-fund');
      
      if (!response.data.success) {
        throw new ApiError(
          response.data.message || 'Failed to fetch couple fund',
          API_ERROR_TYPES.SERVER_ERROR
        );
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching couple fund:', error);
      throw error;
    }
  },
  
  // Add partner
  addPartner: async (partner: { name: string; email: string }): Promise<CoupleFund> => {
    try {
      console.log('Adding partner:', partner);
      const response = await apiClient.post<ApiResponse<CoupleFund>>('/couple-fund/partners', partner);
      
      if (!response.data.success) {
        throw new ApiError(response.data.message || 'Failed to add partner', API_ERROR_TYPES.SERVER_ERROR);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding partner:', error);
      throw error;
    }
  },
  
  // Remove partner
  removePartner: async (partnerId: string): Promise<CoupleFund> => {
    try {
      console.log('Removing partner:', partnerId);
      const response = await apiClient.delete<ApiResponse<CoupleFund>>(`/couple-fund/partners/${partnerId}`);
      
      if (!response.data.success) {
        throw new ApiError(response.data.message || 'Failed to remove partner', API_ERROR_TYPES.SERVER_ERROR);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error removing partner:', error);
      throw error;
    }
  },
  
  // Add transaction
  addTransaction: async (transaction: Omit<Transaction, '_id' | 'date'>): Promise<CoupleFund> => {
    try {
      console.log('Adding transaction:', transaction);
      const response = await apiClient.post<ApiResponse<CoupleFund>>('/couple-fund/transactions', transaction);
      
      if (!response.data.success) {
        throw new ApiError(response.data.message || 'Failed to add transaction', API_ERROR_TYPES.SERVER_ERROR);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },
  
  // Get transactions with filtering and pagination
  getTransactions: async (filters: TransactionFilter = {}): Promise<PaginatedTransactions> => {
    try {
      console.log('Fetching transactions with filters:', filters);
      const response = await apiClient.get<ApiResponse<PaginatedTransactions>>('/couple-fund/transactions', {
        params: filters
      });
      
      if (!response.data.success) {
        throw new ApiError(response.data.message || 'Failed to fetch transactions', API_ERROR_TYPES.SERVER_ERROR);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }
};

export default coupleFundService; 