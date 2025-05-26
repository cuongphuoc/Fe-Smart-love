import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ------ CÁCH CẤU HÌNH ĐƠN GIẢN HƠN ------

// Backend API URL - Thay đổi IP này khi cần thiết
const BACKEND_IP = '192.168.1.8'; // Đảm bảo IP này trùng với IP của máy bạn
const API_URL = `http://${BACKEND_IP}:5000/api`;

// Key lưu trữ dữ liệu local
const LOCAL_STORAGE_KEYS = {
  FUND_DATA: 'couple_fund_data',
  LAST_SYNC: 'couple_fund_last_sync',
  PENDING_CHANGES: 'couple_fund_pending_changes',
  USER_ID: 'userId'
};

// Tạo axios instance với timeout phù hợp
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // giảm timeout xuống 10 giây để phát hiện lỗi kết nối nhanh hơn
  headers: {
    'Content-Type': 'application/json'
  }
});

// ------ ĐỊNH NGHĨA INTERFACES ------

// Partner trong quỹ chung
export interface Partner {
  _id?: string;
  name: string;
  email: string;
  contribution: number;
}

// Giao dịch
export interface Transaction {
  _id?: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'expense';
  category: string;
  description?: string;
  date: string;
  createdBy: string;
}

// Mục tiêu của quỹ
export interface Goal {
  name: string;
  amount: number;
  deadline?: string;
  completed: boolean;
}

// Quỹ chung
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

