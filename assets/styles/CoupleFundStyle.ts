import { StyleSheet, Dimensions, ViewStyle, Platform, StatusBar, TextStyle, ImageStyle } from 'react-native';

const { width } = Dimensions.get('window');
const SCREEN_PADDING = 16;
const CARD_WIDTH = width - (SCREEN_PADDING * 2);

// Color constants for better organization and reuse
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

// Common styles that are reused
const commonStyles = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBase: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
  },
};

const commonHeaderStyles: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: COLORS.primary,
  paddingHorizontal: 16,
  paddingVertical: 12,
  paddingTop: Platform.OS === 'android' ? 12 : 12,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
};

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  placeholderImage: ImageStyle;
  main: ViewStyle;
  fundCreationButtonContainer: ViewStyle;
  fundCreationButton: ViewStyle;
  gradientButton: ViewStyle;
  fundCreationText: TextStyle;
  cardList: ViewStyle;
  card: ViewStyle;
  cardImage: ImageStyle;
  cardTitleContainer: ViewStyle;
  cardTitle: TextStyle;
  cardFooter: ViewStyle;
  amountContainerCard: ViewStyle;
  cardAmount: TextStyle;
  cardTargetAmount: TextStyle;
  avatarContainer: ViewStyle;
  avatar: ImageStyle;
  detailContainer: ViewStyle;
  detailHeader: ViewStyle;
  detailHeaderTitle: TextStyle;
  scrollContainer: ViewStyle;
  imageContainer: ViewStyle;
  backgroundImage: ImageStyle;
  changePhotoButton: ViewStyle;
  changePhotoGradient: ViewStyle;
  changePhotoIconContainer: ViewStyle;
  changePhotoText: TextStyle;
  detailCard: ViewStyle;
  fundInfo: ViewStyle;
  fundBalanceLabel: TextStyle;
  fundBalanceAmount: TextStyle;
  fundDescription: TextStyle;
  actionSection: ViewStyle;
  iconCircle: ViewStyle;
  buttonContainer: ViewStyle;
  fundButton: ViewStyle;
  fundButtonText: TextStyle;
  buttonIcon: ViewStyle;
  optionsSection: ViewStyle;
  optionItem: ViewStyle;
  optionText: TextStyle;
  detailBottomNav: ViewStyle;
  modalContainer: ViewStyle;
  popupModalContent: ViewStyle;
  input: TextStyle;
  editButtons: ViewStyle;
  editButton: ViewStyle;
  editButtonText: TextStyle;
  progressContainer: ViewStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
  progressText: TextStyle;
  amountContainer: ViewStyle;
  amountBox: ViewStyle;
  amountLabel: TextStyle;
  amountInput: TextStyle;
  amountInputContainer: ViewStyle;
  amountInputLabel: TextStyle;
  loadingContainer: ViewStyle;
  deleteButton: ViewStyle;
  deleteButtonText: TextStyle;
  listContainer: ViewStyle;
  detailContent: ViewStyle;
  actionButtons: ViewStyle;
  searchContainer: ViewStyle;
  searchInputContainer: ViewStyle;
  searchInput: TextStyle;
  searchIcon: ImageStyle;
  clearButton: ViewStyle;
  cancelButton: ViewStyle;
  cancelButtonText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
  createdDateContainer: ViewStyle;
  dateItem: ViewStyle;
  createdDateText: TextStyle;
  cardDate: TextStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  modalInput: TextStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  modalButtonText: TextStyle;
  celebrationContainer: ViewStyle;
  celebrationText: TextStyle;
  celebrateAgainButton: ViewStyle;
  celebrateAgainText: TextStyle;
  confettiOverlay: ViewStyle;
  completedStatus: ViewStyle;
  completedText: TextStyle;
  editInputsContainer: ViewStyle;
  amountInputsRow: ViewStyle;
  amountInputWrapper: ViewStyle;
  scrollContentContainer: ViewStyle;
  transactionContainer: ViewStyle;
  transactionHeader: ViewStyle;
  transactionTitle: TextStyle;
  transactionList: ViewStyle;
  transactionItem: ViewStyle;
  transactionInfo: ViewStyle;
  transactionType: TextStyle;
  transactionDate: TextStyle;
  transactionAmount: TextStyle;
  depositAmount: TextStyle;
  withdrawAmount: TextStyle;
  reminderContainer: ViewStyle;
  reminderHeader: ViewStyle;
  reminderTitle: TextStyle;
  reminderList: ViewStyle;
  reminderItem: ViewStyle;
  reminderItemHeader: ViewStyle;
  reminderName: TextStyle;
  reminderTime: TextStyle;
  reminderDescription: TextStyle;
  reminderActions: ViewStyle;
  reminderActionButton: ViewStyle;
  reminderActionText: TextStyle;
  addFundButton: ViewStyle;
  addFundButtonIcon: TextStyle;
  settingItem: ViewStyle;
  settingLabel: TextStyle;
  authPinInput: TextStyle;
  transactionDescription: TextStyle;
  emptyTransactions: ViewStyle;
  emptyTransactionsText: TextStyle;
  emptyTransactionsSubText: TextStyle;
  closeButton: ViewStyle;
  transactionSummary: ViewStyle;
  summaryItem: ViewStyle;
  summaryLabel: TextStyle;
  summaryValue: TextStyle;
  summaryDivider: ViewStyle;
  transactionListHeader: ViewStyle;
  transactionListTitle: TextStyle;
  transactionIconContainer: ViewStyle;
  transactionIcon: ViewStyle;
  transactionListFooter: ViewStyle;
  transactionDateHeader: TextStyle;
  transactionCard: ViewStyle;
  transactionCardRow: ViewStyle;
  transactionCardInfo: ViewStyle;
  transactionCardType: TextStyle;
  transactionCardDesc: TextStyle;
  transactionCardAmountBox: ViewStyle;
  transactionCardAmount: TextStyle;
  transactionCardTime: TextStyle;
  actionButtonLarge: ViewStyle;
  actionButtonLargeText: TextStyle;
  authModalContainer: ViewStyle;
  authModalContent: ViewStyle;
  authTitle: TextStyle;
  authMessage: TextStyle;
  pinContainer: ViewStyle;
  pinInputFocus: ViewStyle;
  pinInputError: ViewStyle;
  authButton: ViewStyle;
  authButtonText: TextStyle;
  cancelAuthButton: ViewStyle;
  cancelAuthText: TextStyle;
  errorText: TextStyle;
  pinInputContainer: ViewStyle;
  pinInputLabel: TextStyle;
}

