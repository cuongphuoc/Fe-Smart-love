import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f03a6c',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '500',
  },
  searchButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
  },
  monthSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  monthTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 22,
    fontWeight: '500',
    marginRight: 5,
  },
  todayLabel: {
    fontSize: 18,
    color: '#f03a6c',
    fontWeight: '500',
  },
  calendarContainer: {
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  calendarNavButton: {
    fontSize: 24,
    color: '#f03a6c',
    paddingHorizontal: 10,
  },
  calendarMonthYear: {
    fontSize: 18,
    color: '#f03a6c',
    fontWeight: '500',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    color: '#f03a6c',
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarDayContainer: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  calendarDayLabel: {
    fontSize: 16,
  },
  calendarDateLabel: {
    fontSize: 16,
    color: '#666',
  },
  currentDateLabel: {
    color: '#f03a6c',
    fontWeight: '700',
  },
  selectedDay: {
    backgroundColor: '#e0e0e0',
  },
  selectedDayText: {
    fontWeight: '700',
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  otherMonthDayText: {
    color: '#aaa',
  },
  currentDateIndicator: {
    height: 3,
    width: 20,
    backgroundColor: '#f03a6c',
    marginTop: 5,
    borderRadius: 1.5,
  },
  taskSectionContainer: {
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskSectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff9999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#f03a6c',
  },
  taskDescription: {
    flex: 1,
    fontSize: 18,
  },
  taskOptionsButton: {
    padding: 5,
  },
  taskOptionsIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  addTaskButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f03a6c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addTaskButtonText: {
    fontSize: 30,
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
  },
  submitButton: {
    backgroundColor: '#f03a6c',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  activeTab: {
    backgroundColor: '#f03a6c',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  selectedDateContainer: {
    backgroundColor: '#f03a6c',
    padding: 15,
    alignItems: 'center',
  },
  selectedYear: {
    color: 'white',
    fontSize: 16,
  },
  selectedDayMonth: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
  contextMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  contextMenuContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  contextMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  contextMenuItemText: {
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#f03a6c',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#f03a6c',
    fontWeight: '500',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchModeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeSearchMode: {
    borderBottomColor: '#f03a6c',
  },
  searchModeText: {
    fontSize: 14,
    color: '#666',
  },
  activeSearchModeText: {
    color: '#f03a6c',
    fontWeight: '500',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  dateSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  dateSearchText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  clearSearchButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    padding: 5,
  },
  clearSearchText: {
    color: '#f03a6c',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});