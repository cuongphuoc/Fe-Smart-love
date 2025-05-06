import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../assets/styles/CoupleFundStyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
}

const formatNumberWithDots = (number: string): string => {
  // Loại bỏ ký tự không phải số
  const cleanNumber = number.replace(/[^\d]/g, '');
  // Chuyển thành mảng ký tự và đảo ngược
  const chars = cleanNumber.split('').reverse();
  // Thêm dấu chấm sau mỗi 3 số
  const withDots = chars.reduce((acc, curr, i) => {
    if (i > 0 && i % 3 === 0) {
      return curr + '.' + acc;
    }
    return curr + acc;
  }, '');
  return withDots || '0';
};

const formatAmount = (amount: string): string => {
  return `${formatNumberWithDots(amount)}đ`;
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

const handleAmountInput = (text: string, type: 'current' | 'target', setState: any) => {
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
  },
];

const STORAGE_KEY = 'couple_funds_data';

const CoupleFundScreen: React.FC = () => {
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

    const formattedCurrentAmount = formatAmount(editingFund.currentAmount);
    const formattedTargetAmount = formatAmount(editingFund.targetAmount);

    const updatedFunds = funds.map(fund => {
      if (fund.id === selectedFund.id) {
        return {
          ...fund,
          title: editingFund.title,
          description: editingFund.description || fund.description,
          amount: formattedCurrentAmount,
          targetAmount: formattedTargetAmount,
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
    } : null);
    setIsEditMode(false);
  };

  const handleCreateFund = async () => {
    if (!newFund.title || !newFund.targetAmount) {
      Alert.alert('Missing information', 'Please fill in all required fields');
      return;
    }

    const formattedAmount = formatAmount(newFund.currentAmount);
    const formattedTargetAmount = formatAmount(newFund.targetAmount);

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

  const renderFundDetail = () => (
    <SafeAreaView style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity
          accessibilityLabel="Back"
          onPress={() => {
            setSelectedFund(null);
            setIsEditMode(false);
            setEditingFund({ title: '', description: '', currentAmount: '', targetAmount: '' });
          }}
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
            source={{ uri: selectedFund?.image }}
            style={styles.backgroundImage}
            accessibilityLabel={selectedFund?.altImage}
          />
          <TouchableOpacity
            style={styles.changePhotoButton}
            activeOpacity={0.8}
            accessibilityLabel="Change photo"
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
            <Text style={styles.fundBalanceLabel}>Fund Progress</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${calculateProgress(selectedFund?.amount || '0', selectedFund?.targetAmount || '0')}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {calculateProgress(selectedFund?.amount || '0', selectedFund?.targetAmount || '0').toFixed(1)}%
              </Text>
            </View>
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
                <TextInput
                  style={styles.amountInput}
                  placeholder="Current Amount"
                  value={`${editingFund.currentAmount}`}
                  onChangeText={(text) => handleAmountInput(text, 'current', setEditingFund)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.amountInput}
                  placeholder="Target Amount"
                  value={`${editingFund.targetAmount}`}
                  onChangeText={(text) => handleAmountInput(text, 'target', setEditingFund)}
                  keyboardType="numeric"
                />
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
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Back">
          <FontAwesome5 name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Couple Fund</Text>
        <TouchableOpacity accessibilityLabel="Search">
          <FontAwesome name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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
          data={funds}
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
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      </View>
    </SafeAreaView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EE1D52" />
      </View>
    );
  }

  return selectedFund ? renderFundDetail() : renderFundList();
};

export default CoupleFundScreen;