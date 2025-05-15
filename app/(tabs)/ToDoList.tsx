import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Platform,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../assets/styles/ToDoListStyle';

// STORAGE KEY
const STORAGE_KEY = '@todo_list_data';

// TYPES
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
}

interface CalendarDayProps {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onSelect: (day: number, month: number, year: number) => void;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onOptionsPress: (task: Task, event: any) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isSelectionMode: boolean;
}

// UTILITY FUNCTIONS
const removeVietnameseAccents = (str: string): string => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = removeVietnameseAccents(str1);
  const s2 = removeVietnameseAccents(str2);
  if (!s1 || !s2) return 0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
};

const editDistance = (s1: string, s2: string): number => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

// MAIN COMPONENT
const TodoListScreen = () => {
  // STATE MANAGEMENT
  // Task List
  const [taskList, setTaskList] = useState<{ date: string; tasks: Task[] }[]>([]);
  
  // Task Modal
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newTask, setNewTask] = useState<Task>({ id: '', title: '', completed: false, dueDate: new Date() });
  
  // Context Menu
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  // Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // DateTime Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Search
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [searchMode, setSearchMode] = useState<'name' | 'date'>('name');
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [showSearchDatePicker, setShowSearchDatePicker] = useState(false);
  
  // Selection Mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // Active Tab
  const [activeTab, setActiveTab] = useState<'alltask' | 'ongoing' | 'done'>('alltask');
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Constants
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const insets = useSafeAreaInsets();

  // Effect: Load data from AsyncStorage
  useEffect(() => {
    loadTasksData();
  }, []);

  // Effect: Save data to AsyncStorage whenever taskList changes
  useEffect(() => {
    saveTasksData();
  }, [taskList]);

  // Function: Load tasks from AsyncStorage
  const loadTasksData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Convert string dates back to Date objects
        const processedData = parsedData.map((section: { date: string; tasks: any[] }) => ({
          ...section,
          tasks: section.tasks.map((task: any) => ({
            ...task,
            dueDate: new Date(task.dueDate)
          }))
        }));
        setTaskList(processedData);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Function: Save tasks to AsyncStorage
  const saveTasksData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // Function: Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedTasks([]);
  };

  // Function: Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Function: Select all tasks
  const selectAllTasks = () => {
    const allTaskIds = taskList.flatMap(section => 
      section.tasks.map(task => task.id)
    );
    setSelectedTasks(allTaskIds);
  };

  // Function: Delete selected tasks
  const deleteSelectedTasks = () => {
    setTaskList(prev => 
      prev.map(section => ({
        ...section,
        tasks: section.tasks.filter(task => !selectedTasks.includes(task.id))
      })).filter(section => section.tasks.length > 0)
    );
    setSelectedTasks([]);
    setIsSelectionMode(false);
  };

  // Hiệu ứng Animated cho modal
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isTaskModalVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isTaskModalVisible]);

  // Function: Perform search
  const performSearch = () => {
    if (!isSearchVisible) {
      setSearchResults([]);
      return;
    }

    const allTasks = taskList.flatMap(section => section.tasks);

    if (searchMode === 'name') {
      if (searchQuery.trim() === '') {
        setSearchResults([]); // Clear results if query is empty
        return;
      }
      const searchText = searchQuery.trim().toLowerCase();
      const normalizedSearchText = removeVietnameseAccents(searchText);

      const matchedTasks = allTasks.filter(task => {
        const taskTitle = task.title.toLowerCase();
        const normalizedTaskTitle = removeVietnameseAccents(taskTitle);

        if (taskTitle.includes(searchText)) return true;
        if (normalizedTaskTitle.includes(normalizedSearchText)) return true;
        if (searchText.length < 15) {
          const similarity = calculateSimilarity(taskTitle, searchText);
          return similarity > 0.6;
        }
        return false;
      });
      setSearchResults(matchedTasks);
    } else if (searchMode === 'date') {
      if (!searchDate) {
        setSearchResults([]); // Clear results if no date is selected
        return;
      }
      const matchedTasks = allTasks.filter(task => 
        task.dueDate.getFullYear() === searchDate.getFullYear() &&
        task.dueDate.getMonth() === searchDate.getMonth() &&
        task.dueDate.getDate() === searchDate.getDate()
      );
      setSearchResults(matchedTasks);
    } else {
      setSearchResults([]);
    }
  };

  // Effect: Perform search when query, date, or mode changes
  useEffect(() => {
    performSearch();
    // Update tab based on search results
    if (searchResults.length > 0) {
      const firstTask = searchResults[0];
      setActiveTab(firstTask.completed ? 'done' : 'ongoing');
    }
  }, [searchQuery, searchDate, searchMode, isSearchVisible, taskList]);

  // Function: Handle search query change
  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    // Search is now triggered by the useEffect above
  };

  // Function: Handle search
  const handleSearch = () => {
    setIsSearchVisible(true);
  };

  // Function: Close search
  const handleCloseSearch = () => {
    setSearchQuery('');
    setSearchDate(null); // Reset searchDate
    setSearchMode('name'); // Reset searchMode to default
    setIsSearchVisible(false);
    // setSearchResults([]); // This will be handled by the useEffect
  };

  // Function to handle date selection for search
  const handleSearchDateConfirm = (selectedDateValue: Date) => {
    setShowSearchDatePicker(false);
    setSearchDate(selectedDateValue);
    setSearchMode('date'); // Switch to date search mode
    // performSearch(); // Search is triggered by useEffect
  };

  // Hàm: Tạo danh sách ngày cho lịch
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, month: month - 1, year, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, month: month + 1, year, isCurrentMonth: false });
    }
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  // Hàm: Định dạng ngày hiển thị
  const formatDate = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = weekdays[date.getDay()];
    return `${weekday}, ${day} ${month} ${year}`;
  };

  // Hàm: Định dạng tháng và năm
  const formatMonthYear = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Hàm: Điều hướng tháng
  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Hàm: Chọn ngày
  const selectDate = (day: number, month: number, year: number) => {
    setSelectedDate(new Date(year, month, day));
    setNewTask((prev) => ({ ...prev, dueDate: new Date(year, month, day) }));
  };

  // Hàm: Thêm/chỉnh sửa task
  const handleSaveTaskData = () => {
    if (!newTask.title) return;
    const taskDate = newTask.dueDate.toISOString().split('T')[0];
    if (isEditMode && selectedTask) {
      setTaskList((prev) =>
        prev.map((section) => ({
          ...section,
          tasks: section.tasks.map((task) =>
            task.id === selectedTask.id ? { ...newTask, id: selectedTask.id } : task
          ),
        }))
      );
    } else {
      const newTaskData: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        completed: false,
        dueDate: newTask.dueDate,
      };
      setTaskList((prev) => {
        const existingSection = prev.find((section) => section.date === taskDate);
        if (existingSection) {
          return prev.map((section) =>
            section.date === taskDate
              ? { ...section, tasks: [...section.tasks, newTaskData] }
              : section
          );
        }
        return [...prev, { date: taskDate, tasks: [newTaskData] }];
      });
    }
    setNewTask({ id: '', title: '', completed: false, dueDate: new Date() });
    setIsTaskModalVisible(false);
    setIsEditMode(false);
  };

  // Hàm: Toggle trạng thái hoàn thành
  const handleToggleTaskComplete = (id: string) => {
    setTaskList((prev) =>
      prev.map((section) => ({
        ...section,
        tasks: section.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        ),
      }))
    );
  };

  // Hàm: Xử lý nhấn nút tùy chọn
  const handleTaskOptionsPress = (task: Task, event: any) => {
    setSelectedTask(task);
    
    // Adjust position based on screen size to prevent menu from going off-screen
    const { pageX, pageY } = event.nativeEvent;
    const windowWidth = Dimensions.get('window').width;
    
    setContextMenuPosition({
      x: pageX,
      y: pageY,
    });
    setIsContextMenuVisible(true);
  };

  // Hàm: Xóa task
  const handleDeleteSingleTask = () => {
    if (!selectedTask) return;
    setTaskList((prev) =>
      prev.map((section) => ({
        ...section,
        tasks: section.tasks.filter((task) => task.id !== selectedTask.id),
      })).filter((section) => section.tasks.length > 0)
    );
    setIsContextMenuVisible(false);
  };

  // Hàm: Xử lý thay đổi ngày/giờ
  const handleDateConfirm = (selected: Date) => {
    setShowDatePicker(false);
    const newDate = new Date(selected);
    setSelectedDate(newDate);
    setNewTask(prev => ({ ...prev, dueDate: newDate }));
  };

  const handleTimeConfirm = (selected: Date) => {
    setShowTimePicker(false);
    const newDate = new Date(newTask.dueDate);
    newDate.setHours(selected.getHours());
    newDate.setMinutes(selected.getMinutes());
    setNewTask(prev => ({ ...prev, dueDate: newDate }));
  };

  // Render lịch
  const renderCalendar = () => {
    const weeks = generateCalendarDays();
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#f03a6c" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthYear}>{formatMonthYear(currentMonth)}</Text>
          <TouchableOpacity onPress={() => navigateMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#f03a6c" />
          </TouchableOpacity>
        </View>
        <View style={styles.daysOfWeekContainer}>
          {daysOfWeek.map((day, index) => (
            <Text key={index} style={styles.dayOfWeek}>{day}</Text>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => (
              <CalendarDay
                key={dayIndex}
                day={day.day}
                month={day.month}
                year={day.year}
                isCurrentMonth={day.isCurrentMonth}
                isSelected={
                  selectedDate.getDate() === day.day &&
                  selectedDate.getMonth() === day.month &&
                  selectedDate.getFullYear() === day.year
                }
                onSelect={selectDate}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top || 10 }]}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To do list</Text>
        <View style={styles.headerButtons}>
          {isSelectionMode ? (
            <>
              <TouchableOpacity style={styles.headerButton} onPress={selectAllTasks}>
                <Ionicons name="checkmark-circle-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={deleteSelectedTasks}>
                <Ionicons name="trash-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={toggleSelectionMode}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.headerButton} onPress={handleSearch}>
                <Ionicons name="search" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={toggleSelectionMode}>
                <Ionicons name="ellipsis-vertical" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Search Bar */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <View style={styles.searchModeContainer}>
            <TouchableOpacity 
              style={[styles.searchModeButton, searchMode === 'name' && styles.activeSearchMode]} 
              onPress={() => setSearchMode('name')}
            >
              <Text style={[styles.searchModeText, searchMode === 'name' && styles.activeSearchModeText]}>Search by name</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.searchModeButton, searchMode === 'date' && styles.activeSearchMode]} 
              onPress={() => setSearchMode('date')}
            >
              <Text style={[styles.searchModeText, searchMode === 'date' && styles.activeSearchModeText]}>Search by date</Text>
            </TouchableOpacity>
          </View>

          {searchMode === 'name' ? (
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#f03a6c" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tasks..."
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                autoFocus={true}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => handleSearchQueryChange('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.dateSearchButton}
              onPress={() => setShowSearchDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color="#f03a6c" />
              <Text style={styles.dateSearchText}>
                {searchDate ? formatDate(searchDate) : 'Select a date'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeSearchButton} onPress={handleCloseSearch}>
            <Text style={styles.closeSearchText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DatePicker for search */}
      <DateTimePickerModal
        isVisible={showSearchDatePicker}
        mode="date"
        onConfirm={handleSearchDateConfirm}
        onCancel={() => setShowSearchDatePicker(false)}
        date={searchDate || new Date()}
        is24Hour={true}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
       <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'alltask' && styles.activeTabButton]} 
          onPress={() => setActiveTab('alltask')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'alltask' && styles.activeTabButtonText]}>All task</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'ongoing' && styles.activeTabButton]} 
          onPress={() => setActiveTab('ongoing')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'ongoing' && styles.activeTabButtonText]}>On going</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'done' && styles.activeTabButton]} 
          onPress={() => setActiveTab('done')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'done' && styles.activeTabButtonText]}>Done</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Search Results Section */}
            {isSearchVisible && searchResults.length > 0 && (
              <View style={styles.taskSectionContainer}>
                <Text style={[styles.taskSectionTitle, { color: '#f03a6c' }]}>
                  {searchMode === 'name' 
                    ? `Search Results for "${searchQuery}" (${searchResults.length})`
                    : `Tasks on ${searchDate ? formatDate(searchDate) : ''} (${searchResults.length})`
                  }
                </Text>
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <SearchResultTaskItem
                      task={item}
                      onToggle={handleToggleTaskComplete}
                      onOptionsPress={handleTaskOptionsPress}
                      isSelected={selectedTasks.includes(item.id)}
                      onSelect={toggleTaskSelection}
                      isSelectionMode={isSelectionMode}
                    />
                  )}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* No Results Message */}
            {isSearchVisible && searchResults.length === 0 && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                {searchMode === 'name' && searchQuery.trim() !== '' && (
                  <Text style={{ fontSize: 16, color: '#666' }}>No tasks found matching "{searchQuery}"</Text>
                )}
                {searchMode === 'date' && searchDate && (
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    No tasks found for {formatDate(searchDate)}
                  </Text>
                )}
                {((searchMode === 'name' && searchQuery.trim() === '') || 
                  (searchMode === 'date' && !searchDate)) && (
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    {searchMode === 'name' ? 'Enter text to search' : 'Select a date to search'}
                  </Text>
                )}
              </View>
            )}

            {/* Regular Task Lists (Only show when not searching or no search query) */}
            {(!isSearchVisible || 
              (searchMode === 'name' && searchQuery.trim() === '') || 
              (searchMode === 'date' && !searchDate)) && (
              <>
                {taskList.length === 0 ? (
                  <Text style={styles.emptyListText}>
                    No tasks yet. Add some!
                  </Text>
                ) : (
                  <>
                    {/* Hiển thị task dựa trên tab đang được chọn */}
                    {activeTab === 'alltask' ? (
                      // Tab "All task"
                      taskList.map((section) => {
                        if (section.tasks.length === 0) return null;
                        
                        return (
                          <View key={`all-${section.date}`} style={styles.taskSectionContainer}>
                            <Text style={styles.taskSectionTitle}>{formatDate(new Date(section.date))}</Text>
                            <FlatList
                              data={section.tasks}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                <TaskItem
                                  task={item}
                                  onToggle={handleToggleTaskComplete}
                                  onOptionsPress={handleTaskOptionsPress}
                                  isSelected={selectedTasks.includes(item.id)}
                                  onSelect={toggleTaskSelection}
                                  isSelectionMode={isSelectionMode}
                                />
                              )}
                              ItemSeparatorComponent={() => <View style={styles.separator} />}
                              scrollEnabled={false}
                            />
                          </View>
                        );
                      })
                    ) : activeTab === 'ongoing' ? (
                      // Tab "On going"
                      taskList.map((section) => {
                        const pendingTasks = section.tasks.filter(task => !task.completed);
                        if (pendingTasks.length === 0) return null;
                        
                        return (
                          <View key={`pending-${section.date}`} style={styles.taskSectionContainer}>
                            <Text style={styles.taskSectionTitle}>{formatDate(new Date(section.date))}</Text>
                            <FlatList
                              data={pendingTasks}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                <TaskItem
                                  task={item}
                                  onToggle={handleToggleTaskComplete}
                                  onOptionsPress={handleTaskOptionsPress}
                                  isSelected={selectedTasks.includes(item.id)}
                                  onSelect={toggleTaskSelection}
                                  isSelectionMode={isSelectionMode}
                                />
                              )}
                              ItemSeparatorComponent={() => <View style={styles.separator} />}
                              scrollEnabled={false}
                            />
                          </View>
                        );
                      })
                    ) : (
                      // Tab "Done"
                      taskList.map((section) => {
                        const completedTasks = section.tasks.filter(task => task.completed);
                        if (completedTasks.length === 0) return null;
                        
                        return (
                          <View key={`completed-${section.date}`} style={[styles.taskSectionContainer, styles.completedTaskSection]}>
                            <Text style={styles.taskSectionTitle}>{formatDate(new Date(section.date))}</Text>
                            <FlatList
                              data={completedTasks}
                              keyExtractor={(item) => item.id}
                              renderItem={({ item }) => (
                                <TaskItem
                                  task={item}
                                  onToggle={handleToggleTaskComplete}
                                  onOptionsPress={handleTaskOptionsPress}
                                  isSelected={selectedTasks.includes(item.id)}
                                  onSelect={toggleTaskSelection}
                                  isSelectionMode={isSelectionMode}
                                />
                              )}
                              ItemSeparatorComponent={() => <View style={styles.separator} />}
                              scrollEnabled={false}
                            />
                          </View>
                        );
                      })
                    )}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() => {
          setNewTask({ id: '', title: '', completed: false, dueDate: new Date() });
          setIsTaskModalVisible(true);
          setIsEditMode(false);
        }}
      >
        <Text style={styles.addTaskButtonText}>+</Text>
      </TouchableOpacity>

      {/* Context Menu Modal */}
      <Modal
        transparent
        visible={isContextMenuVisible}
        animationType="fade"
        onRequestClose={() => setIsContextMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.contextMenuOverlay}
          activeOpacity={1}
          onPress={() => setIsContextMenuVisible(false)}
        >
          <View
            style={[
              styles.contextMenuContainer,
              {
                right: 20,
                top: Math.min(contextMenuPosition.y - 50, Dimensions.get('window').height - 200),
              },
            ]}
          >
            <TouchableOpacity style={styles.contextMenuItem}>
              <Text style={styles.contextMenuItemText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => {
                if (selectedTask) {
                  setNewTask(selectedTask);
                  setIsTaskModalVisible(true);
                  setIsEditMode(true);
                  setIsContextMenuVisible(false);
                }
              }}
            >
              <Text style={styles.contextMenuItemText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={handleDeleteSingleTask}
            >
              <Text style={styles.contextMenuItemText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Task Modal */}
      <Modal
        transparent
        visible={isTaskModalVisible}
        animationType="fade"
        onRequestClose={() => setIsTaskModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{isEditMode ? 'Edit Task' : 'Add New Task'}</Text>
                  <TouchableOpacity onPress={() => setIsTaskModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateTimeContainer}>
                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#f03a6c" />
                    <Text style={styles.dateTimeText}>
                      {formatDate(newTask.dueDate)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color="#f03a6c" />
                    <Text style={styles.dateTimeText}>
                      {newTask.dueDate.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  onConfirm={(date) => {
                    setShowDatePicker(false);
                    if (isTaskModalVisible) {
                      handleDateConfirm(date);
                    }
                  }}
                  onCancel={() => setShowDatePicker(false)}
                  date={newTask.dueDate}
                  is24Hour={true}
                />

                <DateTimePickerModal
                  isVisible={showTimePicker}
                  mode="time"
                  onConfirm={handleTimeConfirm}
                  onCancel={() => setShowTimePicker(false)}
                  date={newTask.dueDate}
                  is24Hour={true}
                />

                <TextInput
                  style={styles.taskInput}
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
                />

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsTaskModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleSaveTaskData}
                  >
                    <Text style={styles.modalButtonText}>{isEditMode ? 'Save' : 'Add'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// Component to display tasks in search results
const SearchResultTaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onOptionsPress, isSelected, onSelect, isSelectionMode }) => {
  const formatFullDate = (date: Date) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  return (
    <View style={styles.taskContainer}>
      {isSelectionMode ? (
        <TouchableOpacity
          style={[styles.taskCheckbox, isSelected && styles.taskCheckboxSelected]}
          onPress={() => onSelect(task.id)}
        >
          {isSelected && <View style={styles.taskCheckboxInner} />}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.taskStatusIndicator}
          onPress={() => onToggle(task.id)}
        >
          <Ionicons 
            name={task.completed ? "checkmark" : "ellipse-outline"} 
            size={18} 
            color={task.completed ? "#4CAF50" : "#f03a6c"} 
          />
        </TouchableOpacity>
      )}
      <View style={styles.taskTextContainer}>
        <Text style={[
          styles.taskDescription,
          task.completed && styles.completedTaskText
        ]}>
          {task.title}
        </Text>
        
        <View style={styles.taskDateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={styles.taskDateText}>
            {formatFullDate(task.dueDate)}
          </Text>
        </View>
        
        <View style={styles.taskTimeContainer}>
          <Ionicons name="time-outline" size={14} color="#888" />
          <Text style={styles.taskTimeText}>
            {task.dueDate.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </Text>
        </View>
      </View>
      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.taskOptionsButton}
          onPress={(e) => onOptionsPress(task, e)}
        >
          <Text style={styles.taskOptionsIcon}>...</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// COMPONENTS
const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  month,
  year,
  isCurrentMonth,
  isSelected,
  onSelect,
}) => (
  <TouchableOpacity
    style={[
      styles.calendarDayContainer,
      isSelected && styles.selectedDay,
      !isCurrentMonth && styles.otherMonthDay,
    ]}
    onPress={() => onSelect(day, month, year)}
  >
    <Text
      style={[
        styles.calendarDayLabel,
        isSelected && styles.selectedDayText,
        !isCurrentMonth && styles.otherMonthDayText,
      ]}
    >
      {day}
    </Text>
  </TouchableOpacity>
);

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onOptionsPress, isSelected, onSelect, isSelectionMode }) => (
  <View style={styles.taskContainer}>
    {isSelectionMode ? (
      <TouchableOpacity
        style={[styles.taskCheckbox, isSelected && styles.taskCheckboxSelected]}
        onPress={() => onSelect(task.id)}
      >
        {isSelected && <View style={styles.taskCheckboxInner} />}
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.taskStatusIndicator}
        onPress={() => onToggle(task.id)}
      >
        <Ionicons 
          name={task.completed ? "checkmark" : "ellipse-outline"} 
          size={18} 
          color={task.completed ? "#4CAF50" : "#f03a6c"} 
        />
      </TouchableOpacity>
    )}
    <View style={styles.taskTextContainer}>
      <Text style={[
        styles.taskDescription,
        task.completed && styles.completedTaskText
      ]}>
        {task.title}
      </Text>
      <View style={styles.taskTimeContainer}>
        <Ionicons name="time-outline" size={14} color="#888" />
        <Text style={styles.taskTimeText}>
          {task.dueDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </Text>
      </View>
    </View>
    {!isSelectionMode && (
      <TouchableOpacity
        style={styles.taskOptionsButton}
        onPress={(e) => onOptionsPress(task, e)}
      >
        <Text style={styles.taskOptionsIcon}>...</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default TodoListScreen;