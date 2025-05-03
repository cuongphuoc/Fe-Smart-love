import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';

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

const formatAmount = (amount: string) => {
  // Remove non-numeric characters except dots
  const cleanAmount = amount.replace(/[^0-9.]/g, '');
  if (!cleanAmount) return '0đ';

  // Convert to number and format with thousand separators
  const num = parseFloat(cleanAmount);
  if (isNaN(num)) return '0đ';

  // Format with thousand separators
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Add decimal part if exists
  const formatted = parts.join('.');
  return `${formatted}đ`;
};

const fundData: Fund[] = [
  {
    id: '1',
    image: 'https://storage.googleapis.com/a1aa/image/771bcb81-a9ea-48f4-f960-9d4345331456.jpg',
    amount: '123.456đ',
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
    amount: '2.123.456đ',
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
    amount: '1.123.456đ',
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
    currentAmount: '0',
    targetAmount: '',
  });
  const [funds, setFunds] = useState<Fund[]>(fundData);

  const calculateProgress = (current: string, target: string) => {
    // Remove all non-numeric characters except dots
    const currentClean = current.replace(/[^0-9.]/g, '');
    const targetClean = target.replace(/[^0-9.]/g, '');
    
    // Convert to numbers
    const currentNum = parseFloat(currentClean) || 0;
    const targetNum = parseFloat(targetClean) || 1;
    
    // Calculate percentage and ensure it's between 0 and 100
    const percentage = (currentNum / targetNum) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const handleEditFund = () => {
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
    setSelectedFund(prev => prev ? {
      ...prev,
      title: editingFund.title,
      description: editingFund.description || prev.description,
      amount: formattedCurrentAmount,
      targetAmount: formattedTargetAmount,
    } : null);
    setIsEditMode(false);
  };

  const handleCreateFund = () => {
    if (!newFund.title || !newFund.targetAmount) {
      Alert.alert('Missing information', 'Please fill in all required fields');
      return;
    }

    const formattedAmount = newFund.currentAmount.endsWith('đ') 
      ? newFund.currentAmount 
      : `${newFund.currentAmount}đ`;

    const newFundData: Fund = {
      id: (funds.length + 1).toString(),
      title: newFund.title,
      description: newFund.description || "Let's create goals and make dreams come true",
      image: 'https://storage.googleapis.com/a1aa/image/771bcb81-a9ea-48f4-f960-9d4345331456.jpg', // Default image
      amount: formattedAmount,
      targetAmount: newFund.targetAmount,
      avatars: [
        'https://storage.googleapis.com/a1aa/image/209b0077-8f69-4baa-1e6e-d52c4c97a589.jpg',
        'https://storage.googleapis.com/a1aa/image/53530cbf-ea2d-420d-0ab9-2b0982e4d2ac.jpg',
      ],
      altImage: 'Default fund image',
      altAvatar1: 'Avatar of person 1',
      altAvatar2: 'Avatar of person 2',
    };

    setFunds([...funds, newFundData]);
    
    setNewFund({
      title: '',
      description: '',
      currentAmount: '0',
      targetAmount: '',
    });
    setIsModalVisible(false);
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
          Building a common future
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
            accessibilityLabel="Change photo"
          >
            <FontAwesome5 name="camera" size={12} color="#4B5563" style={styles.changePhotoIcon} />
            <Text style={styles.changePhotoText}>Change photo</Text>
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
                  style={[styles.input, { marginTop: 10 }]}
                  placeholder="Current Amount"
                  value={editingFund.currentAmount}
                  onChangeText={(text) => setEditingFund(prev => ({ ...prev, currentAmount: text }))}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { marginTop: 10 }]}
                  placeholder="Target Amount"
                  value={editingFund.targetAmount}
                  onChangeText={(text) => setEditingFund(prev => ({ ...prev, targetAmount: text }))}
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
              <FontAwesome5 name="dollar-sign" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.fundButton}>
                <Text style={styles.fundButtonText}>+ Fund</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fundButton}>
                <FontAwesome5 name="credit-card" size={14} color="#F75A7C" style={styles.buttonIcon} />
                <Text style={styles.fundButtonText}>Withdraw funds</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsSection}>
            <View style={styles.optionItem}>
              <FontAwesome5 name="hand-peace" size={18} color="#E6003F" />
              <Text style={styles.optionText}>Reminder to{'\n'}contribute</Text>
            </View>
            <View style={styles.optionItem}>
              <FontAwesome5 name="qrcode" size={18} color="#E6003F" />
              <Text style={styles.optionText}>QR fundraiser</Text>
            </View>
            <View style={styles.optionItem}>
              <FontAwesome5 name="money-bill-wave" size={18} color="#E6003F" />
              <Text style={styles.optionText}>Payment,{'\n'}money transfer</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderFundList = () => (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Back">
          <FontAwesome5 name="chevron-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Couple Fund</Text>
        <TouchableOpacity accessibilityLabel="Search">
          <FontAwesome name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        <View style={styles.fundCreationButtonContainer}>
          <TouchableOpacity 
            style={styles.fundCreationButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.fundCreationText}>Create new fund ({funds.length}/10)</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={funds}
          renderItem={renderFundItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cardList}
        />
      </View>

      {/* Create Fund Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Fund</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Fund Title"
              value={newFund.title}
              onChangeText={(text) => setNewFund({...newFund, title: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={newFund.description}
              onChangeText={(text) => setNewFund({...newFund, description: text})}
              multiline
            />
            
            <TextInput
              style={styles.input}
              placeholder="Initial Amount"
              value={newFund.currentAmount}
              onChangeText={(text) => setNewFund({...newFund, currentAmount: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Target Amount"
              value={newFund.targetAmount}
              onChangeText={(text) => setNewFund({...newFund, targetAmount: text})}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#9CA3AF' }]}
                onPress={() => {
                  setIsModalVisible(false);
                  setNewFund({
                    title: '',
                    description: '',
                    currentAmount: '0',
                    targetAmount: '',
                  });
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  return selectedFund ? renderFundDetail() : renderFundList();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // bg-gray-100
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EC4899', // bg-pink-600
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Roboto',
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96, // Space for bottom nav
  },
  fundCreationButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  fundCreationButton: {
    backgroundColor: '#E5E7EB', // bg-gray-200
    borderRadius: 9999, // rounded-full
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
  },
  fundCreationText: {
    fontSize: 12,
    color: '#374151', // text-gray-700
    fontWeight: '500',
  },
  cardList: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardTitleContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'left',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cardAmount: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '500',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -8, // Để các avatar chồng lên nhau
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#F0EFEE', // bg-[#f0efee]
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EC4899', //
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Roboto',
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 16, // Thêm khoảng cách giữa ảnh và card
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  changePhotoIcon: {
    marginRight: 4,
  },
  changePhotoText: {
    fontSize: 12,
    color: '#4B5563', // text-gray-600
    fontWeight: '500',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20, // Thêm margin bottom để tránh che khuất nội dung cuối
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
    maxWidth: 448,
    width: '100%',
  },
  fundInfo: {
    marginBottom: 20,
  },
  fundBalanceLabel: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
    marginBottom: 4,
  },
  fundBalanceAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  fundDescription: {
    fontSize: 12,
    color: '#4B5563', // text-gray-600
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9A1B7', // Fallback for gradient
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 12,
  },
  fundButton: {
    backgroundColor: '#F9A1B7', // bg-[#f9a1b7]
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F75A7C', // text-[#f75a7c]
  },
  buttonIcon: {
    marginRight: 8,
  },
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E6003F', // text-[#e6003f]
    textAlign: 'center',
  },
  detailBottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // border-gray-200
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 448,
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#EC4899',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#EC4899',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
    textAlign: 'right',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  amountBox: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  targetAmount: {
    fontSize: 12,
    color: '#EC4899',
    fontWeight: '600',
  },
});

export default CoupleFundScreen;