import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Platform,
  StyleSheet,
  AppState,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../assets/styles/CoupleFundStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import ConfettiCannon from 'react-native-confetti-cannon';
import { registerForPushNotificationsAsync, sendFundCompletionNotification } from '../../utils/notifications';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Constants
const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://192.168.1.2:5000/api/couple-fund'  // Use computer's IP address
  : 'http://192.168.1.2:5000/api/couple-fund'; // Use computer's IP address for iOS too
const STORAGE_KEY = 'couple_funds_data';
const MAX_FUNDS = 20; // Allow up to 20 funds
const { width } = Dimensions.get('window');

// Types
interface Fund {
  id: string;
  image: string;
  amount: string;
  targetAmount: string;
  avatars: string[];
  altImage: string;
  altAvatar1: string;
  altAvatar2: string;
  title: string;
  description: string;
  createdAt: string;
  modifiedAt?: string;
}

// API Service
const fundService = {
  async getAllFunds(): Promise<Fund[]> {
    try {
      // Set timeout for API call to prevent hanging
      const userId = await AsyncStorage.getItem('userId') || 'default_user'; // Get userId from storage
      console.log('Fetching funds with userId:', userId);
      console.log('API URL:', API_BASE_URL);
      
      const response = await axios.get(API_BASE_URL, {
        headers: {
          'user-id': userId
        },
        timeout: 5000 // 5 second timeout to prevent hanging
      });
      
      console.log('API response:', response.status, response.statusText);
      
      if (response.data && response.data.success) {
        const data = response.data.data || [];
        console.log('Funds retrieved:', data.length);
        return data.map((fund: any) => ({
          id: fund._id,
          title: fund.name,
          description: fund.description || "Let's create goals and make dreams come true",
          image: fund.image || '',
          amount: formatAmount(fund.balance.toString()),
          targetAmount: formatAmount(fund.goal.amount.toString()),
          avatars: fund.avatarUrls || [],
          altImage: fund.altImage || 'Fund image',
          altAvatar1: fund.altAvatar1 || 'Avatar of person 1',
          altAvatar2: fund.altAvatar2 || 'Avatar of person 2',
          createdAt: formatDateTime(new Date(fund.createdAt)),
          modifiedAt: fund.updatedAt !== fund.createdAt ? formatDateTime(new Date(fund.updatedAt)) : undefined
        }));
      }
      console.log('No funds found or API response format incorrect');
      return [];
    } catch (error) {
      console.error('Error fetching funds:', error);
      // Return empty array instead of throwing to avoid crashing
      return [];
    }
  },

  async createFund(fundData: Partial<Fund>): Promise<Fund> {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      const requestData = {
        name: fundData.title,
        description: fundData.description,
        balance: parseInt(fundData.amount?.replace(/[^\d]/g, '') || '0'),
        image: fundData.image,
        avatarUrls: fundData.avatars,
        goal: {
          name: fundData.title,
          amount: parseInt(fundData.targetAmount?.replace(/[^\d]/g, '') || '0')
        }
      };

      const response = await axios.put(API_BASE_URL, requestData, {
        headers: {
          'user-id': userId
        }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        return {
          id: data._id,
          title: data.name,
          description: data.description || "Let's create goals and make dreams come true",
          image: data.image || '',
          amount: formatAmount(data.balance.toString()),
          targetAmount: formatAmount(data.goal.amount.toString()),
          avatars: data.avatarUrls || [],
          altImage: data.altImage || 'Fund image',
          altAvatar1: data.altAvatar1 || 'Avatar of person 1',
          altAvatar2: data.altAvatar2 || 'Avatar of person 2',
          createdAt: formatDateTime(new Date(data.createdAt)),
          modifiedAt: undefined
        };
      }
      throw new Error('Failed to create fund');
    } catch (error) {
      console.error('Error creating fund:', error);
      throw error;
    }
  },

  async updateFund(id: string, fundData: Partial<Fund>): Promise<Fund> {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      const requestData = {
        id,
        name: fundData.title,
        description: fundData.description,
        balance: parseInt(fundData.amount?.replace(/[^\d]/g, '') || '0'),
        image: fundData.image,
        avatarUrls: fundData.avatars,
        goal: {
          name: fundData.title,
          amount: parseInt(fundData.targetAmount?.replace(/[^\d]/g, '') || '0')
        }
      };

      const response = await axios.put(API_BASE_URL, requestData, {
        headers: {
          'user-id': userId
        }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        return {
          id: data._id,
          title: data.name,
          description: data.description,
          image: data.image || '',
          amount: formatAmount(data.balance.toString()),
          targetAmount: formatAmount(data.goal.amount.toString()),
          avatars: data.avatarUrls || [],
          altImage: data.altImage || 'Fund image',
          altAvatar1: data.altAvatar1 || 'Avatar of person 1',
          altAvatar2: data.altAvatar2 || 'Avatar of person 2',
          createdAt: formatDateTime(new Date(data.createdAt)),
          modifiedAt: formatDateTime(new Date(data.updatedAt))
        };
      }
      throw new Error('Failed to update fund');
    } catch (error) {
      console.error('Error updating fund:', error);
      throw error;
    }
  },

  async addTransaction(id: string, amount: number, type: string = 'deposit', description: string = ''): Promise<Fund> {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      const requestData = {
        fundId: id,
        amount,
        type,
        category: type === 'deposit' ? 'Income' : 'Expense',
        description,
        createdBy: 'User'
      };

      const response = await axios.post(`${API_BASE_URL}/transactions`, requestData, {
        headers: {
          'user-id': userId
        }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        return {
          id: data._id,
          title: data.name,
          description: data.description,
          image: data.image || 'https://storage.googleapis.com/a1aa/image/771bcb81-a9ea-48f4-f960-9d4345331456.jpg',
          amount: formatAmount(data.balance.toString()),
          targetAmount: formatAmount(data.goal.amount.toString()),
          avatars: data.avatarUrls || [
            'https://storage.googleapis.com/a1aa/image/209b0077-8f69-4baa-1e6e-d52c4c97a589.jpg',
            'https://storage.googleapis.com/a1aa/image/53530cbf-ea2d-420d-0ab9-2b0982e4d2ac.jpg',
          ],
          altImage: 'Fund image',
          altAvatar1: 'Avatar of person 1',
          altAvatar2: 'Avatar of person 2',
          createdAt: formatDateTime(new Date(data.createdAt)),
          modifiedAt: formatDateTime(new Date(data.updatedAt))
        };
      }
      throw new Error('Failed to add transaction');
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  async deleteFund(id: string): Promise<boolean> {
    try {
      console.log('Attempting to delete fund:', id);
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          'user-id': userId
        },
        timeout: 5000 // 5 second timeout
      });

      console.log('Delete response:', response.status, response.data);
      
      if (response.data && response.data.success) {
        console.log('Fund deleted successfully');
        return true;
      }
      
      console.log('Delete failed:', response.data?.message);
      return false;
    } catch (error: any) {
      console.error('Error deleting fund:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        console.log('Fund not found or already deleted');
        return true; // Consider it deleted if not found
      }
      throw error;
    }
  }
};

