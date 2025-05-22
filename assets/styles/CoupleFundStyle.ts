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
}

export const styles = StyleSheet.create<Styles>({
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
  },
  optionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  optionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E6003F',
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupModalContent: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.textDark,
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
    width: '100%',
    height: 40,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
    backgroundColor: COLORS.lightGray,
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
    width: '100%',
    height: 48,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    color: COLORS.textDark,
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
});