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
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
  Switch,
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
import { 
  authenticate, 
  authenticateWithBiometrics, 
  checkBiometricSupport, 
  getSecuritySettings, 
  verifyPin
} from '../../utils/authentication';

// Constants
const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://192.168.1.8:5000/api'  // Use computer's IP address
  : 'http://192.168.1.8:5000/api'; // Use computer's IP address for iOS too
const COUPLE_FUND_ENDPOINT = `${API_BASE_URL}/couple-fund`;
const STORAGE_KEY = 'couple_funds_data';
const MAX_FUNDS = 20; // Allow up to 20 funds
const { width } = Dimensions.get('window');

// Sử dụng lại COLORS từ file styles
const COLORS = {
  primary: '#EE1D52',
  secondary: '#666666',
  white: '#FFFFFF',
  lightGray: '#F3F4F6',
  darkGray: '#4B5563',
  background: '#F3F4F6',
  success: '#4CAF50',
  warning: '#FFDF00',
  lightPink: '#FFE6EB',
  textDark: '#111827',
  textMedium: '#6B7280',
  border: '#D1D5DB',
};

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

// Add type definitions at the top of the file
type Styles = {
  container: ViewStyle;
  detailContainer: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  main: ViewStyle;
  scrollContainer: ViewStyle;
  // ... existing style types ...
  
  // New style types
  detailContent: ViewStyle;
  scrollContentContainer: ViewStyle;
  editInputsContainer: ViewStyle;
  input: TextStyle;
  amountInputsRow: ViewStyle;
  amountInputWrapper: ViewStyle;
  amountInputLabel: TextStyle;
  amountInput: TextStyle;
  editButtons: ViewStyle;
  editButton: ViewStyle;
  editButtonText: TextStyle;
};

