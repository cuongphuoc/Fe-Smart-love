import { StyleSheet, Dimensions, ViewStyle, Platform, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const SCREEN_PADDING = 16;
const CARD_WIDTH = width - (SCREEN_PADDING * 2);

// Thêm constants cho màu sắc
const COLORS = {
  primary: '#f03a6c',
  secondary: '#666666',
  white: '#FFFFFF',
  lightGray: '#F3F4F6',
  icon: '#333333',
  background: '#F3F4F6',
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

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // bg-gray-100
  },
  header: commonHeaderStyles,
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
    // Thay đổi paddingBottom để tránh bị che khuất
    paddingBottom: 16,
  },
  fundCreationButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  fundCreationButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary, // Thay đổi từ #EC4899
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
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cardList: {
    // Thêm paddingBottom cho FlatList
    paddingBottom: 120, // Tăng padding bottom để tránh bị che khuất bởi bottom tab
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
  amountContainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAmount: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  cardTargetAmount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    marginLeft: 4,
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
  detailHeader: commonHeaderStyles,
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
    width: width, // Full width của màn hình
    height: width * 0.5, // Tỷ lệ 2:1
    marginBottom: 16, // Thêm khoảng cách giữa ảnh và card
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16, // Giảm padding từ 20 xuống 16
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 20, // Thêm margin bottom để tránh che khuất nội dung cuối
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
    width: CARD_WIDTH, // Đặt chiều rộng dựa trên màn hình
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
    fontSize: 16, // Giảm font size
    color: '#111827',
    fontWeight: '600',
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
    width: 40, // Giảm kích thước
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE6EB', // Màu nhạt hơn của primary
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8, // Giảm gap từ 12 xuống 8
  },
  fundButton: {
    backgroundColor: '#FFE6EB', // Màu nhạt hơn của primary
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16, // Giảm padding ngang
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80, // Đặt chiều rộng tối thiểu
  },
  fundButtonText: {
    fontSize: 13, // Giảm font size
    fontWeight: '600',
    color: COLORS.primary, // Thay đổi từ #F75A7C
  },
  buttonIcon: {
    marginRight: 8,
  },
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8, // Thêm padding để các options không sát viền
  },
  optionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4, // Thêm padding ngang
  },
  optionText: {
    fontSize: 11, // Giảm font size
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
  popupModalContent: {
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
  input: {
    width: '100%',
    height: 40,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary, // Thay đổi từ #EC4899
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
    marginTop: 16, // Giảm margin
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary, // Thay đổi từ #EC4899
    borderRadius: 4,
    // Thêm hiệu ứng shadow để trông nổi bật hơn
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary, // Thay đổi từ #EC4899
    textAlign: 'right',
    marginTop: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    padding: 12, // Giảm padding
    borderRadius: 12,
  },
  amountBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4, // Giảm padding
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountInput: {
    width: '100%',
    height: 48,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInputLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary, // Thay đổi từ #EC4899
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  // Thêm styles mới cho responsive
  detailContent: {
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Cho phép wrap khi không đủ space
    justifyContent: 'flex-end',
    gap: 8,
  },
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  createdDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexWrap: 'wrap', // Cho phép wrap khi không đủ space
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 16,
    marginBottom: 8, // Thêm margin bottom nếu wrap
  },
  createdDateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Modal sẽ slide up từ dưới
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
  },
  modalInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#111827',
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
    backgroundColor: '#EE1D52',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Celebration styles
  celebrationContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFDF00',
  },
  celebrationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
    color: '#FFFFFF',
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
});