// Helper functions
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const isKeywordInText = (keyword: string, text: string): boolean => {
  const normalizedKeyword = normalizeText(keyword);
  const normalizedText = normalizeText(text);
  const keywords = normalizedKeyword.split(/\s+/);
  return keywords.every(word => normalizedText.includes(word));
};

const formatNumberWithDots = (number: string): string => {
  const cleanNumber = number.replace(/[^\d]/g, '');
  if (!cleanNumber) return '';
  const num = parseInt(cleanNumber, 10);
  // Use dots for thousand separators
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const formatAmount = (amount: string): string => {
  const formattedNumber = formatNumberWithDots(amount);
  return formattedNumber ? `${formattedNumber}đ` : '';
};

const calculateProgress = (current: string, target: string): number => {
  const currentAmount = parseInt(current.replace(/[^\d]/g, ''), 10) || 0;
  const targetAmount = parseInt(target.replace(/[^\d]/g, ''), 10) || 0;
  if (targetAmount === 0) return 0;
  const percentage = (currentAmount / targetAmount) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

const formatDateTime = (date: Date): string => {
  const dateStr = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${dateStr} - ${timeStr}`;
};

// Components
const FundProgressBar = ({ progress }: { progress: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentAnim = useRef(new Animated.Value(0)).current;
  const [displayedPercent, setDisplayedPercent] = useState('0.00');
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(percentAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      })
    ]).start();
    
    // Update displayed percentage based on animation
    percentAnim.addListener(({ value }) => {
      setDisplayedPercent(value.toFixed(2));
    });
    
    // Set final value after animation
    setTimeout(() => {
      setDisplayedPercent(progress.toFixed(2));
      percentAnim.removeAllListeners();
    }, 1100);
    
    return () => {
      percentAnim.removeAllListeners();
    };
  }, [progress]);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>
      <Text style={styles.progressText}>{displayedPercent}%</Text>
    </View>
  );
};

const CoupleFundScreen: React.FC = () => {
  // Add font loading state
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...FontAwesome.font,
        ...FontAwesome5.font,
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // State
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFunds, setFilteredFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const [editingFund, setEditingFund] = useState({
    title: '',
    description: '',
    currentAmount: '',
    targetAmount: '',
  });

  const [newFund, setNewFund] = useState({
    title: '',
    description: '',
    currentAmount: '',
    targetAmount: '',
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);
  const [notificationsPermission, setNotificationsPermission] = useState(false);
  const [notifiedFunds, setNotifiedFunds] = useState<string[]>([]);

  const navigation = useNavigation();

  // Add refreshing state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add onRefresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadFundsData();
    } catch (error) {
      console.error('Error refreshing funds:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    // Initial load
    loadFundsData();

    // Set up auto-sync interval (every 30 seconds)
    const syncInterval = setInterval(() => {
      console.log('Auto-syncing funds...');
      loadFundsData();
    }, 30000);

    // Set up focus listener for tab navigation
    const unsubscribeFocus = navigation?.addListener('focus', () => {
      console.log('CoupleFund tab focused, reloading data');
      loadFundsData();
    });

    // Set up app state listener for background/foreground transitions
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App came to foreground, syncing data...');
        loadFundsData();
      }
    });

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      if (unsubscribeFocus) unsubscribeFocus();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    setFilteredFunds(funds);
  }, [funds]);

  useEffect(() => {
    if (selectedFund) {
      const progress = calculateProgress(selectedFund.amount, selectedFund.targetAmount);
      if (progress >= 100) {
        setShowCelebration(true);
        setTimeout(() => {
          confettiRef.current?.start();
        }, 500);
      } else {
        setShowCelebration(false);
      }
    }
  }, [selectedFund]);

  // Request notifications permission on mount
  useEffect(() => {
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      setNotificationsPermission(!!token);

      // Load notified funds from storage
      try {
        const storedNotifiedFunds = await AsyncStorage.getItem('notified_funds');
        if (storedNotifiedFunds) {
          setNotifiedFunds(JSON.parse(storedNotifiedFunds));
        }
      } catch (error) {
        console.error('Error loading notified funds:', error);
      }
    };
    
    setupNotifications();
  }, []);
  
  // Check for fund completion and trigger notification
  useEffect(() => {
    const checkFundsCompletion = async () => {
      if (!notificationsPermission) return;
      
      const completedFunds = funds.filter(fund => {
        const progress = calculateProgress(fund.amount, fund.targetAmount);
        return progress >= 100 && !notifiedFunds.includes(fund.id);
      });
      
      if (completedFunds.length > 0) {
        const newNotifiedFunds = [...notifiedFunds];
        
        for (const fund of completedFunds) {
          // Send notification for each newly completed fund
          await sendFundCompletionNotification(fund.title);
          newNotifiedFunds.push(fund.id);
        }
        
        // Save the updated list of notified funds
        setNotifiedFunds(newNotifiedFunds);
        await AsyncStorage.setItem('notified_funds', JSON.stringify(newNotifiedFunds));
      }
    };
    
    checkFundsCompletion();
  }, [funds, notificationsPermission, notifiedFunds]);

  // Modified loadFundsData function to handle synchronization better
  const loadFundsData = async () => {
    console.log('Starting to load funds data');
    
    try {
      // Try to get fresh data from API
      console.log('Attempting to load from API');
      const apiData = await fundService.getAllFunds();
      
      if (apiData && apiData.length > 0) {
        console.log('Successfully loaded data from API, found', apiData.length, 'funds');
        setFunds(apiData);
        
        // Update local storage with fresh data
        await saveFundsData(apiData);
        return;
      }

      console.log('API returned no data, checking local storage');
      
      // If API returns no data, try to load from local storage
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        console.log('Found data in local storage');
        const localFunds = JSON.parse(storedData) as Fund[];
        setFunds(localFunds);
      } else {
        console.log('No data found in local storage');
        setFunds([]);
      }
    } catch (error) {
      console.error('Error in loadFundsData:', error);
      
      // If API call fails, try to load from local storage
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          console.log('Loading from local storage after API error');
          const localFunds = JSON.parse(storedData) as Fund[];
          setFunds(localFunds);
        }
      } catch (storageError) {
        console.error('Error loading from local storage:', storageError);
        setFunds([]);
      }

      // Show error only if it's a network error
      if (axios.isAxiosError(error)) {
        Alert.alert(
          'Connection Error',
          'Could not connect to server. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveFundsData = async (updatedFunds: Fund[]) => {
    try {
      // Save to local storage as backup
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFunds));
    } catch (error) {
      console.error('Error saving funds to local storage:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newImageUri = result.assets[0].uri;
        
        // Convert to base64 if not already available
        const base64Image = result.assets[0].base64 
          ? `data:image/jpeg;base64,${result.assets[0].base64}`
          : await convertImageToBase64(newImageUri);
          
        console.log('Image selected, size:', base64Image.length);
        
        // Cập nhật UI tạm thời chỉ cho fund hiện tại
        if (selectedFund) {
          // Tạo một bản sao tạm thời của fund được chọn với ảnh mới
          const updatedSelectedFund = {
            ...selectedFund,
            image: newImageUri // Hiển thị ảnh local trước khi upload
          };
          
          // Cập nhật UI cho fund được chọn
          setSelectedImage(newImageUri);
          setSelectedFund(updatedSelectedFund);
          
          try {
            console.log('Updating fund with new image...');
            
            // Update fund with base64 image (will be stored on server)
            const updatedFund = await fundService.updateFund(selectedFund.id, { 
              image: base64Image,
              // Make sure to pass existing values to avoid resetting them
              title: selectedFund.title,
              description: selectedFund.description,
              amount: selectedFund.amount,
              targetAmount: selectedFund.targetAmount
            });
            
            console.log('Fund updated with new image:', updatedFund.image);
            
            // Cập nhật state với fund đã cập nhật từ server
            setSelectedFund(updatedFund);
            
            // Cập nhật mảng funds nhưng chỉ thay đổi fund hiện tại
            const updatedFunds = funds.map(fund => 
              fund.id === selectedFund.id ? updatedFund : fund
            );
            
            setFunds(updatedFunds);
            await saveFundsData(updatedFunds);
            
            // Xóa ảnh tạm sau khi đã cập nhật thành công
            setSelectedImage(null);
            
            // Alert user of success
            Alert.alert('Success', 'Image updated successfully');
          } catch (error) {
            console.error('Error updating fund image:', error);
            Alert.alert('Error', 'Failed to update fund image. Please try again.');
            
            // Khôi phục lại ảnh gốc nếu gặp lỗi
            setSelectedImage(null);
            setSelectedFund({
              ...selectedFund,
              image: selectedFund.image
            });
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Helper to convert an image URI to base64
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
  };

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredFunds(funds);
      return;
    }

    const searchResults = funds.filter(fund => {
      if (isKeywordInText(text, fund.title)) return true;
      if (isKeywordInText(text, fund.description)) return true;
      
      const cleanAmount = fund.amount.replace(/[^\d]/g, '');
      const cleanTargetAmount = fund.targetAmount.replace(/[^\d]/g, '');
      const searchNumber = text.replace(/[^\d]/g, '');
      
      if (searchNumber && (
        cleanAmount.includes(searchNumber) || 
        cleanTargetAmount.includes(searchNumber)
      )) return true;
      
      if (isKeywordInText(text, fund.createdAt)) return true;
      if (fund.modifiedAt && isKeywordInText(text, fund.modifiedAt)) return true;
      
      return false;
    });

    setFilteredFunds(searchResults);
  }, [funds]);

  const handleAmountInput = (text: string, type: 'current' | 'target', setState: any) => {
    if (!text.trim()) {
      setState((prev: any) => ({
        ...prev,
        [type === 'current' ? 'currentAmount' : 'targetAmount']: ''
      }));
      return;
    }

    const formattedNumber = formatNumberWithDots(text);
    setState((prev: any) => ({
      ...prev,
      [type === 'current' ? 'currentAmount' : 'targetAmount']: formattedNumber
    }));
  };

  const handleCreateFund = async () => {
    if (!newFund.title || !newFund.targetAmount) {
      Alert.alert('Missing information', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const formattedAmount = newFund.currentAmount ? formatAmount(newFund.currentAmount) : "0đ";
      const formattedTargetAmount = formatAmount(newFund.targetAmount);
      
      const fundData = {
        title: newFund.title,
        description: newFund.description || "Let's create goals and make dreams come true",
        image: '', // No preset image
        amount: formattedAmount,
        targetAmount: formattedTargetAmount,
        avatars: [] // No preset avatars
      };
      
      // Create fund via API
      const newFundData = await fundService.createFund(fundData);
      
      // Update local state
      const updatedFunds = [...funds, newFundData];
      setFunds(updatedFunds);
      await saveFundsData(updatedFunds);
      
      // Reset form
      setNewFund({
        title: '',
        description: '',
        currentAmount: '',
        targetAmount: '',
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error creating fund:', error);
      Alert.alert('Error', 'Failed to create fund. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFund = async () => {
    if (!selectedFund || !editingFund.title || !editingFund.targetAmount) {
      Alert.alert('Missing information', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const formattedCurrentAmount = editingFund.currentAmount ? formatAmount(editingFund.currentAmount) : "0đ";
      const formattedTargetAmount = formatAmount(editingFund.targetAmount);
      
      const currentAmountValue = parseInt(formattedCurrentAmount.replace(/[^\d]/g, ''), 10);
      const prevAmountValue = parseInt(selectedFund.amount.replace(/[^\d]/g, ''), 10);
      
      // Logging for debugging
      console.log('Editing fund - current amount value:', currentAmountValue);
      console.log('Editing fund - prev amount value:', prevAmountValue);
      
      const fundData = {
        title: editingFund.title,
        description: editingFund.description || selectedFund.description,
        amount: formattedCurrentAmount,
        targetAmount: formattedTargetAmount,
        image: selectedImage || selectedFund.image,
      };
      
      // Update fund via API
      const updatedFund = await fundService.updateFund(selectedFund.id, fundData);
      
      // Update local state
      const updatedFunds = funds.map(fund => 
        fund.id === selectedFund.id ? updatedFund : fund
      );

      setFunds(updatedFunds);
      await saveFundsData(updatedFunds);
      setSelectedFund(updatedFund);
      setIsEditMode(false);
      
      // Check if fund was just completed
      const progress = calculateProgress(formattedCurrentAmount, formattedTargetAmount);
      if (progress >= 100 && notificationsPermission && !notifiedFunds.includes(updatedFund.id)) {
        await sendFundCompletionNotification(updatedFund.title);
        const newNotifiedFunds = [...notifiedFunds, updatedFund.id];
        setNotifiedFunds(newNotifiedFunds);
        await AsyncStorage.setItem('notified_funds', JSON.stringify(newNotifiedFunds));
      }
    } catch (error) {
      console.error('Error updating fund:', error);
      Alert.alert('Error', 'Failed to update fund. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFund = async () => {
    if (!selectedFund) return;

    Alert.alert(
      'Delete Fund',
      'Are you sure you want to delete this fund? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Delete fund via API
              await fundService.deleteFund(selectedFund.id);
              
              // Update local state
              const updatedFunds = funds.filter(fund => fund.id !== selectedFund.id);
              setFunds(updatedFunds);
              await saveFundsData(updatedFunds);
              setSelectedFund(null);
            } catch (error) {
              console.error('Error deleting fund:', error);
              Alert.alert('Error', 'Failed to delete fund. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Function to explode confetti manually for completed funds
  const triggerCelebration = () => {
    confettiRef.current?.start();
  };

  // Render functions
  const renderFundItem = ({ item }: { item: Fund }) => {
    const progress = calculateProgress(item.amount, item.targetAmount);
    const isCompleted = progress >= 100;
    
    // Đảm bảo sử dụng ảnh riêng của mỗi fund
    const fundImage = item.image;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // Reset selectedImage khi chọn một fund mới để tránh hiển thị ảnh từ fund trước đó
          setSelectedImage(null);
          setSelectedFund(item);
        }}
      >
        {fundImage ? (
          <Image
            source={{ uri: fundImage }}
            style={styles.cardImage}
            accessibilityLabel={item.altImage}
          />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <FontAwesome5 name="money-bill-wave" size={32} color="#e5e5e5" />
          </View>
        )}
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>{item.createdAt}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.amountContainerCard}>
            {isCompleted ? (
              <View style={styles.completedStatus}>
                <FontAwesome5 name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.completedText}>DONE</Text>
              </View>
            ) : (
              <>
                <Text style={styles.cardAmount}>{item.amount}</Text>
                <Text style={styles.cardTargetAmount}>/{item.targetAmount}</Text>
              </>
            )}
          </View>
          <View style={styles.avatarContainer}>
            {item.avatars && item.avatars.length > 0 ? (
              item.avatars.map((avatar, index) => (
                <Image
                  key={index}
                  source={{ uri: avatar }}
                  style={styles.avatar}
                  accessibilityLabel={index === 0 ? item.altAvatar1 : item.altAvatar2}
                />
              ))
            ) : (
              <View style={styles.avatar}>
                <FontAwesome5 name="user" size={18} color="#e5e5e5" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <FontAwesome name="search" size={16} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, description, amount..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              handleSearch('');
            }}
            style={styles.clearButton}
          >
            <FontAwesome name="times-circle" size={16} color="#666666" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          setIsSearchVisible(false);
          setSearchQuery('');
          handleSearch('');
        }}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery.length > 0
          ? 'No funds were found matching your keywords!'
          : 'No funds have been created yet!'}
      </Text>
    </View>
  );

  const renderEditInputs = () => (
    <>
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Fund Title"
        value={editingFund.title}
        onChangeText={(text) => setEditingFund(prev => ({ ...prev, title: text }))}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        value={editingFund.description}
        onChangeText={(text) => setEditingFund(prev => ({ ...prev, description: text }))}
        multiline
      />
      <View style={styles.amountInputContainer}>
        <Text style={styles.amountInputLabel}>Current Amount</Text>
        <TextInput
          style={styles.amountInput}
          value={editingFund.currentAmount}
          onChangeText={(text) => handleAmountInput(text, 'current', setEditingFund)}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.amountInputContainer}>
        <Text style={styles.amountInputLabel}>Target Amount</Text>
        <TextInput
          style={styles.amountInput}
          value={editingFund.targetAmount}
          onChangeText={(text) => handleAmountInput(text, 'target', setEditingFund)}
          keyboardType="numeric"
        />
      </View>
    </>
  );

  const renderFundDetail = () => {
    if (!selectedFund) return null;
    
    const progress = calculateProgress(selectedFund.amount, selectedFund.targetAmount);
    const isCompleted = progress >= 100;
    
    // Sử dụng selectedImage nếu có (ảnh đang được chọn tạm thời) 
    // hoặc ảnh của fund được chọn
    const displayImage = selectedImage || selectedFund.image;
    
    return (
      <SafeAreaView style={styles.detailContainer}>
        <View style={[styles.detailHeader, { paddingTop: insets.top || 12 }]}>
          <TouchableOpacity
            accessibilityLabel="Back"
            onPress={() => setSelectedFund(null)}
          >
            <FontAwesome5 name="chevron-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>
            {selectedFund?.title || ''}
          </Text>
          <TouchableOpacity 
            accessibilityLabel="Edit"
            onPress={() => {
              if (!isEditMode) {
                setEditingFund({
                  title: selectedFund?.title || '',
                  description: selectedFund?.description || '',
                  currentAmount: selectedFund?.amount.replace(/[^0-9.]/g, '') || '',
                  targetAmount: selectedFund?.targetAmount || '',
                });
              }
              setIsEditMode(!isEditMode);
            }}
          >
            <FontAwesome5 name={isEditMode ? "check" : "edit"} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                style={styles.backgroundImage}
                accessibilityLabel={selectedFund?.altImage}
                // Thêm key để đảm bảo React re-render khi ảnh thay đổi
                key={displayImage}
              />
            ) : (
              <View style={[styles.backgroundImage, styles.placeholderImage]}>
                <FontAwesome5 name="money-bill-wave" size={48} color="#e5e5e5" />
              </View>
            )}
            <TouchableOpacity
              style={styles.changePhotoButton}
              activeOpacity={0.8}
              accessibilityLabel="Change photo"
              onPress={handleImagePick}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.changePhotoGradient}
              >
                <View style={styles.changePhotoIconContainer}>
                  <FontAwesome5 name="camera" size={14} color="#EE1D52" />
                </View>
                <Text style={styles.changePhotoText}>Change photo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.fundInfo}>
              <View style={styles.createdDateContainer}>
                <View style={styles.dateItem}>
                  <FontAwesome5 name="calendar-plus" size={14} color="#6B7280" />
                  <Text style={styles.createdDateText}>
                    Created: {selectedFund?.createdAt?.split(' - ')[0]}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <FontAwesome5 name="clock" size={14} color="#6B7280" />
                  <Text style={styles.createdDateText}>
                    Time: {selectedFund?.createdAt?.split(' - ')[1]}
                  </Text>
                </View>
                {selectedFund?.modifiedAt && (
                  <>
                    <View style={styles.dateItem}>
                      <FontAwesome5 name="calendar-alt" size={14} color="#6B7280" />
                      <Text style={styles.createdDateText}>
                        Modified: {selectedFund?.modifiedAt.split(' - ')[0]}
                      </Text>
                    </View>
                    <View style={styles.dateItem}>
                      <FontAwesome5 name="clock" size={14} color="#6B7280" />
                      <Text style={styles.createdDateText}>
                        Time: {selectedFund?.modifiedAt.split(' - ')[1]}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              <Text style={styles.fundBalanceLabel}>Fund Progress</Text>
              <FundProgressBar 
                progress={calculateProgress(selectedFund?.amount || '0', selectedFund?.targetAmount || '0')} 
              />
              {showCelebration && (
                <View style={styles.celebrationContainer}>
                  <Text style={styles.celebrationText}>🎉 Congratulations! Fund completed! 🎉</Text>
                  <TouchableOpacity 
                    style={styles.celebrateAgainButton} 
                    onPress={triggerCelebration}
                  >
                    <Text style={styles.celebrateAgainText}>Celebrate Again!</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.amountContainer}>
                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>Current Amount</Text>
                  <Text style={styles.fundBalanceAmount}>{selectedFund?.amount}</Text>
                </View>
                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>Target Amount</Text>
                  <Text style={styles.fundBalanceAmount}>{selectedFund?.targetAmount}</Text>
                </View>
              </View>
              {isEditMode ? (
                <>
                  {renderEditInputs()}
                  <View style={styles.editButtons}>
                    <TouchableOpacity 
                      style={[styles.editButton, { backgroundColor: '#9CA3AF' }]}
                      onPress={() => {
                        setIsEditMode(false);
                        setEditingFund({ title: '', description: '', currentAmount: '', targetAmount: '' });
                      }}
                    >
                      <Text style={styles.editButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={handleEditFund}
                    >
                      <Text style={styles.editButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.fundDescription}>{selectedFund?.description}</Text>
              )}
            </View>

            {/* <View style={styles.actionSection}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name="dollar-sign" size={20} color="#EE1D52" />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.fundButton}>
                  <Text style={styles.fundButtonText}>+ Fund</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fundButton}>
                  <FontAwesome5 name="credit-card" size={14} color="#EE1D52" style={styles.buttonIcon} />
                  <Text style={styles.fundButtonText}>Withdraw funds</Text>
                </TouchableOpacity>
              </View>
            </View> */}

            <View style={styles.optionsSection}>
              <View style={styles.optionItem}>
                <FontAwesome5 name="hand-peace" size={18} color="#EE1D52" />
                <Text style={styles.optionText}>Reminder to{'\n'}contribute</Text>
              </View>
              <View style={styles.optionItem}>
                <FontAwesome5 name="qrcode" size={18} color="#EE1D52" />
                <Text style={styles.optionText}>QR fundraiser</Text>
              </View>
              <View style={styles.optionItem}>
                <FontAwesome5 name="money-bill-wave" size={18} color="#EE1D52" />
                <Text style={styles.optionText}>Payment,{'\n'}money transfer</Text>
              </View>
            </View>

            {!isEditMode && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteFund}
              >
                <FontAwesome5 name="trash-alt" size={16} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Delete Fund</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        
        {/* Confetti overlay that will display on top */}
        {showCelebration && (
          <View style={styles.confettiOverlay}>
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{x: width / 2, y: 0}}
              autoStart={false}
              fadeOut
              explosionSpeed={350}
              fallSpeed={3000}
              colors={['#EE1D52', '#FFDF00', '#5EFCE8', '#736EFE', '#EC4899']}
            />
          </View>
        )}
      </SafeAreaView>
    );
  };

  const renderFundList = () => (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
        <TouchableOpacity accessibilityLabel="Back">
          <FontAwesome5 name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Couple fund</Text>
        <TouchableOpacity 
          accessibilityLabel="Search"
          onPress={() => setIsSearchVisible(true)}
        >
          <FontAwesome name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isSearchVisible && renderSearchBar()}

      <View style={styles.main}>
        <View style={styles.fundCreationButtonContainer}>
          <TouchableOpacity 
            style={styles.fundCreationButton}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFE6EB', '#EE1D52']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <FontAwesome5 name="plus-circle" size={16} color="#FFFFFF" />
              <Text style={styles.fundCreationText}>
                Create new fund ({funds.length}/{MAX_FUNDS})
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={filteredFunds}
          renderItem={renderFundItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.cardList, { paddingBottom: insets.bottom + 70 }]}
          showsVerticalScrollIndicator={true}
          bounces={true}
          overScrollMode="always"
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={<View style={{ height: 80 }} />}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      </View>
    </SafeAreaView>
  );

  const renderCreateFundModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Fund</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <FontAwesome name="times" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.modalInput}
              placeholder="Fund Title"
              value={newFund.title}
              onChangeText={(text) => setNewFund(prev => ({ ...prev, title: text }))}
            />
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Description"
              value={newFund.description}
              onChangeText={(text) => setNewFund(prev => ({ ...prev, description: text }))}
              multiline
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Current Amount"
              value={newFund.currentAmount}
              onChangeText={(text) => handleAmountInput(text, 'current', setNewFund)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Target Amount"
              value={newFund.targetAmount}
              onChangeText={(text) => handleAmountInput(text, 'target', setNewFund)}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#9CA3AF' }]}
                onPress={() => {
                  setNewFund({
                    title: '',
                    description: '',
                    currentAmount: '',
                    targetAmount: '',
                  });
                  setIsModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleCreateFund}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE1D52" />
      </View>
    );
  }

  return (
    <>
      {selectedFund ? renderFundDetail() : renderFundList()}
      {renderCreateFundModal()}
    </>
  );
};

export default CoupleFundScreen;

// Extend existing styles
Object.assign(styles, {
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
});