// API Service
const fundService = {
  async getAllFunds(): Promise<Fund[]> {
    try {
      // Set timeout for API call to prevent hanging
      const userId = await AsyncStorage.getItem('userId') || 'default_user'; // Get userId from storage
      console.log('Fetching funds with userId:', userId);
      console.log('API URL:', COUPLE_FUND_ENDPOINT);
      
      const response = await axios.get(COUPLE_FUND_ENDPOINT, {
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

      const response = await axios.put(COUPLE_FUND_ENDPOINT, requestData, {
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

      const response = await axios.put(COUPLE_FUND_ENDPOINT, requestData, {
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
        amount: Math.abs(parseInt(amount.toString())), // Ensure positive integer
        type,
        category: type === 'deposit' ? 'Income' : 'Expense',
        description,
        createdBy: 'User'
      };

      console.log('Adding transaction:', requestData);

      const response = await axios.post(`${COUPLE_FUND_ENDPOINT}/transactions`, requestData, {
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
      console.log('Using userId for deletion:', userId);
      
      const response = await axios.delete(`${COUPLE_FUND_ENDPOINT}/${id}`, {
        headers: {
          'user-id': userId
        },
        timeout: 8000
      });

      console.log('Delete response:', response.status, response.data);
      
      if (response.data && response.data.success) {
        console.log('Fund deleted successfully');
        return true;
      }
      
      console.log('Delete failed:', response.data?.message);
      Alert.alert('Delete failed', response.data?.message || 'Unknown error');
      return false;
    } catch (error: any) {
      console.error('Error deleting fund:', error.response?.data || error.message);
      
      if (error.response?.data) {
        const errorMessage = error.response.data.message || 'Failed to delete fund';
        Alert.alert('Delete error', errorMessage);
      } else {
        Alert.alert('Delete error', 'Network error or server unavailable');
      }
      
      if (error.response?.status === 404) {
        console.log('Fund not found or already deleted');
        return true; // Consider it deleted if not found
      }
      throw error;
    }
  },

  async getTransactions(fundId: string): Promise<any[]> {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      const response = await axios.get(`${COUPLE_FUND_ENDPOINT}/transactions/${fundId}`, {
        headers: {
          'user-id': userId
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to load transactions');
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  },

  async getReminders(fundId: string): Promise<any[]> {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'default_user';
      const response = await axios.get(`${COUPLE_FUND_ENDPOINT}/reminders/${fundId}`, {
        headers: {
          'user-id': userId
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to load reminders');
    } catch (error) {
      console.error('Error loading reminders:', error);
      throw error;
    }
  },
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

// New PinAuthModal Component
interface PinAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PinAuthModal: React.FC<PinAuthModalProps> = ({ visible, onClose, onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [useBiometric, setUseBiometric] = useState(false);

  // Check if biometric auth is available
  useEffect(() => {
    const checkBiometric = async () => {
      const settings = await getSecuritySettings();
      const isBiometricSupported = await checkBiometricSupport();
      setUseBiometric(settings.useBiometric && isBiometricSupported);
      
      if (settings.useBiometric && isBiometricSupported) {
        handleBiometricAuth();
      }
    };
    
    if (visible) {
      checkBiometric();
      resetPin();
    }
  }, [visible]);

  const resetPin = () => {
    setPin('');
    setErrorMessage('');
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await authenticateWithBiometrics();
      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const handlePinChange = (text: string) => {
    // Only allow numbers and limit to 6 digits
    const newPin = text.replace(/[^0-9]/g, '').slice(0, 6);
    setPin(newPin);
    setErrorMessage('');
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setErrorMessage('Please enter all 6 digits');
      return;
    }

    const isValid = await verifyPin(pin);
    if (isValid) {
      setErrorMessage('');
      onSuccess();
    } else {
      setErrorMessage('Incorrect PIN');
      resetPin();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.authModalContainer}>
          <View style={styles.authModalContent}>
            <Text style={styles.authTitle}>Authenticate</Text>
            <Text style={styles.authMessage}>Please authenticate to edit the fund</Text>
            
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            
            <View style={styles.pinInputContainer}>
              <TextInput
                style={[
                  styles.authPinInput,
                  { width: '100%', height: 55, letterSpacing: 1 },
                  errorMessage ? { borderColor: '#DC2626', borderWidth: 2, backgroundColor: '#FEF2F2' } : {}
                ]}
                keyboardType="numeric"
                maxLength={6}
                value={pin}
                onChangeText={handlePinChange}
                secureTextEntry
                placeholder="Enter 6-digit PIN"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.authButton,
                pin.length === 6 ? { opacity: 1 } : { opacity: 0.7 }
              ]} 
              onPress={handleVerifyPin}
              disabled={pin.length !== 6}
            >
              <Text style={styles.authButtonText}>Confirm</Text>
            </TouchableOpacity>
            
            {useBiometric && (
              <TouchableOpacity 
                style={styles.authButton} 
                onPress={handleBiometricAuth}
              >
                <Text style={styles.authButtonText}>Use Biometric</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.cancelAuthButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelAuthText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
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
    additionalAmount: '', // New field for additional amount
    originalCurrentAmount: '', // Store original current amount for calculation
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

  // New states for features
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [securitySettings, setSecuritySettings] = useState({
    requirePin: false,
    pin: '',
    useBiometric: false
  });

  // New state for authentication modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Add new state for PIN confirmation
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [pinError, setPinError] = useState('');
  const [isConfirmingPin, setIsConfirmingPin] = useState(false);

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

  // Add a general authentication wrapper function
  const authenticateAction = async (action: () => void | Promise<void>) => {
    // Get the latest security settings
    const settings = await getSecuritySettings();
    
    // If no authentication methods are enabled, perform the action directly
    if (!settings.requirePin && !settings.useBiometric) {
      action();
      return;
    }
    
    // Try biometric authentication first if enabled
    if (settings.useBiometric) {
      try {
        const result = await authenticateWithBiometrics();
        if (result) {
          // Authentication successful, perform the action
          action();
          return;
        }
        // Biometric failed, fall back to PIN if available
      } catch (error) {
        console.error('Biometric auth error:', error);
        // Fall back to PIN if available
      }
    }
    
    // If PIN is required or biometric failed, show PIN modal
    if (settings.requirePin) {
      setPendingAction(() => action);
      setShowAuthModal(true);
    } else {
      // No authentication methods available or successful
      Alert.alert('Authentication Failed', 'Please enable a security method in settings.');
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

  const handleAmountInput = (text: string, type: 'current' | 'target' | 'additional', setState: any) => {
    if (!text.trim()) {
      setState((prev: any) => ({
        ...prev,
        [type === 'current' ? 'currentAmount' : 
         type === 'target' ? 'targetAmount' : 'additionalAmount']: ''
      }));
      return;
    }

    const formattedNumber = formatNumberWithDots(text);
    setState((prev: any) => ({
      ...prev,
      [type === 'current' ? 'currentAmount' : 
       type === 'target' ? 'targetAmount' : 'additionalAmount']: formattedNumber
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

  const performEdit = async () => {
    try {
      setIsLoading(true);
      
      // Format the amounts for display
      const formattedTargetAmount = formatAmount(editingFund.targetAmount);
      const formattedAdditionalAmount = editingFund.additionalAmount ? formatAmount(editingFund.additionalAmount) : "0đ";
      
      // Clean and parse amounts
      const prevAmountClean = selectedFund!.amount.replace(/[^\d]/g, '');
      const additionalAmountClean = formattedAdditionalAmount.replace(/[^\d]/g, '');
      const originalAmountClean = editingFund.originalCurrentAmount.replace(/[^\d]/g, '');
      const prevAmountValue = Number(prevAmountClean);
      const additionalAmountValue = Number(additionalAmountClean);
      const originalAmountValue = Number(originalAmountClean);
      
      // Calculate new total amount (original + additional)
      const newTotalAmount = originalAmountValue + additionalAmountValue;
      
      // Check if amounts are valid numbers
      if (isNaN(newTotalAmount) || isNaN(prevAmountValue)) {
        Alert.alert('Error', 'Invalid amount format. Please enter valid numbers.');
        setIsLoading(false);
        return;
      }
      
      // Prepare complete fund data for update
      const fundData = {
        title: editingFund.title,
        description: editingFund.description || selectedFund!.description,
        amount: formatAmount(newTotalAmount.toString()),
        targetAmount: formattedTargetAmount,
        image: selectedImage || selectedFund!.image,
      };
      
      console.log('Attempting to update fund with data:', fundData);
      console.log('Original amount:', originalAmountValue, 'Additional amount:', additionalAmountValue, 'New total:', newTotalAmount);
      
      // Create a transaction record if additional amount is provided
      let transactionResult = null;
      if (additionalAmountValue > 0) {
        try {
          // Add transaction for the additional amount
          transactionResult = await fundService.addTransaction(
            selectedFund!.id,
            additionalAmountValue,
            'deposit',
            'Manual deposit adjustment'
          );
          console.log('Transaction added successfully');
        } catch (transactionError) {
          console.error('Failed to add transaction, but will continue with fund update:', transactionError);
        }
      }
      
      // Perform the actual fund update with simplified approach
      try {
        // Try a direct update first - update all fields at once
        const updatedFund = await fundService.updateFund(selectedFund!.id, fundData);
        
        // Update local state with the updated fund
        const updatedFunds = funds.map(fund => 
          fund.id === selectedFund!.id ? updatedFund : fund
        );
        
        setFunds(updatedFunds);
        await saveFundsData(updatedFunds);
        setSelectedFund(updatedFund);
        
        // Refresh transactions if we added a new one or if requested
        if (transactionResult || additionalAmountValue > 0) {
          try {
            const updatedTransactions = await fundService.getTransactions(selectedFund!.id);
            setTransactions(updatedTransactions);
          } catch (error) {
            console.error('Error fetching updated transactions:', error);
            // Non-critical error, continue
          }
        }
        
        // Check if fund was just completed for notification
        const progress = calculateProgress(selectedFund!.amount, selectedFund!.targetAmount);
        if (progress >= 100 && notificationsPermission && !notifiedFunds.includes(updatedFund.id)) {
          try {
            await sendFundCompletionNotification(updatedFund.title);
            const newNotifiedFunds = [...notifiedFunds, updatedFund.id];
            setNotifiedFunds(newNotifiedFunds);
            await AsyncStorage.setItem('notified_funds', JSON.stringify(newNotifiedFunds));
          } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
            // Non-critical error, continue
          }
        }
        
        Alert.alert('Success', 'Fund updated successfully');
      } catch (updateError) {
        console.error('Initial update failed, trying fallback method:', updateError);
        
        // Fallback: Try updating fields one by one
        try {
          // Start with non-amount fields
          await fundService.updateFund(selectedFund!.id, {
            title: editingFund.title,
            description: editingFund.description || selectedFund!.description,
            image: selectedImage || selectedFund!.image,
          });
          
          // Update target amount separately
          await fundService.updateFund(selectedFund!.id, {
            targetAmount: formattedTargetAmount
          });
          
          // Update current amount last (most likely to cause issues)
          await fundService.updateFund(selectedFund!.id, {
            amount: selectedFund!.amount
          });
          
          // If we got here, updates succeeded - fetch the updated fund
          const updatedFund = await fundService.getAllFunds().then(
            funds => funds.find(f => f.id === selectedFund!.id)
          );
          
          if (updatedFund) {
            // Update local state
            const updatedFunds = funds.map(fund => 
              fund.id === selectedFund!.id ? updatedFund : fund
            );
            
            setFunds(updatedFunds);
            await saveFundsData(updatedFunds);
            setSelectedFund(updatedFund);
            
            // Refresh transactions
            try {
              const updatedTransactions = await fundService.getTransactions(selectedFund!.id);
              setTransactions(updatedTransactions);
            } catch (error) {
              console.error('Error fetching updated transactions in fallback:', error);
            }
            
            Alert.alert('Success', 'Fund updated successfully');
          } else {
            throw new Error('Failed to get updated fund data');
          }
        } catch (fallbackError) {
          console.error('Fallback update failed:', fallbackError);
          Alert.alert('Update Error', 'Could not update the fund. Please try again later or with different values.');
        }
      }
      
      // Exit edit mode regardless of success/failure
      setIsEditMode(false);
    } catch (error) {
      console.error('Unexpected error in performEdit:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleEditFund to skip auth check since we already authenticated to enter edit mode
  const handleEditFund = async () => {
    if (!selectedFund || !editingFund.title || !editingFund.targetAmount) {
      Alert.alert('Missing information', 'Please fill in all required fields');
      return;
    }

    try {
      // Proceed directly as authentication was already performed to enter edit mode
      await performEdit();
    } catch (error) {
      console.error('Error in handleEditFund:', error);
      Alert.alert('Error', 'Failed to update fund. Please try again.');
    }
  };

  // Update handleEditButtonPress to use the wrapper
  const handleEditButtonPress = () => {
    if (!isEditMode) {
      // Switching to edit mode requires authentication
      authenticateAction(() => {
        setEditingFund({
          title: selectedFund?.title || '',
          description: selectedFund?.description || '',
          currentAmount: selectedFund?.amount.replace(/[^0-9.]/g, '') || '',
          targetAmount: selectedFund?.targetAmount.replace(/[^0-9.]/g, '') || '',
          additionalAmount: '', // Initialize as empty string
          originalCurrentAmount: selectedFund?.amount.replace(/[^0-9.]/g, '') || '', // Store original current amount
        });
        setIsEditMode(true);
      });
    } else {
      // Already in edit mode, just save without re-authenticating
      handleEditFund();
    }
  };

  // Update handleDeleteFund to use the wrapper
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
          onPress: () => {
            authenticateAction(async () => {
              setIsLoading(true);
              
              try {
                // Ensure userId is saved in AsyncStorage
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                  // If there's no userId, save a new one
                  const newUserId = `user_${Date.now()}`;
                  await AsyncStorage.setItem('userId', newUserId);
                  console.log('Created and saved new userId:', newUserId);
                } else {
                  console.log('Using existing userId:', userId);
                }
                
                // Delete fund via API
                const success = await fundService.deleteFund(selectedFund.id);
                
                if (success) {
                  console.log('Successfully deleted fund from API');
                  // Update local state
                  const updatedFunds = funds.filter(fund => fund.id !== selectedFund.id);
                  setFunds(updatedFunds);
                  await saveFundsData(updatedFunds);
                  setSelectedFund(null);
                  // Show success message
                  Alert.alert('Success', 'Fund deleted successfully');
                } else {
                  console.log('API returned false for deletion');
                }
              } catch (error) {
                console.error('Error in handleDeleteFund:', error);
                // Error handling in fundService.deleteFund
              } finally {
                setIsLoading(false);
              }
            });
          }
        },
      ],
      { cancelable: true }
    );
  };

  // Update image picking to NOT require authentication
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
        
        // Update UI temporarily for current fund only
        if (selectedFund) {
          // Create a temporary copy of selected fund with new image
          const updatedSelectedFund = {
            ...selectedFund,
            image: newImageUri // Display local image before upload
          };
          
          // Update UI for selected fund
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
            
            // Update state with fund updated from server
            setSelectedFund(updatedFund);
            
            // Update funds array but only change current fund
            const updatedFunds = funds.map(fund => 
              fund.id === selectedFund.id ? updatedFund : fund
            );
            
            setFunds(updatedFunds);
            await saveFundsData(updatedFunds);
            
            // Clear temp image after successful update
            setSelectedImage(null);
            
            // Alert user of success
            Alert.alert('Success', 'Image updated successfully');
          } catch (error) {
            console.error('Error updating fund image:', error);
            Alert.alert('Error', 'Failed to update fund image. Please try again.');
            
            // Restore original image if error occurs
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

  // Update transaction history button to require authentication
  const handleTransactionHistoryPress = () => {
    if (!selectedFund) return;
    
    authenticateAction(() => {
      // Load transactions for the selected fund
      fundService.getTransactions(selectedFund.id)
        .then(data => {
          setTransactions(data);
          setShowTransactionHistory(true);
        })
        .catch(error => {
          console.error('Error loading transactions:', error);
          Alert.alert('Error', 'Failed to load transaction history');
        });
    });
  };

  // Update reminder settings button to require authentication
  const handleReminderSettingsPress = () => {
    if (!selectedFund) return;
    
    authenticateAction(() => {
      // Load reminders for the selected fund
      fundService.getReminders(selectedFund.id)
        .then(data => {
          setReminders(data);
          setShowReminderSettings(true);
        })
        .catch(error => {
          console.error('Error loading reminders:', error);
          Alert.alert('Error', 'Failed to load reminders');
        });
    });
  };

  // Update security settings button to require authentication
  const handleSecuritySettingsPress = () => {
    authenticateAction(() => {
      // Load security settings
      AsyncStorage.getItem('security_settings')
        .then(settings => {
          if (settings) {
            setSecuritySettings(JSON.parse(settings));
          }
          setShowSecuritySettings(true);
        })
        .catch(error => {
          console.error('Error loading security settings:', error);
          setShowSecuritySettings(true);
        });
    });
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Function to explode confetti manually for completed funds
  const triggerCelebration = () => {
    confettiRef.current?.start();
  };

  // Transaction History Modal
  const renderTransactionHistoryModal = () => {
    // Helper function to group transactions by date
    const groupTransactionsByDate = (transactions: any[]) => {
      if (!transactions || transactions.length === 0) {
        return {};
      }
      const grouped: { [key: string]: any[] } = {};
      transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        let dateKey = date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
          dateKey = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateKey = 'Yesterday';
        }

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(transaction);
      });
      return grouped;
    };

    const groupedTransactions = groupTransactionsByDate(transactions);
    const sortedDateKeys = Object.keys(groupedTransactions).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return (
      <Modal
        visible={showTransactionHistory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransactionHistory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>  
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction History</Text>
              <TouchableOpacity 
                onPress={() => setShowTransactionHistory(false)}
                style={styles.closeButton}
              >
                <FontAwesome name="times" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            {/* Summary Section */}
            <View style={styles.transactionSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Deposits</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(transactions
                    .filter(t => t.type === 'deposit')
                    .reduce((sum, t) => sum + t.amount, 0).toString())}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Withdrawals</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(transactions
                    .filter(t => t.type === 'withdraw')
                    .reduce((sum, t) => sum + t.amount, 0).toString())}
                </Text>
              </View>
            </View>
            <View style={styles.transactionListHeader}>
              <Text style={styles.transactionListTitle}>Recent Transactions</Text>
            </View>
            <ScrollView style={styles.transactionList} showsVerticalScrollIndicator={false}>
              {transactions.length === 0 ? (
                <View style={styles.emptyTransactions}>
                  <FontAwesome5 name="file-invoice-dollar" size={48} color="#CBD5E0" />
                  <Text style={styles.emptyTransactionsText}>No transactions yet</Text>
                  <Text style={styles.emptyTransactionsSubText}>
                    Transactions will appear here when you add or withdraw funds.
                  </Text>
                </View>
              ) : (
                sortedDateKeys.map(dateKey => (
                  <View key={dateKey}>
                    <Text style={styles.transactionDateHeader}>{dateKey}</Text>
                    {groupedTransactions[dateKey].map((transaction, index) => (
                      <TouchableOpacity
                        key={transaction.id || index}
                        activeOpacity={0.85}
                        style={[
                          styles.transactionCard,
                          index === groupedTransactions[dateKey].length - 1 && { marginBottom: 16 }
                        ]}
                      >
                        <View style={styles.transactionCardRow}>
                          <View style={styles.transactionIconContainer}>
                            <View style={[
                              styles.transactionIcon, 
                              { backgroundColor: transaction.type === 'deposit' ? '#E9F7EF' : '#FDEDEC' }
                            ]}>
                              <FontAwesome5 
                                name={transaction.type === 'deposit' ? 'arrow-down' : 'arrow-up'} 
                                size={18} 
                                color={transaction.type === 'deposit' ? '#4CAF50' : '#DC2626'} 
                              />
                            </View>
                          </View>
                          <View style={styles.transactionCardInfo}>
                            <Text style={styles.transactionCardType}>
                              {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </Text>
                            <Text style={styles.transactionCardDesc} numberOfLines={1} ellipsizeMode="tail">
                              {transaction.description || `Manual ${transaction.type}`}
                            </Text>
                          </View>
                          <View style={styles.transactionCardAmountBox}>
                            <Text style={[
                              styles.transactionCardAmount,
                              transaction.type === 'deposit' ? styles.depositAmount : styles.withdrawAmount
                            ]}>
                              {transaction.type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount.toString())}
                            </Text>
                            <Text style={styles.transactionCardTime}>
                              {new Date(transaction.date).toLocaleTimeString('en-GB', {
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Smart Reminders Modal
  const renderReminderSettingsModal = () => (
    <Modal
      visible={showReminderSettings}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowReminderSettings(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Smart Reminders</Text>
            <TouchableOpacity onPress={() => setShowReminderSettings(false)}>
              <FontAwesome name="times" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.reminderList}>
            {reminders.map((reminder, index) => (
              <View key={index} style={styles.reminderItem}>
                <View style={styles.reminderItemHeader}>
                  <Text style={styles.reminderName}>{reminder.title}</Text>
                  <Text style={styles.reminderTime}>{reminder.frequency}</Text>
                </View>
                <Text style={styles.reminderDescription}>{reminder.description}</Text>
                <View style={styles.reminderActions}>
                  <TouchableOpacity 
                    style={styles.reminderActionButton}
                    onPress={() => {/* Edit reminder */}}
                  >
                    <Text style={styles.reminderActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.reminderActionButton, { backgroundColor: '#DC2626' }]}
                    onPress={() => {/* Delete reminder */}}
                  >
                    <Text style={styles.reminderActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.actionButtonLarge}
            onPress={() => {/* Add new reminder */}}
          >
            <Text style={styles.actionButtonLargeText}>Add New Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Security Settings Modal
  const renderSecuritySettingsModal = () => (
    <Modal
      visible={showSecuritySettings}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSecuritySettings(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Security Settings</Text>
            <TouchableOpacity onPress={() => {
              setShowSecuritySettings(false);
              setPinConfirmation('');
              setIsConfirmingPin(false);
              setPinError('');
            }}>
              <FontAwesome name="times" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16 }}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Require PIN for Access</Text>
              <Switch
                value={securitySettings.requirePin}
                onValueChange={async (value) => {
                  if (value) {
                    // When enabling PIN, show PIN input
                    setSecuritySettings(prev => ({
                      ...prev,
                      requirePin: value
                    }));
                  } else {
                    // When disabling PIN, only verify if PIN was previously set
                    if (securitySettings.pin && securitySettings.pin.length > 0) {
                      try {
                        const isValid = await verifyPin(securitySettings.pin);
                        if (isValid) {
                          setSecuritySettings(prev => ({
                            ...prev,
                            requirePin: false,
                            pin: ''
                          }));
                        } else {
                          Alert.alert('Error', 'Please verify your current PIN first');
                        }
                      } catch (error) {
                        console.error('PIN verification error:', error);
                        Alert.alert('Error', 'Failed to verify PIN. Please try again.');
                      }
                    } else {
                      // No PIN was set, so just disable it without verification
                      setSecuritySettings(prev => ({
                        ...prev,
                        requirePin: false,
                        pin: ''
                      }));
                    }
                  }
                }}
              />
            </View>

            {securitySettings.requirePin && !isConfirmingPin && (
              <View style={styles.pinInputContainer}>
                <Text style={styles.pinInputLabel}>Enter 6-digit PIN</Text>
                <TextInput
                  style={[styles.authPinInput, { width: '100%', height: 55, letterSpacing: 1 }]}
                  placeholder="Enter 6-digit PIN"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  value={securitySettings.pin}
                  onChangeText={(pin) => {
                    setPinError('');
                    setSecuritySettings(prev => ({
                      ...prev,
                      pin
                    }));
                  }}
                />
                {securitySettings.pin.length === 6 && (
                  <TouchableOpacity 
                    style={[styles.actionButtonLarge, { marginTop: 16 }]}
                    onPress={() => {
                      if (securitySettings.pin.length === 6) {
                        setIsConfirmingPin(true);
                      } else {
                        setPinError('PIN must be 6 digits');
                      }
                    }}
                  >
                    <Text style={styles.actionButtonLargeText}>Confirm PIN</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {securitySettings.requirePin && isConfirmingPin && (
              <View style={styles.pinInputContainer}>
                <Text style={styles.pinInputLabel}>Confirm 6-digit PIN</Text>
                <TextInput
                  style={[styles.authPinInput, { width: '100%', height: 55, letterSpacing: 1 }]}
                  placeholder="Confirm 6-digit PIN"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={6}
                  value={pinConfirmation}
                  onChangeText={(pin) => {
                    setPinError('');
                    setPinConfirmation(pin);
                  }}
                />
                {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
              </View>
            )}

            <View style={[styles.settingItem, { marginTop: 16 }]}>
              <Text style={styles.settingLabel}>Use Biometric Authentication</Text>
              <Switch
                value={securitySettings.useBiometric}
                onValueChange={async (value) => {
                  // Require biometric authentication to change this setting
                  try {
                    const authResult = await authenticateWithBiometrics();
                    if (authResult) {
                      setSecuritySettings(prev => ({
                        ...prev,
                        useBiometric: value
                      }));
                    }
                  } catch (error) {
                    console.error('Biometric auth error:', error);
                    Alert.alert('Error', 'Biometric authentication failed');
                  }
                }}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.actionButtonLarge, { marginTop: 'auto', marginBottom: 16 }]}
            onPress={async () => {
              try {
                if (securitySettings.requirePin) {
                  if (isConfirmingPin) {
                    if (pinConfirmation !== securitySettings.pin) {
                      setPinError('PINs do not match');
                      return;
                    }
                    if (pinConfirmation.length !== 6) {
                      setPinError('PIN must be 6 digits');
                      return;
                    }
                  } else {
                    if (securitySettings.pin.length !== 6) {
                      setPinError('PIN must be 6 digits');
                      return;
                    }
                  }
                }

                const { saveSecuritySettings } = await import('../../utils/authentication');
                await saveSecuritySettings(securitySettings);
                Alert.alert('Success', 'Security settings saved successfully');
                setShowSecuritySettings(false);
                setPinConfirmation('');
                setIsConfirmingPin(false);
                setPinError('');
              } catch (error) {
                console.error('Error saving security settings:', error);
                Alert.alert('Error', 'Failed to save security settings');
              }
            }}
          >
            <Text style={styles.actionButtonLargeText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
    <View style={styles.editInputsContainer}>
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
      <View style={styles.amountInputsRow}>
        <View style={styles.amountInputWrapper}>
          <Text style={styles.amountInputLabel}>Current Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={editingFund.currentAmount}
            onChangeText={(text) => handleAmountInput(text, 'current', setEditingFund)}
            keyboardType="numeric"
            returnKeyType="done"
            editable={false} // Make current amount read-only
          />
        </View>
        <View style={styles.amountInputWrapper}>
          <Text style={styles.amountInputLabel}>Target Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={editingFund.targetAmount}
            onChangeText={(text) => handleAmountInput(text, 'target', setEditingFund)}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>
      </View>
      <View style={styles.amountInputWrapper}>
        <Text style={styles.amountInputLabel}>Add Amount</Text>
        <TextInput
          style={styles.amountInput}
          value={editingFund.additionalAmount}
          onChangeText={(text) => {
            console.log('Add Amount input changed:', text);
            console.log('Original Current Amount:', editingFund.originalCurrentAmount);
            
            handleAmountInput(text, 'additional', setEditingFund);
            
            // Auto-update current amount when additional amount changes
            const additionalValue = parseInt(text.replace(/[^\d]/g, '') || '0');
            const originalValue = parseInt(editingFund.originalCurrentAmount.replace(/[^\d]/g, '') || '0');
            const newCurrentAmount = (originalValue + additionalValue).toString();
            
            console.log('Calculation:', {
              originalValue,
              additionalValue, 
              newCurrentAmount
            });
            
            handleAmountInput(newCurrentAmount, 'current', setEditingFund);
          }}
          placeholder="Enter amount to add"
          keyboardType="numeric"
          returnKeyType="done"
        />
      </View>
    </View>
  );

  const renderFundDetail = () => {
    if (!selectedFund) return null;
    
    const progress = calculateProgress(selectedFund.amount, selectedFund.targetAmount);
    const isCompleted = progress >= 100;
    const displayImage = selectedImage || selectedFund.image;
    
    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 20}
      >
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
              onPress={handleEditButtonPress}
            >
              <FontAwesome5 name={isEditMode ? "check" : "edit"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={[
              styles.scrollContentContainer,
              { flexGrow: 1, paddingBottom: isEditMode ? 120 : 24 }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.detailContent}>
                {/* Image Section */}
                <View style={[styles.imageContainer, isEditMode && { height: width * 0.3 }]}>
                  {displayImage ? (
                    <Image
                      source={{ uri: displayImage }}
                      style={styles.backgroundImage}
                      accessibilityLabel={selectedFund?.altImage}
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

                {/* Fund Details Section */}
                <View style={[styles.detailCard, isEditMode && { paddingBottom: 32 }]}>
                  {isEditMode ? (
                    <>
                      {renderEditInputs()}
                      <View style={styles.editButtons}>
                        <TouchableOpacity 
                          style={[styles.editButton, { backgroundColor: '#9CA3AF' }]}
                          onPress={() => {
                            setIsEditMode(false);
                            setEditingFund({ 
                              title: '', 
                              description: '', 
                              currentAmount: '', 
                              targetAmount: '',
                              additionalAmount: '',
                              originalCurrentAmount: '',
                            });
                            Keyboard.dismiss();
                          }}
                        >
                          <Text style={styles.editButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.editButton}
                          onPress={() => {
                            handleEditFund();
                            Keyboard.dismiss();
                          }}
                        >
                          <Text style={styles.editButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
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
                            <Text style={styles.celebrationText}>
                              🎉 Congratulations! Fund completed! 🎉
                              {isCompleted && (
                                <Text style={{ fontSize: 12, color: '#666', fontWeight: 'normal' }}>
                                  {"\n"}You can still edit this fund if needed
                                </Text>
                              )}
                            </Text>
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
                        <Text style={styles.fundDescription}>{selectedFund?.description}</Text>
                      </View>

                      <View style={styles.optionsSection}>
                        <TouchableOpacity style={styles.optionItem} onPress={handleTransactionHistoryPress}>
                          <FontAwesome5 name="history" size={20} color="#EE1D52" />
                          <Text style={styles.optionText}>Transaction{'\n'}History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionItem} onPress={handleReminderSettingsPress}>
                          <FontAwesome5 name="bell" size={20} color="#EE1D52" />
                          <Text style={styles.optionText}>Smart{'\n'}Reminders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionItem} onPress={handleSecuritySettingsPress}>
                          <FontAwesome5 name="shield-alt" size={20} color="#EE1D52" />
                          <Text style={styles.optionText}>Security{'\n'}Settings</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteFund}
                      >
                        <FontAwesome5 name="trash-alt" size={16} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>Delete Fund</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </SafeAreaView>

        {/* Add the PinAuthModal */}
        <PinAuthModal 
          visible={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
        />

        {/* Confetti overlay */}
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
      </KeyboardAvoidingView>
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: '100%', justifyContent: 'flex-end' }}
          >
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
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
      {renderTransactionHistoryModal()}
      {renderReminderSettingsModal()}
      {renderSecuritySettingsModal()}
    </>
  );
};

export default CoupleFundScreen;

// All styles have been moved to assets/styles/CoupleFundStyle.ts