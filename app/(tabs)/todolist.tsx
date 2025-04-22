import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  SafeAreaView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { TextInput } from 'react-native';

export default function TodoListScreen() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Calendar days
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentMonth = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  
// Group tasks by date
const [tasksByDate, setTasksByDate] = useState<Record<'Today' | 'Tomorrow', { id: string; text: string; completed: boolean }[]>>({
  'Today': [
    { id: '1', text: 'Buy groceries', completed: false },
    { id: '2', text: 'Buy groceries', completed: false },
    { id: '3', text: 'Buy groceries', completed: false },
  ],
  'Tomorrow': [
    { id: '4', text: 'Buy groceries', completed: false },
    { id: '5', text: 'Buy groceries', completed: false },
    { id: '6', text: 'Buy groceries', completed: false },
  ]
});

// Task actions menu
const [actionsVisible, setActionsVisible] = useState(false);
const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

// Task actions menu position
const [actionsPosition, setActionsPosition] = useState({ top: 0 });

// Delete confirmation modal state
const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
const [taskToDelete, setTaskToDelete] = useState<{ id: string; text: string } | null>(null);

// Time picker state
const [timePickerVisible, setTimePickerVisible] = useState(false);
const [selectedHour, setSelectedHour] = useState("06");
const [selectedMinute, setSelectedMinute] = useState("28");
const [selectedSecond, setSelectedSecond] = useState("55");
const [isPM, setIsPM] = useState(true);

