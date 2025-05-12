import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../../assets/styles/ToDoListStyle';

// Define types
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
}

// Component: Hiển thị một ngày trong lịch
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

// Component: Hiển thị một task trong danh sách
const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onOptionsPress }) => (
  <View style={styles.taskContainer}>
    <TouchableOpacity
      style={[
        styles.taskCheckbox,
        task.completed && styles.taskCheckboxCompleted,
      ]}
      onPress={() => onToggle(task.id)}
    >
      <View style={styles.taskCheckboxInner} />
    </TouchableOpacity>
    <Text style={styles.taskDescription}>{task.title}</Text>
    <TouchableOpacity
      style={styles.taskOptionsButton}
      onPress={(e) => onOptionsPress(task, e)}
    >
      <Text style={styles.taskOptionsIcon}>...</Text>
    </TouchableOpacity>
  </View>
);

// Hàm: Chuyển đổi chuỗi tiếng Việt thành không dấu
const removeVietnameseAccents = (str: string): string => {
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
};

// Hàm: Tính độ tương đồng giữa hai chuỗi
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = removeVietnameseAccents(str1);
  const s2 = removeVietnameseAccents(str2);
  
  // Nếu một trong hai chuỗi rỗng
  if (!s1 || !s2) return 0;
  
  // Nếu chuỗi này chứa chuỗi kia
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Tính độ tương đồng dựa trên độ dài chuỗi chung
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  return (longer.length - editDistance(longer, shorter)) / longer.length;
};

// Hàm: Tính khoảng cách Levenshtein
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

const TodoListScreen = () => {
  // State: Danh sách task
  const [taskList, setTaskList] = useState<{ date: string; tasks: Task[] }[]>([
    {
      date: '2025-05-25',
      tasks: [
        { id: '1', title: 'Buy groceries', completed: false, dueDate: new Date('2025-05-25') },
        { id: '2', title: 'Pay gas bills', completed: false, dueDate: new Date('2025-05-25') },
      ],
    },
  ]);
  // State: Modal thêm/chỉnh sửa task
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newTask, setNewTask] = useState<Task>({ id: '', title: '', completed: false, dueDate: new Date() });
  // State: Context menu
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  // State: Lịch
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  // State: DateTimePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Animated: Hiệu ứng cho modal
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // State: Search
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [searchMode, setSearchMode] = useState<'name' | 'date'>('name');
  const [filteredTaskList, setFilteredTaskList] = useState<{ date: string; tasks: Task[] }[]>([]);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Hiệu ứng Animated cho modal
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isTaskModalVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isTaskModalVisible]);

  // Effect: Filter tasks when search query or date changes
  useEffect(() => {
    if (!isSearchVisible) {
      setFilteredTaskList(taskList);
      return;
    }

    if (searchMode === 'name' && searchQuery.trim() === '') {
      setFilteredTaskList(taskList);
      return;
    }

    if (searchMode === 'date' && !searchDate) {
      setFilteredTaskList(taskList);
      return;
    }

    const filtered = taskList.map(section => {
      const filteredTasks = section.tasks.filter(task => {
        if (searchMode === 'name') {
          const taskTitle = task.title;
          const searchText = searchQuery.trim();
          
          // Tìm chính xác
          if (taskTitle.toLowerCase() === searchText.toLowerCase()) {
            return true;
          }
          
          // Tìm không dấu
          if (removeVietnameseAccents(taskTitle).includes(removeVietnameseAccents(searchText))) {
            return true;
          }
          
          // Tìm gần đúng (độ tương đồng > 0.6)
          const similarity = calculateSimilarity(taskTitle, searchText);
          return similarity > 0.6;
        } else {
          return task.dueDate.toDateString() === searchDate?.toDateString();
        }
      });

      if (filteredTasks.length === 0) return null;
      return { ...section, tasks: filteredTasks };
    }).filter(Boolean) as { date: string; tasks: Task[] }[];

    setFilteredTaskList(filtered);
  }, [searchQuery, searchDate, searchMode, isSearchVisible, taskList]);

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
    return `${month} ${day} - ${weekday}`;
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
  const handleSaveTask = () => {
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
  const handleToggleTask = (id: string) => {
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
    setContextMenuPosition({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
    setIsContextMenuVisible(true);
  };

  // Hàm: Xóa task
  const handleDeleteTask = () => {
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
  const handleDateTimeChange = (event: any, selected: Date | undefined, type: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }

    if (!selected) return;

    if (type === 'date') {
      const newDate = new Date(selected);
      setSelectedDate(newDate);
      setNewTask(prev => ({ ...prev, dueDate: newDate }));
    } else {
      const newDate = new Date(newTask.dueDate);
      newDate.setHours(selected.getHours());
      newDate.setMinutes(selected.getMinutes());
      setNewTask(prev => ({ ...prev, dueDate: newDate }));
    }
  };

  // Function: Handle search
  const handleSearch = () => {
    setIsSearchVisible(true);
  };

  // Function: Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchDate(null);
    setIsSearchVisible(false);
    setFilteredTaskList(taskList);
  };

  // Function: Handle date search
  const handleDateSearch = (date: Date) => {
    setSearchDate(date);
    setSearchMode('date');
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
      <StatusBar barStyle="light-content" backgroundColor="#f03a6c" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To-Do List</Text>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <View style={styles.searchModeContainer}>
            <TouchableOpacity
              style={[styles.searchModeButton, searchMode === 'name' && styles.activeSearchMode]}
              onPress={() => setSearchMode('name')}
            >
              <Text style={[styles.searchModeText, searchMode === 'name' && styles.activeSearchModeText]}>
                Search by Name
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.searchModeButton, searchMode === 'date' && styles.activeSearchMode]}
              onPress={() => setSearchMode('date')}
            >
              <Text style={[styles.searchModeText, searchMode === 'date' && styles.activeSearchModeText]}>
                Search by Date
              </Text>
            </TouchableOpacity>
          </View>

          {searchMode === 'name' ? (
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#f03a6c" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tasks..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dateSearchButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#f03a6c" />
              <Text style={styles.dateSearchText}>
                {searchDate
                  ? searchDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : 'Select date to search'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.contentContainer}>
        {/* Task Sections */}
        {filteredTaskList.length === 0 && (
          <Text style={styles.emptyListText}>
            {isSearchVisible ? 'No tasks found' : 'No tasks yet. Add some!'}
          </Text>
        )}
        {filteredTaskList.map((section) => (
          <View key={section.date} style={styles.taskSectionContainer}>
            <Text style={styles.taskSectionTitle}>{formatDate(new Date(section.date))}</Text>
            <FlatList
              data={section.tasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TaskItem
                  task={item}
                  onToggle={handleToggleTask}
                  onOptionsPress={handleTaskOptionsPress}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              scrollEnabled={false}
            />
          </View>
        ))}
      </ScrollView>

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
              { right: 20, top: contextMenuPosition.y - 100 },
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
              onPress={handleDeleteTask}
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
                  {newTask.dueDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
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

            {showDatePicker && (
              <DateTimePicker
                value={newTask.dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => handleDateTimeChange(e, d, 'date')}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={newTask.dueDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => handleDateTimeChange(e, d, 'time')}
              />
            )}

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
                onPress={handleSaveTask}
              >
                <Text style={styles.modalButtonText}>{isEditMode ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

export default TodoListScreen;