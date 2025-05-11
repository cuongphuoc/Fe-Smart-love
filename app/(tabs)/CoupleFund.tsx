import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../assets/styles/CoupleFundStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Cập nhật interface Fund
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
  modifiedAt?: string; // Thêm trường ngày sửa đổi (có thể null)
}

// Sửa hàm formatNumberWithDots để trả về chuỗi rỗng thay vì "0"
const formatNumberWithDots = (number: string): string => {
  // Loại bỏ ký tự không phải số
  const cleanNumber = number.replace(/[^\d]/g, '');
  
  // Trả về chuỗi rỗng nếu không có số
  if (!cleanNumber) return '';
  
  // Chuyển thành mảng ký tự và đảo ngược
  const chars = cleanNumber.split('').reverse();
  
  // Thêm dấu chấm sau mỗi 3 số
  const withDots = chars.reduce((acc, curr, i) => {
    if (i > 0 && i % 3 === 0) {
      return curr + '.' + acc;
    }
    return curr + acc;
  }, '');
  
  return withDots;
};

// Sửa hàm formatAmount để xử lý chuỗi rỗng
const formatAmount = (amount: string): string => {
  const formattedNumber = formatNumberWithDots(amount);
  return formattedNumber ? `${formattedNumber}đ` : '';
};

const parseAmount = (formattedAmount: string): number => {
  // Loại bỏ dấu chấm và ký tự đ
  const numberStr = formattedAmount.replace(/\./g, '').replace('đ', '');
  return parseInt(numberStr, 10) || 0;
};

const calculateProgress = (current: string, target: string): number => {
  const currentAmount = parseAmount(current);
  const targetAmount = parseAmount(target);
  
  if (targetAmount === 0) return 0;
  const percentage = (currentAmount / targetAmount) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

// Cập nhật hàm handleAmountInput để xử lý khi input rỗng
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

const fundData: Fund[] = [
  {
    id: '1',
    image: 'https://storage.googleapis.com/a1aa/image/771bcb81-a9ea-48f4-f960-9d4345331456.jpg',
    amount: '0',
    targetAmount: '1.500.000đ',
    avatars: [
      'https://storage.googleapis.com/a1aa/image/209b0077-8f69-4baa-1e6e-d52c4c97a589.jpg',
      'https://storage.googleapis.com/a1aa/image/53530cbf-ea2d-420d-0ab9-2b0982e4d2ac.jpg',
    ],
    altImage: 'Two kids eating noodles in colorful bowls on table, indoors',
    altAvatar1: 'Avatar of person 1 with pink hair and glasses',
    altAvatar2: 'Avatar of person 2 with black hair and hat',
    title: 'Vacation Fund',
    description: "Let's create goals and make dreams come true",
    createdAt: '01/01/2023 - 08:30',
  },
  {
    id: '2',
    image: 'https://storage.googleapis.com/a1aa/image/c6359d24-dc89-42f7-7fdc-e5ed61131450.jpg',
    amount: '500.000',
    targetAmount: '5.000.000đ',
    avatars: [
      'https://storage.googleapis.com/a1aa/image/209b0077-8f69-4baa-1e6e-d52c4c97a589.jpg',
      'https://storage.googleapis.com/a1aa/image/53530cbf-ea2d-420d-0ab9-2b0982e4d2ac.jpg',
    ],
    altImage: 'Two women sitting and talking in forest with green background',
    altAvatar1: 'Avatar of person 1 with pink hair and glasses',
    altAvatar2: 'Avatar of person 2 with black hair and hat',
    title: 'Emergency Fund',
    description: "Let's create goals and make dreams come true",
    createdAt: '02/01/2023 - 14:45',
  },
  {
    id: '3',
    image: 'https://storage.googleapis.com/a1aa/image/2bb242ab-4fef-4645-afc1-9326f0296d2d.jpg',
    amount: '300.000',
    targetAmount: '3.000.000đ',
    avatars: [
      'https://storage.googleapis.com/a1aa/image/209b0077-8f69-4baa-1e6e-d52c4c97a589.jpg',
      'https://storage.googleapis.com/a1aa/image/53530cbf-ea2d-420d-0ab9-2b0982e4d2ac.jpg',
    ],
    altImage: 'Man and woman with umbrella painting outside under blue sky',
    altAvatar1: 'Avatar of person 1 with pink hair and glasses',
    altAvatar2: 'Avatar of person 2 with black hair and hat',
    title: 'Savings Fund',
    description: "Let's create goals and make dreams come true",
    createdAt: '03/01/2023 - 10:15',
  },
];

const STORAGE_KEY = 'couple_funds_data';

const CoupleFundScreen: React.FC = () => {
  // Thêm state và ref mới
  const [scrollPosition, setScrollPosition] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
  const [funds, setFunds] = useState<Fund[]>(fundData);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  
  // Thêm paddingBottom động dựa trên insets
  const dynamicStyles = {
    listContainer: {
      paddingBottom: insets.bottom + 70, // 70 là chiều cao của bottom tab
    }
  };

  // Thêm state cho chức năng tìm kiếm
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFunds, setFilteredFunds] = useState<Fund[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadFundsData();
  }, []);

  const loadFundsData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setFunds(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading funds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFundsData = async (updatedFunds: Fund[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFunds));
    } catch (error) {
      console.error('Error saving funds:', error);
    }
  };

  const handleEditFund = async () => {
  if (!selectedFund || !editingFund.title || !editingFund.targetAmount) {
    Alert.alert('Missing information', 'Please fill in all required fields');
    return;
  }

  // Nếu currentAmount rỗng, gán là "0đ"
  const formattedCurrentAmount = editingFund.currentAmount ? formatAmount(editingFund.currentAmount) : "0đ";
  const formattedTargetAmount = formatAmount(editingFund.targetAmount);
  const currentDate = new Date();

  const updatedFunds = funds.map(fund => {
    if (fund.id === selectedFund.id) {
      return {
        ...fund,
        title: editingFund.title,
        description: editingFund.description || fund.description,
        amount: formattedCurrentAmount,
        targetAmount: formattedTargetAmount,
        modifiedAt: formatDateTime(currentDate), // Sử dụng formatDateTime
      };
    }
    return fund;
  });

  setFunds(updatedFunds);
  await saveFundsData(updatedFunds);

  setSelectedFund(prev => prev ? {
    ...prev,
    title: editingFund.title,
    description: editingFund.description || prev.description,
    amount: formattedCurrentAmount,
    targetAmount: formattedTargetAmount,
    modifiedAt: formatDateTime(currentDate), // Sử dụng formatDateTime
  } : null);
  setIsEditMode(false);
};

  // Cập nhật hàm format date để thêm giờ phút
