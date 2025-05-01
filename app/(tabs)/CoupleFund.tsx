import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

// Types
interface Fund {
  id: string;
  title: string;
  image: string;
  targetAmount: string;
  currentAmount: string;
  avatars: string[];
  description?: string;
}

interface NewFund {
  title: string;
  currentAmount: string;
  targetAmount: string;
  image: string;
}

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showEdit?: boolean;
  onBack?: () => void;
  onEdit?: () => void;
}

interface ProgressBarProps {
  current?: string;
  target?: string;
}

interface FundCardProps {
  fund: Fund;
  onPress: () => void;
}

interface CreateFundButtonProps {
  onPress: () => void;
  fundCount: number;
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Constants
const INITIAL_FUND_DATA: Fund[] = [
  {
    id: '1',
    title: 'Vacation',
    image: 'https://storage.googleapis.com/a1aa/image/30b7904f-bdac-4cc1-2319-933f2f889860.jpg',
    targetAmount: '10.000.000đ',
    currentAmount: '1.000.000đ',
    avatars: [
      'https://storage.googleapis.com/a1aa/image/ce590e14-7134-4721-c170-5ef9ab3660d6.jpg',
      'https://storage.googleapis.com/a1aa/image/39eb2e82-9f19-4557-d5d6-2ded9bf6aa85.jpg',
    ],
  },
  {
    id: '2',
    title: 'Emergency',
    image: 'https://storage.googleapis.com/a1aa/image/9fc95554-b616-4b50-be10-29d9dfac1103.jpg',
    targetAmount: '20.000.000đ',
    currentAmount: '15.000.000đ',
    avatars: [
      'https://storage.googleapis.com/a1aa/image/ce590e14-7134-4721-c170-5ef9ab3660d6.jpg',
      'https://storage.googleapis.com/a1aa/image/39eb2e82-9f19-4557-d5d6-2ded9bf6aa85.jpg',
    ],
  },
  {
    id: '3',
    title: 'Savings',
    image: 'https://storage.googleapis.com/a1aa/image/06debfb2-f78e-47d7-cb96-1431891697de.jpg',
    targetAmount: '50.000.000đ',
    currentAmount: '30.000.000đ',
    avatars: [
      'https://storage.googleapis.com/a1aa/image/ce590e14-7134-4721-c170-5ef9ab3660d6.jpg',
      'https://storage.googleapis.com/a1aa/image/39eb2e82-9f19-4557-d5d6-2ded9bf6aa85.jpg',
    ],
  },
];

const INITIAL_NEW_FUND: NewFund = {
  title: '',
  currentAmount: '',
  targetAmount: '',
  image: 'https://storage.googleapis.com/a1aa/image/default-fund.jpg',
};

const THEME = {
  colors: {
    primary: '#EC4899',
    secondary: '#F3F4F6',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      white: '#FFFFFF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F3F4F6',
    },
    border: '#D1D5DB',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 30,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Components
const Header: React.FC<HeaderProps> = ({ title, showBack = false, showEdit = false, onBack, onEdit }) => (
  <View style={styles.header}>
    {showBack && (
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="chevron-left" size={24} color={THEME.colors.text.white} />
      </TouchableOpacity>
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    {showEdit ? (
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Icon name="edit" size={20} color={THEME.colors.text.white} />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity>
        <Icon name="search" size={20} color={THEME.colors.text.white} />
      </TouchableOpacity>
    )}
  </View>
);

const ProgressBar: React.FC<ProgressBarProps> = ({ current = '0', target = '1' }) => {
  const progress = Math.min(
    (parseInt(current.replace(/\D/g, '') || '0') /
    parseInt(target.replace(/\D/g, '') || '1')) * 100,
    100
  );

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
};

const FundCard: React.FC<FundCardProps> = ({ fund, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: fund.image }} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{fund.title}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <Text style={styles.cardAmount}>{fund.currentAmount}</Text>
          <Text style={styles.cardTargetLabel}>/ {fund.targetAmount}</Text>
        </View>
        <View style={styles.avatarContainer}>
          {fund.avatars.map((avatar, index) => (
            <Image
              key={index}
              source={{ uri: avatar }}
              style={[styles.avatar, index > 0 && styles.avatarOverlap]}
            />
          ))}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const CreateFundButton: React.FC<CreateFundButtonProps> = ({ onPress, fundCount }) => (
  <TouchableOpacity style={styles.fundCreationButton} onPress={onPress}>
    <LinearGradient
      colors={['#f44369', '#f99fb1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fundCreationGradient}
    >
      <Icon name="plus-circle" size={16} color={THEME.colors.text.white} style={styles.createIcon} />
      <Text style={styles.fundCreationText}>Create new fund ({fundCount}/10)</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose, title, children }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        {children}
      </View>
    </View>
  </Modal>
);

// Main Component
export default function CoupleFundScreen() {
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUND_DATA);
  const [newFund, setNewFund] = useState<NewFund>(INITIAL_NEW_FUND);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    if (selectedFund) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedFund]);

  const handleCreateFund = () => {
    if (!newFund.title || !newFund.currentAmount || !newFund.targetAmount) return;

    const newFundItem: Fund = {
      id: (funds.length + 1).toString(),
      title: newFund.title,
      image: newFund.image,
      targetAmount: newFund.targetAmount + 'đ',
      currentAmount: newFund.currentAmount + 'đ',
      avatars: [
        'https://storage.googleapis.com/a1aa/image/ce590e14-7134-4721-c170-5ef9ab3660d6.jpg',
        'https://storage.googleapis.com/a1aa/image/39eb2e82-9f19-4557-d5d6-2ded9bf6aa85.jpg',
      ],
    };

    setFunds((prevFunds) => [...prevFunds, newFundItem]);
    setModalVisible(false);
    setNewFund(INITIAL_NEW_FUND);
  };

  const handleEditFund = () => {
    if (!editingFund) return;
    const updatedFunds = funds.map((fund) =>
      fund.id === editingFund.id ? editingFund : fund
    );
    setFunds(updatedFunds);
    setSelectedFund(editingFund);
    setEditModalVisible(false);
    setEditingFund(null);
  };

  const renderFundDetail = () => (
    <>
      <Header
        title={selectedFund?.title || ''}
        showBack={true}
        showEdit={true}
        onBack={() => setSelectedFund(null)}
        onEdit={() => {
          if (selectedFund) {
            setEditingFund({
              ...selectedFund,
              targetAmount: selectedFund.targetAmount.replace('đ', ''),
              currentAmount: selectedFund.currentAmount.replace('đ', ''),
            });
            setEditModalVisible(true);
          }
        }}
      />

      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <Image source={{ uri: selectedFund?.image }} style={styles.backgroundImage} />
        <TouchableOpacity style={styles.changePhotoButton}>
          <Icon name="camera" size={12} color={THEME.colors.text.secondary} />
          <Text style={styles.changePhotoText}>Change photo</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={[
          styles.detailCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.fundInfo}>
          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>Target Amount</Text>
            <Text style={styles.targetValue}>{selectedFund?.targetAmount}</Text>
          </View>

          <ProgressBar
            current={selectedFund?.currentAmount}
            target={selectedFund?.targetAmount}
          />

          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>{selectedFund?.currentAmount}</Text>
          </View>

          <Text style={styles.balanceDescription}>
            {selectedFund?.description || "Let's create goals and make dreams come true"}
          </Text>

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add more</Text>
          </TouchableOpacity>

          <View style={styles.transactionSection}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {/* Transaction list will be added here */}
          </View>
        </View>
      </Animated.ScrollView>

      <CustomModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Fund"
      >
        <TextInput
          style={styles.input}
          placeholder="Fund Title"
          value={editingFund?.title}
          onChangeText={(text) =>
            setEditingFund((prev) => (prev ? { ...prev, title: text } : null))
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Current Amount"
          keyboardType="numeric"
          value={editingFund?.currentAmount}
          onChangeText={(text) =>
            setEditingFund((prev) => (prev ? { ...prev, currentAmount: text } : null))
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Target Amount"
          keyboardType="numeric"
          value={editingFund?.targetAmount}
          onChangeText={(text) =>
            setEditingFund((prev) => (prev ? { ...prev, targetAmount: text } : null))
          }
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setEditModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.createButton]}
            onPress={handleEditFund}
          >
            <Text style={[styles.buttonText, styles.createButtonText]}>Save</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </>
  );

  const renderFundList = () => (
    <>
      <Header title="Couple Fund" />
      <View style={styles.main}>
        <CreateFundButton onPress={() => setModalVisible(true)} fundCount={funds.length} />
        <FlatList
          data={funds}
          renderItem={({ item }) => (
            <FundCard fund={item} onPress={() => setSelectedFund(item)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cardList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <CustomModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Create New Fund"
      >
        <TextInput
          style={styles.input}
          placeholder="Fund Title"
          value={newFund.title}
          onChangeText={(text) => setNewFund({ ...newFund, title: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Initial Amount"
          keyboardType="numeric"
          value={newFund.currentAmount}
          onChangeText={(text) => setNewFund({ ...newFund, currentAmount: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Target Amount"
          keyboardType="numeric"
          value={newFund.targetAmount}
          onChangeText={(text) => setNewFund({ ...newFund, targetAmount: text })}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.createButton]}
            onPress={handleCreateFund}
          >
            <Text style={[styles.buttonText, styles.createButtonText]}>Create</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {selectedFund ? renderFundDetail() : renderFundList()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background.secondary,
  },
  header: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    paddingTop: Platform.OS === 'ios' ? THEME.spacing.lg : 45,
    ...THEME.shadows.small,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: THEME.colors.text.white,
    textAlign: 'center',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  main: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
  },
  fundCreationButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginVertical: THEME.spacing.md,
    alignSelf: 'flex-end',
    ...THEME.shadows.small,
  },
  fundCreationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
  },
  createIcon: {
    marginRight: THEME.spacing.sm,
  },
  fundCreationText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text.white,
  },
  cardList: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: THEME.colors.background.primary,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadows.medium,
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: THEME.spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.secondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  cardTargetLabel: {
    fontSize: 14,
    color: THEME.colors.text.secondary,
    marginLeft: THEME.spacing.xs,
  },
  avatarContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: THEME.colors.background.primary,
  },
  avatarOverlap: {
    marginLeft: -12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME.colors.background.primary,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...THEME.shadows.large,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    fontSize: 16,
    backgroundColor: THEME.colors.background.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: THEME.borderRadius.sm,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: THEME.colors.secondary,
  },
  createButton: {
    backgroundColor: THEME.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButtonText: {
    color: THEME.colors.text.white,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: THEME.colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    ...THEME.shadows.small,
  },
  changePhotoText: {
    fontSize: 12,
    color: THEME.colors.text.secondary,
    fontWeight: '500',
    marginLeft: THEME.spacing.xs,
  },
  detailCard: {
    backgroundColor: THEME.colors.background.primary,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginHorizontal: THEME.spacing.md,
    marginTop: -20,
    ...THEME.shadows.large,
    maxHeight: '70%',
  },
  fundInfo: {
    flex: 1,
  },
  targetSection: {
    marginBottom: THEME.spacing.md,
  },
  targetLabel: {
    fontSize: 16,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.xs,
  },
  targetValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: THEME.colors.secondary,
    borderRadius: 8,
    flex: 1,
    marginRight: THEME.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text.secondary,
    minWidth: 45,
  },
  balanceSection: {
    marginBottom: THEME.spacing.md,
  },
  balanceLabel: {
    fontSize: 16,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.xs,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
  },
  balanceDescription: {
    fontSize: 14,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.lg,
  },
  addButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.md,
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.small,
  },
  addButtonText: {
    color: THEME.colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionSection: {
    marginTop: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.md,
  },
  backButton: {
    padding: THEME.spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editButton: {
    padding: THEME.spacing.sm,
  },
}); 