export const styles = StyleSheet.create<any>({
  // Base container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header styles
  header: commonHeaderStyles,
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Roboto',
  },
  
  // Placeholder styles
  placeholderImage: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Main content styles
  main: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  
  // Fund creation button styles
  fundCreationButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  fundCreationButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  fundCreationText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Card list styles
  cardList: {
    paddingBottom: 120,
  },
  
  // Card styles
  card: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'left',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  amountContainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAmount: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardTargetAmount: {
    fontSize: 12,
    color: COLORS.textMedium,
    fontWeight: '400',
    marginLeft: 4,
    textAlign: 'center',
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
    borderColor: COLORS.white,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ImageStyle,
  
  // Detail styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#F0EFEE',
  },
  detailHeader: commonHeaderStyles,
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
    flex: 1,
    fontFamily: 'Roboto',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  detailContent: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: width,
    height: width * 0.5,
    marginBottom: 16,
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
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  changePhotoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  changePhotoIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.2,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
    width: CARD_WIDTH,
  },
  fundInfo: {
    marginBottom: 20,
  },
  fundBalanceLabel: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 4,
  },
  fundBalanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  fundDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  
  // Action section styles
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  fundButton: {
    backgroundColor: COLORS.lightPink,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  fundButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  
  // Options section styles
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 20,
    marginBottom: 16,
  },
  optionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 4,
    ...commonStyles.shadow,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Bottom nav styles
  detailBottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupModalContent: {
    ...commonStyles.modalBase,
    borderRadius: 8,
    ...commonStyles.modalShadow,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    ...commonStyles.modalBase,
    maxHeight: '90%',
    ...commonStyles.modalShadow,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalInput: {
    ...commonStyles.input,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Input styles
  input: {
    ...commonStyles.input,
    marginBottom: 12,
  },
  editInputsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  amountInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountInputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  amountInput: {
    ...commonStyles.input,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInputLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  // Button styles
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Progress bar styles
  progressContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: 8,
  },
  
  // Amount display styles
  amountContainer: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  amountBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  
  // List container styles
  listContainer: {
    flexGrow: 1,
  },
  
  // Action buttons styles
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  
  // Search styles
  searchContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  searchIcon: {
    width: 16,
    height: 16,
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  
  // Date display styles
  createdDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexWrap: 'wrap',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
    marginBottom: 8,
  },
  createdDateText: {
    fontSize: 13,
    color: COLORS.textMedium,
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 4,
  },
  
  // Celebration styles
  celebrationContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrateAgainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  celebrateAgainText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
  
  // Status indicators
  completedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: COLORS.success,
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  
  // Transaction history styles
  transactionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    ...commonStyles.shadow,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    width: '100%',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEF',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  depositAmount: {
    color: '#4CAF50',
  },
  withdrawAmount: {
    color: '#DC2626',
  },
  emptyTransactions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyTransactionsText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyTransactionsSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    padding: 8,
  },
  transactionSummary: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  transactionListHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  transactionListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  transactionIconContainer: {
    paddingRight: 16,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionListFooter: {
    height: 24,
  },
  transactionDateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F7FAFC',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Reminder styles
  reminderContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    ...commonStyles.shadow,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  reminderList: {
    marginTop: 8,
  },
  reminderItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reminderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  reminderTime: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  reminderDescription: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 8,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  reminderActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  reminderActionText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  
  // Add Fund Button styles
  addFundButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  addFundButtonIcon: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '600',
  },
  
  // Security Settings styles
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.textDark,
    flex: 1,
  },
  authPinInput: {
    ...commonStyles.input,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 16,
    backgroundColor: '#F9FAFB',
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pinInputFocus: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  pinInputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  authButton: {
    ...commonStyles.button,
    backgroundColor: COLORS.primary,
    marginBottom: 12,
    height: 48,
  },
  authButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelAuthButton: {
    ...commonStyles.button,
    backgroundColor: 'transparent',
  },
  cancelAuthText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textMedium,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtonLarge: {
    ...commonStyles.button,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonLargeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pinInputContainer: {
    marginBottom: 24,
  },
  pinInputLabel: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  authModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  authModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    ...commonStyles.modalShadow,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  authMessage: {
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginBottom: 24,
  },
} as unknown as Styles);