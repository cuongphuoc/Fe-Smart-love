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
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '../../assets/styles/CoupleFundStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Constants
const STORAGE_KEY = 'couple_funds_data';
const MAX_FUNDS = 10;

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
  return num.toLocaleString('vi-VN');
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

// Components
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
    setDisplayedPercent(progress.toFixed(2));
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

  // Effects
  useEffect(() => {
    loadFundsData();
  }, []);

  useEffect(() => {
    setFilteredFunds(funds);
  }, [funds]);

  // Handlers
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
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newImageUri = result.assets[0].uri;
        setSelectedImage(newImageUri);
        
        if (selectedFund) {
          const updatedFund = { ...selectedFund, image: newImageUri };
          setSelectedFund(updatedFund);
          
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
      createdAt: formatDateTime(currentDate),
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

  const handleEditFund = async () => {
    if (!selectedFund || !editingFund.title || !editingFund.targetAmount) {
      Alert.alert('Missing information', 'Please fill in all required fields');
      return;
    }

    const formattedCurrentAmount = editingFund.currentAmount ? formatAmount(editingFund.currentAmount) : "0đ";
    const formattedTargetAmount = formatAmount(editingFund.targetAmount);
    const currentDate = new Date();

    const updatedFund = {
      ...selectedFund,
      title: editingFund.title,
      description: editingFund.description || selectedFund.description,
      amount: formattedCurrentAmount,
      targetAmount: formattedTargetAmount,
      modifiedAt: formatDateTime(currentDate),
    };

    const updatedFunds = funds.map(fund => 
      fund.id === selectedFund.id ? updatedFund : fund
    );

    setFunds(updatedFunds);
    await saveFundsData(updatedFunds);
    setSelectedFund(updatedFund);
    setIsEditMode(false);
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

  // Render functions
  const renderFundItem = ({ item }: { item: Fund }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedFund(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        accessibilityLabel={item.altImage}
      />
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
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

  const renderFundDetail = () => (
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

  const renderFundList = () => (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 12 }]}>
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
          bounces={false}
          overScrollMode="never"
          removeClippedSubviews={true}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          ListEmptyComponent={renderEmptyList}
          ListFooterComponent={<View style={{ height: 80 }} />}
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

  if (isLoading) {
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