// Bộ lọc cho giao dịch
export interface TransactionFilter {
  type?: 'deposit' | 'withdraw' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Format phản hồi từ API
export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

// Trạng thái mạng
interface NetworkState {
  isConnected: boolean;
  lastChecked: number;
}

// Biến để theo dõi trạng thái mạng
let networkState: NetworkState = {
  isConnected: true,
  lastChecked: 0
};

// ------ REQUEST INTERCEPTOR ------
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Thêm user ID vào header nếu có
      const userId = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);
      if (userId) {
        config.headers['user-id'] = userId;
      }
    } catch (error) {
      console.error('Lỗi khi lấy userId từ AsyncStorage:', error);
    }
    // Log thông tin request để debug
    console.log(`${config.method?.toUpperCase()} request đến: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------ RESPONSE INTERCEPTOR ------
apiClient.interceptors.response.use(
  (response) => {
    // Cập nhật trạng thái mạng
    networkState = {
      isConnected: true,
      lastChecked: Date.now()
    };
    console.log(`Nhận response từ ${response.config.url}, status: ${response.status}`);
    return response;
  },
  async (error) => {
    // Cập nhật trạng thái mạng nếu lỗi kết nối
    if (axios.isAxiosError(error) && !error.response) {
      networkState = {
        isConnected: false,
        lastChecked: Date.now()
      };
      
      console.error('Lỗi kết nối! Không nhận được phản hồi từ server.');
      console.log('Chuyển sang chế độ offline...');
      
      // Check if request was for fetching fund data and try to get from local storage
      const url = error.config?.url;
      if (url && url.includes('/couple-fund') && !url.includes('partners') && !url.includes('transactions')) {
        const localData = await coupleFundService.getLocalData();
        if (localData) {
          console.log('Sử dụng dữ liệu local');
          // Wrap the local data in a response-like object
          return Promise.resolve({ 
            data: { success: true, data: localData },
            status: 200, 
            statusText: 'OK',
            headers: {},
            config: error.config || {} 
          });
        }
      }
      
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'));
    }
    
    // Xử lý các mã lỗi HTTP phổ biến
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return Promise.reject(new Error('Không tìm thấy tài nguyên yêu cầu.'));
        case 401:
          return Promise.reject(new Error('Bạn cần đăng nhập để thực hiện thao tác này.'));
        case 403:
          return Promise.reject(new Error('Bạn không có quyền thực hiện thao tác này.'));
        case 422:
          return Promise.reject(new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'));
        default:
          return Promise.reject(new Error(error.response.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.'));
      }
    }
    
    return Promise.reject(error);
  }
);

// ------ QUẢN LÝ QUỸ CHUNG API ------
const coupleFundService = {
  // Kiểm tra kết nối đến backend
  checkConnection: async (): Promise<boolean> => {
    // Nếu đã kiểm tra gần đây (trong 5 giây), trả về kết quả đã lưu
    if (Date.now() - networkState.lastChecked < 5000) {
      return networkState.isConnected;
    }
    
    try {
      const response = await apiClient.get('/', { timeout: 3000 });
      networkState = {
        isConnected: response.status === 200,
        lastChecked: Date.now()
      };
      return networkState.isConnected;
    } catch (error) {
      networkState = {
        isConnected: false,
        lastChecked: Date.now()
      };
      console.error('Kiểm tra kết nối thất bại:', error);
      return false;
    }
  },
  
  // Lấy thông tin quỹ với fallback sang dữ liệu local
  getFund: async (): Promise<CoupleFund> => {
    try {
      console.log('Đang lấy dữ liệu quỹ chung...');
      
      // Kiểm tra kết nối trước
      const isConnected = await coupleFundService.checkConnection();
      if (!isConnected) {
        console.log('Không có kết nối, sử dụng dữ liệu local');
        const localData = await coupleFundService.getLocalData();
        if (localData) {
          return localData;
        }
        throw new Error('Không có kết nối mạng và không có dữ liệu local');
      }
      
      // Kết nối OK, lấy dữ liệu từ server
      const response = await apiClient.get('/couple-fund');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể lấy dữ liệu quỹ');
      }
      
      const fundData = response.data.data;
      
      // Lưu dữ liệu vào local storage
      await coupleFundService.saveLocalData(fundData);
      
      return fundData;
    } catch (error: any) {
      console.error('Lỗi khi lấy dữ liệu quỹ:', error.message);
      
      // Nếu lỗi kết nối, thử lấy từ local storage
      if (axios.isAxiosError(error) && !error.response) {
        console.log('API không phản hồi, kiểm tra local storage');
        const localData = await coupleFundService.getLocalData();
        if (localData) {
          console.log('Tìm thấy dữ liệu trong local storage');
          return localData;
        }
      }
      
      throw error;
    }
  },
  
  // Cập nhật thông tin quỹ với hỗ trợ offline
  updateFund: async (id: string, fundData: Partial<CoupleFund>): Promise<CoupleFund> => {
    try {
      console.log('Đang cập nhật quỹ ID:', id);
      
      // Lưu thay đổi vào danh sách thay đổi chờ xử lý (để đồng bộ sau khi có mạng)
      await coupleFundService.savePendingChange('update', {id, ...fundData});
      
      // Kiểm tra kết nối
      const isConnected = await coupleFundService.checkConnection();
      if (!isConnected) {
        console.log('Không có kết nối, lưu thay đổi vào bộ nhớ cục bộ');
        
        // Cập nhật dữ liệu local
        const localData = await coupleFundService.getLocalData();
        if (localData && localData._id === id) {
          const updatedData = {...localData, ...fundData, updatedAt: new Date().toISOString()};
          await coupleFundService.saveLocalData(updatedData);
          return updatedData;
        }
        throw new Error('Không có kết nối mạng và không tìm thấy dữ liệu local');
      }
      
      // Kết nối OK, cập nhật trên server
      const response = await apiClient.put('/couple-fund', { id, ...fundData });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể cập nhật thông tin quỹ');
      }
      
      const updatedFund = response.data.data;
      
      // Cập nhật dữ liệu local
      await coupleFundService.saveLocalData(updatedFund);
      
      // Xóa thay đổi khỏi danh sách chờ xử lý
      await coupleFundService.removePendingChange('update', id);
      
      return updatedFund;
    } catch (error: any) {
      console.error('Lỗi khi cập nhật quỹ:', error.message);
      throw error;
    }
  },
  
  // Thêm đối tác vào quỹ
  addPartner: async (partner: { name: string; email: string }): Promise<CoupleFund> => {
    try {
      console.log('Đang thêm đối tác:', partner.name);
      
      // Kiểm tra kết nối
      const isConnected = await coupleFundService.checkConnection();
      if (!isConnected) {
        throw new Error('Không thể thêm đối tác khi không có kết nối mạng');
      }
      
      const response = await apiClient.post('/couple-fund/partners', partner);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể thêm đối tác');
      }
      
      const updatedFund = response.data.data;
      
      // Cập nhật dữ liệu local
      await coupleFundService.saveLocalData(updatedFund);
      
      return updatedFund;
    } catch (error: any) {
      console.error('Lỗi khi thêm đối tác:', error.message);
      throw error;
    }
  },
  
  // Xóa đối tác khỏi quỹ
  removePartner: async (partnerId: string): Promise<CoupleFund> => {
    try {
      console.log('Đang xóa đối tác ID:', partnerId);
      
      // Kiểm tra kết nối
      const isConnected = await coupleFundService.checkConnection();
      if (!isConnected) {
        throw new Error('Không thể xóa đối tác khi không có kết nối mạng');
      }
      
      const response = await apiClient.delete(`/couple-fund/partners/${partnerId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể xóa đối tác');
      }
      
      const updatedFund = response.data.data;
      
      // Cập nhật dữ liệu local
      await coupleFundService.saveLocalData(updatedFund);
      
      return updatedFund;
    } catch (error: any) {
      console.error('Lỗi khi xóa đối tác:', error.message);
      throw error;
    }
  },
  
  // Thêm giao dịch mới
  addTransaction: async (transaction: Omit<Transaction, '_id' | 'date'>): Promise<CoupleFund> => {
    try {
      console.log('Đang thêm giao dịch mới:', transaction.type);
      
      // Lưu giao dịch vào danh sách chờ xử lý
      await coupleFundService.savePendingChange('transaction', transaction);
      
      // Kiểm tra kết nối
      const isConnected = await coupleFundService.checkConnection();
      if (!isConnected) {
        console.log('Không có kết nối, lưu giao dịch vào bộ nhớ cục bộ');
        
        // Cập nhật dữ liệu local tạm thời
        const localData = await coupleFundService.getLocalData();
        if (localData) {
          const newTransaction = {
            _id: `temp_${Date.now()}`,
            ...transaction,
            date: new Date().toISOString()
          };
          
          // Tính toán số dư mới
          let newBalance = localData.balance;
          if (transaction.type === 'deposit') {
            newBalance += transaction.amount;
          } else if (transaction.type === 'withdraw' || transaction.type === 'expense') {
            newBalance -= transaction.amount;
          }
          
          const updatedFund = {
            ...localData,
            balance: newBalance,
            transactions: [newTransaction, ...localData.transactions],
            updatedAt: new Date().toISOString()
          };
          
          await coupleFundService.saveLocalData(updatedFund);
          return updatedFund;
        }
        throw new Error('Không có kết nối mạng và không tìm thấy dữ liệu local');
      }
      
      // Kết nối OK, gửi giao dịch lên server
      const response = await apiClient.post('/couple-fund/transactions', transaction);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể thêm giao dịch');
      }
      
      const updatedFund = response.data.data;
      
      // Cập nhật dữ liệu local
      await coupleFundService.saveLocalData(updatedFund);
      
      // Xóa giao dịch khỏi danh sách chờ xử lý
      await coupleFundService.removePendingChange('transaction', transaction);
      
      return updatedFund;
    } catch (error: any) {
      console.error('Lỗi khi thêm giao dịch:', error.message);
      throw error;
    }
  },
  
  // Lấy danh sách giao dịch với bộ lọc
  getTransactions: async (filters: TransactionFilter = {}): Promise<PaginatedTransactions> => {
    try {
      console.log('Đang lấy danh sách giao dịch với bộ lọc:', filters);
      
      // Kiểm tra kết nối
      const isConnected = await coupleFundService.checkConnection();
      if (!isConnected) {
        console.log('Không có kết nối, lấy giao dịch từ dữ liệu local');
        
        const localData = await coupleFundService.getLocalData();
        if (localData) {
          // Lọc giao dịch theo bộ lọc
          let filteredTransactions = [...localData.transactions];
          
          if (filters.type) {
            filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
          }
          
          if (filters.category) {
            filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
          }
          
          if (filters.startDate) {
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= new Date(filters.startDate!));
          }
          
          if (filters.endDate) {
            filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= new Date(filters.endDate!));
          }
          
          // Phân trang
          const page = filters.page || 1;
          const limit = filters.limit || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const pagedTransactions = filteredTransactions.slice(startIndex, endIndex);
          
          return {
            transactions: pagedTransactions,
            total: filteredTransactions.length,
            page,
            totalPages: Math.ceil(filteredTransactions.length / limit)
          };
        }
        throw new Error('Không có kết nối mạng và không tìm thấy dữ liệu local');
      }
      
      // Kết nối OK, lấy từ server
      const response = await apiClient.get('/couple-fund/transactions', { params: filters });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể lấy danh sách giao dịch');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách giao dịch:', error.message);
      throw error;
    }
  },
  
  // Lưu dữ liệu quỹ vào bộ nhớ cục bộ cho sử dụng offline
  saveLocalData: async (fund: CoupleFund): Promise<void> => {
    try {
      await AsyncStorage.setItem(LOCAL_STORAGE_KEYS.FUND_DATA, JSON.stringify(fund));
      await AsyncStorage.setItem(LOCAL_STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      console.log('Đã lưu dữ liệu quỹ vào bộ nhớ cục bộ');
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu quỹ vào bộ nhớ cục bộ:', error);
    }
  },
  
  // Lấy dữ liệu quỹ từ bộ nhớ cục bộ
  getLocalData: async (): Promise<CoupleFund | null> => {
    try {
      const data = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.FUND_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu quỹ từ bộ nhớ cục bộ:', error);
      return null;
    }
  },
  
  // Lưu thay đổi vào danh sách chờ xử lý
  savePendingChange: async (type: string, data: any): Promise<void> => {
    try {
      // Lấy danh sách thay đổi hiện tại
      const pendingChangesStr = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES) || '{}';
      const pendingChanges = JSON.parse(pendingChangesStr);
      
      // Thêm thay đổi mới
      if (!pendingChanges[type]) {
        pendingChanges[type] = [];
      }
      
      pendingChanges[type].push({
        data,
        timestamp: Date.now()
      });
      
      // Lưu lại
      await AsyncStorage.setItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES, JSON.stringify(pendingChanges));
    } catch (error) {
      console.error('Lỗi khi lưu thay đổi chờ xử lý:', error);
    }
  },
  
  // Xóa thay đổi khỏi danh sách chờ xử lý
  removePendingChange: async (type: string, data: any): Promise<void> => {
    try {
      // Lấy danh sách thay đổi hiện tại
      const pendingChangesStr = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES) || '{}';
      const pendingChanges = JSON.parse(pendingChangesStr);
      
      // Xóa thay đổi
      if (pendingChanges[type]) {
        const id = typeof data === 'string' ? data : (data._id || JSON.stringify(data));
        pendingChanges[type] = pendingChanges[type].filter((change: any) => {
          const changeId = typeof change.data === 'string' ? change.data : (change.data._id || JSON.stringify(change.data));
          return changeId !== id;
        });
      }
      
      // Lưu lại
      await AsyncStorage.setItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES, JSON.stringify(pendingChanges));
    } catch (error) {
      console.error('Lỗi khi xóa thay đổi chờ xử lý:', error);
    }
  },
  
  // Đồng bộ các thay đổi chờ xử lý khi có kết nối
  syncPendingChanges: async (): Promise<boolean> => {
    try {
      // Kiểm tra kết nối
      const isConnected = await coupleFundService.checkConnection();
      if (!isConnected) {
        return false;
      }
      
      // Lấy danh sách thay đổi
      const pendingChangesStr = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES) || '{}';
      const pendingChanges = JSON.parse(pendingChangesStr);
      
      let syncSuccess = true;
      
      // Xử lý các thay đổi theo thứ tự thời gian
      if (pendingChanges.update && pendingChanges.update.length > 0) {
        for (const change of pendingChanges.update) {
          try {
            const { id, ...data } = change.data;
            await apiClient.put('/couple-fund', { id, ...data });
            await coupleFundService.removePendingChange('update', id);
          } catch (error) {
            console.error('Lỗi khi đồng bộ cập nhật:', error);
            syncSuccess = false;
          }
        }
      }
      
      if (pendingChanges.transaction && pendingChanges.transaction.length > 0) {
        for (const change of pendingChanges.transaction) {
          try {
            await apiClient.post('/couple-fund/transactions', change.data);
            await coupleFundService.removePendingChange('transaction', change.data);
          } catch (error) {
            console.error('Lỗi khi đồng bộ giao dịch:', error);
            syncSuccess = false;
          }
        }
      }
      
      // Cập nhật dữ liệu từ server sau khi đã đồng bộ
      if (syncSuccess) {
        try {
          const response = await apiClient.get('/couple-fund');
          if (response.data.success) {
            await coupleFundService.saveLocalData(response.data.data);
          }
        } catch (error) {
          console.error('Lỗi khi cập nhật dữ liệu sau đồng bộ:', error);
        }
      }
      
      return syncSuccess;
    } catch (error) {
      console.error('Lỗi khi đồng bộ thay đổi:', error);
      return false;
    }
  },
  
  // Hàm debug để kiểm tra dữ liệu local storage
  debugLocalStorage: async (): Promise<void> => {
    try {
      console.log('===== DEBUG LOCAL STORAGE =====');
      
      // Kiểm tra dữ liệu quỹ
      const fundData = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.FUND_DATA);
      if (fundData) {
        const parsedData = JSON.parse(fundData);
        console.log('Dữ liệu quỹ:', {
          _id: parsedData._id,
          name: parsedData.name,
          balance: parsedData.balance,
          partnersCount: parsedData.partners?.length || 0,
          transactionsCount: parsedData.transactions?.length || 0,
          goal: parsedData.goal,
          updatedAt: parsedData.updatedAt
        });
        
        if (parsedData.transactions && parsedData.transactions.length > 0) {
          console.log('Giao dịch gần đây:', parsedData.transactions.slice(0, 3));
        }
      } else {
        console.log('Không tìm thấy dữ liệu quỹ trong local storage');
      }
      
      // Kiểm tra thời gian đồng bộ
      const lastSync = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.LAST_SYNC);
      console.log('Lần đồng bộ cuối:', lastSync || 'Chưa đồng bộ');
      
      // Kiểm tra các thay đổi đang chờ
      const pendingChanges = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
      if (pendingChanges) {
        console.log('Thay đổi đang chờ đồng bộ:', JSON.parse(pendingChanges));
      } else {
        console.log('Không có thay đổi đang chờ đồng bộ');
      }
      
      // Kiểm tra userId
      const userId = await AsyncStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID);
      console.log('User ID:', userId || 'Không có');
      
      console.log('===== END DEBUG =====');
    } catch (error) {
      console.error('Lỗi khi debug local storage:', error);
    }
  },
  
  // Xóa toàn bộ dữ liệu local storage
  clearLocalData: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LOCAL_STORAGE_KEYS.FUND_DATA);
      await AsyncStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_SYNC);
      await AsyncStorage.removeItem(LOCAL_STORAGE_KEYS.PENDING_CHANGES);
      console.log('Đã xóa toàn bộ dữ liệu local');
    } catch (error) {
      console.error('Lỗi khi xóa dữ liệu local:', error);
    }
  },
};

export default coupleFundService; 