const formatDateTime = (date: Date): string => {
  const dateStr = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const timeStr = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${dateStr} - ${timeStr}`;
};

const handleCreateFund = async () => {
  if (!newFund.title || !newFund.targetAmount) {
    Alert.alert('Missing information', 'Please fill in all required fields');
    return;
  }

  // Nếu currentAmount rỗng, gán là "0đ"
  const formattedAmount = newFund.currentAmount ? formatAmount(newFund.currentAmount) : "0đ";
  const formattedTargetAmount = formatAmount(newFund.targetAmount);
  const currentDate = new Date();

  const newFundData: Fund = {
    id: Date.now().toString(),
    title: newFund.title,
    description: newFund.description || "Let's create goals and make dreams come true",
    image: 'https://storage.googleapis.com/a1aa/image/771bcb81-a9ea-48f4-f960-9d4345331456.jpg',
    amount: formattedAmount,
    targetAmount: formattedTargetAmount,
    avatars: [
      'https://storage.googleapis.com/a1aa/image/209b0077-8f69-4baa-1e6e-d52c4c97a589.jpg',
      'https://storage.googleapis.com/a1aa/image/53530cbf-ea2d-420d-0ab9-2b0982e4d2ac.jpg',
    ],
    altImage: 'Default fund image',
    altAvatar1: 'Avatar of person 1',
    altAvatar2: 'Avatar of person 2',
    createdAt: formatDateTime(currentDate), // Sử dụng formatDateTime
  };

  const updatedFunds = [...funds, newFundData];
  setFunds(updatedFunds);
  await saveFundsData(updatedFunds);
  
  setNewFund({
    title: '',
    description: '',
    currentAmount: '',
    targetAmount: '',
  });
  setIsModalVisible(false);
};

  const handleDeleteFund = async () => {
    if (!selectedFund) return;

    Alert.alert(
      'Delete Fund',
      'Are you sure you want to delete this fund? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedFunds = funds.filter(fund => fund.id !== selectedFund.id);
            setFunds(updatedFunds);
            await saveFundsData(updatedFunds);
            setSelectedFund(null);
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Thêm hàm xử lý tìm kiếm
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredFunds(funds);
      return;
    }

    const searchResults = funds.filter(fund => 
      fund.title.toLowerCase().includes(text.toLowerCase()) ||
      fund.description.toLowerCase().includes(text.toLowerCase()) ||
      fund.amount.includes(text) ||
      fund.targetAmount.includes(text) ||
      fund.createdAt.includes(text) // Thêm tìm kiếm theo ngày
    );
    setFilteredFunds(searchResults);
  }, [funds]);

  // Thêm useEffect để khởi tạo filteredFunds
  useEffect(() => {
    setFilteredFunds(funds);
  }, [funds]);

  // Sửa hàm xử lý khi chọn fund
  const handleSelectFund = (item: Fund) => {
    const scrollResponder = flatListRef.current?.getScrollResponder();
    if (scrollResponder && 'getScrollableNode' in scrollResponder) {
      // @ts-ignore - getScrollableNode exists but TypeScript doesn't recognize it
      const node = scrollResponder.getScrollableNode();
      if (node && node.contentOffset) {
        setScrollPosition(node.contentOffset.y);
      }
    } else {
      // Fallback to get current scroll position
      const offset = flatListRef.current?.props.contentOffset?.y || 0;
      setScrollPosition(offset);
    }
    setSelectedFund(item);
  };

  // Sửa hàm xử lý khi quay lại
  const handleBackFromDetail = () => {
    setSelectedFund(null);
    setIsEditMode(false);
    setEditingFund({ title: '', description: '', currentAmount: '', targetAmount: '' });
    
    // Khôi phục vị trí cuộn sau khi component rerender
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ 
        offset: scrollPosition, 
        animated: false 
      });
    }, 100);
  };

  // Sửa lại trong renderFundItem
  const renderFundItem = ({ item }: { item: Fund }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectFund(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        accessibilityLabel={item.altImage}
      />
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {/* Thêm hiển thị ngày */}
        <Text style={styles.cardDate}>{item.createdAt}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardAmount}>{item.amount}</Text>
        <View style={styles.avatarContainer}>
          {item.avatars.map((avatar, index) => (
            <Image
              key={index}
              source={{ uri: avatar }}
              style={styles.avatar}
              accessibilityLabel={index === 0 ? item.altAvatar1 : item.altAvatar2}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Thêm hàm xử lý chọn ảnh
  const handleImagePick = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // Mở image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newImageUri = result.assets[0].uri;
        setSelectedImage(newImageUri);
        
        // Cập nhật ảnh trong selectedFund
        if (selectedFund) {
          const updatedFund = {
            ...selectedFund,
            image: newImageUri
          };
          setSelectedFund(updatedFund);
          
          // Cập nhật trong danh sách funds
          const updatedFunds = funds.map(fund => 
            fund.id === selectedFund.id ? updatedFund : fund
          );
          setFunds(updatedFunds);
          await saveFundsData(updatedFunds);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Cập nhật phần renderFundDetail để sử dụng ảnh đã chọn
  const renderFundDetail = () => (
    <SafeAreaView style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity
          accessibilityLabel="Back"
          onPress={handleBackFromDetail}
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
          <Image
            source={{ uri: selectedImage || selectedFund?.image }}
            style={styles.backgroundImage}
            accessibilityLabel={selectedFund?.altImage}
          />
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

          <View style={styles.actionSection}>
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
          </View>

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
    </SafeAreaView>
  );

  // Cập nhật renderFundList để thêm thanh tìm kiếm
  const renderFundList = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Back">
          <FontAwesome5 name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Couple Fund</Text>
        <TouchableOpacity 
          accessibilityLabel="Search"
          onPress={() => setIsSearchVisible(true)}
        >
          <FontAwesome name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Thêm thanh tìm kiếm */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <FontAwesome name="search" size={16} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search funds..."
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
      )}

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
                Create new fund ({funds.length}/10)
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={filteredFunds} // Sử dụng filteredFunds thay vì funds
          renderItem={renderFundItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.cardList, dynamicStyles.listContainer]}
          showsVerticalScrollIndicator={true}
          bounces={false}
          overScrollMode="never"
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          onScrollEndDrag={(event) => {
            setScrollPosition(event.nativeEvent.contentOffset.y);
          }}
          onMomentumScrollEnd={(event) => {
            setScrollPosition(event.nativeEvent.contentOffset.y);
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? 'No funds found matching your search'
                  : 'No funds available'}
              </Text>
            </View>
          )}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      </View>
    </SafeAreaView>
  );

  // Thêm Modal vào phần render chính của component
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

  // Thêm vào phần return cuối component
  return (
    <>
      {selectedFund ? renderFundDetail() : renderFundList()}
      {renderCreateFundModal()}
    </>
  );
};

const FundProgressBar = ({ progress }: { progress: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [displayedPercent, setDisplayedPercent] = useState('0.00');
  
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
    
    // Cập nhật hiển thị phần trăm khi animation thay đổi
    const listener = progressAnim.addListener(({ value }) => {
      const formattedValue = value.toFixed(2);
      setDisplayedPercent(formattedValue);
    });
    
    return () => {
      progressAnim.removeListener(listener);
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
        <Animated.View 
          style={[
            styles.progressFill, 
            { width }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {displayedPercent}%
      </Text>
    </View>
  );
};

export default CoupleFundScreen;