// Add Task modal state variables
const [newTaskText, setNewTaskText] = useState("");
const [activeTab, setActiveTab] = useState<"CALENDAR" | "TIME">("CALENDAR");
const [selectedDay, setSelectedDay] = useState(new Date());
  
  // Render task groups by date
  const renderTaskGroup = () => {
    return (Object.keys(tasksByDate) as Array<'Today' | 'Tomorrow'>).map((dateKey) => (
      <View key={dateKey} style={styles.dateSection}>
        <Text style={styles.dateHeader}>
          {dateKey === 'Today' 
            ? `May 25 - Today - Thursday` 
            : `May 26 - Tomorrow - Friday`}
        </Text>
        
        {tasksByDate[dateKey].map(task => (
          <View key={task.id} style={styles.taskRow}>
            <TouchableOpacity style={styles.checkbox}>
              <View style={styles.uncheckedBox} />
            </TouchableOpacity>
            <Text style={styles.taskText}>{task.text}</Text>
            <TouchableOpacity 
              style={styles.moreButton}
              onPress={(event) => {
                // Get the position of the tapped button
                const { pageY } = event.nativeEvent;
    
                setActiveTaskId(task.id);
                // Set the vertical position for the actions menu
                setActionsPosition({ top: pageY - 60 }); // Adjust the offset as needed
                setActionsVisible(true);
              }}>
              <Text style={styles.moreButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    ));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>⟨</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To do list</Text>
        <TouchableOpacity>
          <FontAwesome name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>May 2025</Text>
          <Text style={styles.todayText}>Today</Text>
        </View>
        
        <View style={styles.calendarGrid}>
          {weekDays.map((day, index) => (
            <Text key={`weekday-${index}`} style={styles.weekdayLabel}>{day}</Text>
          ))}
          {[21, 22, 23, 24, 25, 26, 27].map((day) => (
            <TouchableOpacity 
              key={`day-${day}`} 
              style={[
                styles.dayButton,
                day === 25 && styles.activeDay
              ]}
            >
              <Text style={[styles.dayText, day === 25 && styles.activeDayText]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.taskList}>
        {renderTaskGroup()}
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
  style={styles.actionItem} 
  onPress={() => {
    // Find the task we want to delete
    const task = tasksByDate.Today.find(t => t.id === activeTaskId) || 
              tasksByDate.Tomorrow.find(t => t.id === activeTaskId);
    
    // If we found the task, prepare for deletion
    if (task) {
      setTaskToDelete(task);
      setDeleteConfirmVisible(true);
      setActionsVisible(false); // Hide the actions menu when showing confirmation
    }
  }}
>
  <Text style={styles.actionText}>Delete</Text>
</TouchableOpacity>
      
      {/* Task actions modal */}
      {actionsVisible && (
  <View style={[styles.actionsMenu, { top: actionsPosition.top }]}>
    <TouchableOpacity style={styles.actionItem}>
      <Text style={styles.actionText}>Share</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionItem}>
      <Text style={styles.actionText}>Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.actionItem} 
      onPress={() => {
        // Find the task we want to delete
        const task = tasksByDate.Today.find(t => t.id === activeTaskId) || 
                  tasksByDate.Tomorrow.find(t => t.id === activeTaskId);
        
        // If we found the task, prepare for deletion
        if (task) {
          setTaskToDelete(task);
          setDeleteConfirmVisible(true);
          setActionsVisible(false); // Hide the actions menu when showing confirmation
        }
      }}
    >
      <Text style={styles.actionText}>Delete</Text>
    </TouchableOpacity>
  </View>
)}
      
      {/* Add Task Modal */}
      <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TextInput
            style={styles.taskInput}
            placeholder="Add task..."
            placeholderTextColor="#999"
            value={newTaskText}
            onChangeText={setNewTaskText}
          />

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === "CALENDAR" ? styles.activeTab : {}]} 
              onPress={() => setActiveTab("CALENDAR")}
            >
              <Text style={[styles.tabText, activeTab === "CALENDAR" ? styles.activeTabText : {}]}>CALENDAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === "TIME" ? styles.activeTab : {}]}
              onPress={() => setActiveTab("TIME")}
            >
              <Text style={[styles.tabText, activeTab === "TIME" ? styles.activeTabText : {}]}>TIME</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Date Header */}
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedYear}>2021</Text>
            <Text style={styles.selectedDate}>Wed, June 6</Text>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity>
              <Text style={styles.monthNavButton}>◄</Text>
            </TouchableOpacity>
            <Text style={styles.currentMonth}>June 2021</Text>
            <TouchableOpacity>
              <Text style={styles.monthNavButton}>►</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.modalCalendarGrid}>
            {/* Days of Week */}
            <View style={styles.daysOfWeek}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.dayOfWeekText}>{day}</Text>
              ))}
            </View>

            {/* Calendar Days */}
            <View style={styles.calendarDays}>
              {Array.from({ length: 35 }, (_, i) => {
                const dayNum = i - 2; // Adjust for starting day offset
                return (
                  <TouchableOpacity 
                    key={i}
                    style={[
                      styles.calendarDay, 
                      dayNum === 6 && styles.selectedCalendarDay
                    ]}
                    disabled={dayNum < 1 || dayNum > 30}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      dayNum < 1 || dayNum > 30 ? styles.disabledDayText : {},
                      dayNum === 6 && styles.selectedCalendarDayText
                    ]}>
                      {dayNum >= 1 && dayNum <= 30 ? dayNum : 
                       dayNum < 1 ? 30 + dayNum : dayNum - 30}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Time Selector */}
          <View style={styles.timeSelector}>
            <TouchableOpacity style={styles.addTimeButton} onPress={() => setTimePickerVisible(true)}>
              <View style={styles.clockIcon}>
                <Text style={styles.clockIconText}>⏰</Text>
              </View>
              <Text style={styles.addTimeText}>Add time</Text>
            </TouchableOpacity>
          </View>
              
          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {
              // Add task logic here
              setModalVisible(false);
              setNewTaskText("");
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
      ){'}'}
          {/* Time Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timePickerVisible}
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModalContent}>
            <Text style={styles.timePickerModalTitle}>Set time</Text>
      
            {/* Time Selector Rows */}
            <View style={styles.timePickerContent}>
              {/* Hour Picker */}
              <View style={styles.timePickerColumn}>
                <TouchableOpacity onPress={() => {
                  const newHour = parseInt(selectedHour) === 12 ? "01" : 
                    (parseInt(selectedHour) + 1).toString().padStart(2, "0");
                  setSelectedHour(newHour);
                }}>
                  <Text style={styles.timePickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeUnitText}>{selectedHour}</Text>
                <TouchableOpacity onPress={() => {
                  const newHour = parseInt(selectedHour) === 1 ? "12" : 
                    (parseInt(selectedHour) - 1).toString().padStart(2, "0");
                  setSelectedHour(newHour);
                }}>
                  <Text style={styles.timePickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
      
              {/* Minute Picker */}
              <View style={styles.timePickerColumn}>
                <TouchableOpacity onPress={() => {
                  const newMinute = parseInt(selectedMinute) === 59 ? "00" : 
                    (parseInt(selectedMinute) + 1).toString().padStart(2, "0");
                  setSelectedMinute(newMinute);
                }}>
                  <Text style={styles.timePickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeUnitText}>{selectedMinute}</Text>
                <TouchableOpacity onPress={() => {
                  const newMinute = parseInt(selectedMinute) === 0 ? "59" : 
                    (parseInt(selectedMinute) - 1).toString().padStart(2, "0");
                  setSelectedMinute(newMinute);
                }}>
                  <Text style={styles.timePickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
      
              {/* Second Picker */}
              <View style={styles.timePickerColumn}>
                <TouchableOpacity onPress={() => {
                  const newSecond = parseInt(selectedSecond) === 59 ? "00" : 
                    (parseInt(selectedSecond) + 1).toString().padStart(2, "0");
                  setSelectedSecond(newSecond);
                }}>
                  <Text style={styles.timePickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeUnitText}>{selectedSecond}</Text>
                <TouchableOpacity onPress={() => {
                  const newSecond = parseInt(selectedSecond) === 0 ? "59" : 
                    (parseInt(selectedSecond) - 1).toString().padStart(2, "0");
                  setSelectedSecond(newSecond);
                }}>
                  <Text style={styles.timePickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
      
              {/* AM/PM Picker */}
              <View style={styles.timePickerColumn}>
                <TouchableOpacity onPress={() => setIsPM(!isPM)}>
                  <Text style={styles.timePickerArrow}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.timeUnitText}>{isPM ? "PM" : "AM"}</Text>
                <TouchableOpacity onPress={() => setIsPM(!isPM)}>
                  <Text style={styles.timePickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
      
            {/* Selected Time Display */}
            <View style={styles.selectedTimeDisplay}>
              <Text style={styles.selectedTimeText}>
                {selectedHour} : {selectedMinute} : {selectedSecond}
                <Text style={styles.amPmText}>  {isPM ? "PM" : "AM"}</Text>
              </Text>
            </View>
      
            {/* AM/PM Option */}
            <View style={styles.amPmContainer}>
              <Text style={[styles.timeUnitText, styles.disabledTimeText]}>{selectedHour}</Text>
              <Text style={styles.timeUnitSeparator}>:</Text>
              <Text style={[styles.timeUnitText, styles.disabledTimeText]}>{selectedMinute}</Text>
              <Text style={styles.timeUnitSeparator}>:</Text>
              <Text style={[styles.timeUnitText, styles.disabledTimeText]}>{selectedSecond}</Text>
              <Text style={[styles.amPmOption, styles.disabledTimeText]}>{!isPM ? "AM" : "PM"}</Text>
            </View>
      
            {/* Save Button */}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                // Close the modal and store the time
                setTimePickerVisible(false);
                // You could store the formatted time in a state variable here
                // const formattedTime = `${selectedHour}:${selectedMinute}:${selectedSecond} ${isPM ? 'PM' : 'AM'}`;
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
          {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmVisible}
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete task ?</Text>
            <Text style={styles.deleteModalMessage}>
              This will permanently delete "{taskToDelete?.text}" and can't be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={styles.deleteModalButton} 
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.deleteModalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.deleteModalButton, styles.deleteModalConfirmButton]} 
                onPress={() => {
                  // Delete the task
                  if (taskToDelete) {
                    // Filter out the task from both Today and Tomorrow lists
                    const newTasksByDate = {
                      Today: tasksByDate.Today.filter(task => task.id !== taskToDelete.id),
                      Tomorrow: tasksByDate.Tomorrow.filter(task => task.id !== taskToDelete.id)
                    };
                    
                    // Update the state
                    setTasksByDate(newTasksByDate);
                    setTaskToDelete(null);
                    setDeleteConfirmVisible(false);
                  }
                }}
              >
                <Text style={styles.deleteModalConfirmText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>  
      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
  },
  todayText: {
    fontSize: 16,
    color: '#EF4444',
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    flexWrap: 'wrap',
  },
  weekdayLabel: {
    width: '14%',
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  dayButton: {
    width: '14%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeDay: {
    borderBottomWidth: 2,
    borderBottomColor: '#EF4444',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  activeDayText: {
    color: '#EF4444',
  },
  taskList: {
    flex: 1,
    paddingTop: 10,
  },
  dateSection: {
    marginBottom: 15,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  checkbox: {
    marginRight: 15,
  },
  uncheckedBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  moreButton: {
    padding: 5,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#777',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#EF4444',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 30,
    color: 'white',
  },
  actionsMenu: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15, // More rounded corners for better appearance
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    overflow: 'hidden', // This ensures the rounded corners work properly
  },
  actionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#EF4444',
  },
  
  // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 0,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    timePickerContent: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 15,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    taskInput: {
      padding: 15,
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    tabContainer: {
      flexDirection: 'row',
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: '#F8C4C4',
    },
    activeTab: {
      backgroundColor: '#EF4444',
    },
    tabText: {
      color: '#666',
      fontWeight: '600',
    },
    activeTabText: {
      color: 'white',
    },
    selectedDateContainer: {
      backgroundColor: '#EF4444',
      padding: 15,
    },
    selectedYear: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 12,
    },
    selectedDate: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    monthNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#f7f7f7',
    },
    monthNavButton: {
      color: '#EF4444',
      fontSize: 16,
      fontWeight: '500',
    },
    currentMonth: {
      fontSize: 16,
    },
    daysOfWeek: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
    },
    dayOfWeekText: {
      color: '#EF4444',
      fontSize: 14,
      width: 30,
      textAlign: 'center',
    },
    modalCalendarGrid: {
      paddingHorizontal: 10,
    },
    calendarDays: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    calendarDay: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 5,
    },
    calendarDayText: {
      fontSize: 14,
      color: '#333',
    },
    disabledDayText: {
      color: '#ccc',
    },
    selectedCalendarDay: {
      backgroundColor: '#ccc',
      borderRadius: 15,
    },
    selectedCalendarDayText: {
      fontWeight: '500',
    },
    timeSelector: {
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    addTimeButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    clockIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    clockIconText: {
      color: '#EF4444',
      fontSize: 16,
    },
    addTimeText: {
      color: '#EF4444',
      fontSize: 14,
    },
    saveButton: {
      backgroundColor: '#EF4444',
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 15,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    timePickerTitle: {
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 15,
    },
    timePickerColumn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      width: '25%',
    },
    timeUnitText: {
      fontSize: 18,
      fontWeight: '500',
      marginVertical: 10,
    },
    timePickerArrow: {
      fontSize: 18,
      color: '#EF4444',
    },
    selectedTimeDisplay: {
      marginVertical: 15,
      alignItems: 'center',
    },
    selectedTimeText: {
      fontSize: 18,
      fontWeight: '500',
    },
    amPmText: {
      color: '#EF4444',
    },
    amPmContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 10,
    },
    timeUnitSeparator: {
      fontSize: 18,
      marginHorizontal: 5,
    },
    disabledTimeText: {
      color: '#ccc',
    },
    amPmOption: {
      fontSize: 18,
      marginLeft: 10,
    },
    // Time Picker Modal styles
    timePickerModalContent: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    timePickerModalTitle: {
      fontSize: 24,
      fontWeight: '500',
      marginBottom: 40,
    },
    timePickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '80%',
      marginBottom: 30,
    // timePickerColumn defined above
    },
        // Delete confirmation modal styles
    deleteModalContent: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    deleteModalTitle: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 15,
    },
    deleteModalMessage: {
      fontSize: 14,
      textAlign: 'center',
      color: '#555',
      marginBottom: 20,
    },
    deleteModalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    deleteModalButton: {
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 5,
      alignItems: 'center',
    },
    deleteModalButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#555',
    },
    deleteModalConfirmButton: {
      backgroundColor: '#fff',  // White background for the confirm button
    },
    deleteModalConfirmText: {
      color: '#EF4444',  // Red text for the confirm button
      fontSize: 16,
      fontWeight: '500',
    },
  // END: New Modal Styles
  });
 // END: New Modal Styles