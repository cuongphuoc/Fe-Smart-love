import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Gloubal';
import Footer from '@/components/Footer';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { useCallback } from 'react';

type Todo = {
  _id: string;
  task: string;
  date: string;
  deleted: boolean;
};

const TodoByDateScreen = () => {
  const [groupedTodos, setGroupedTodos] = useState<Record<string, Todo[]>>({});

  const fetchTodos = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await axios.get(`${API_URL}/api/todo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const todos: Todo[] = response.data;
      const filteredTodos = todos.filter(todo => !todo.deleted);

      const grouped: Record<string, Todo[]> = {};
      filteredTodos.forEach(todo => {
        const dateKey = moment(todo.date).format('DD-MM-YYYY');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(todo);
      });

      setGroupedTodos(grouped);
    } catch (error: any) {
      console.error('Lỗi lấy dữ liệu todo:', error.message);
    }
  }, []);

  // Use useFocusEffect to call fetchTodos when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTodos();
    }, [fetchTodos])
  );

  const handleDelete = async (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá công việc này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${API_URL}/api/todo/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            fetchTodos();
          } catch (error: any) {
            console.error('Lỗi xoá todo:', error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskText}>✅ {item.task}</Text>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Text style={styles.deleteText}>🗑️ Xoá</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 Completed Todo List</Text>
      {Object.keys(groupedTodos)
        .sort((a, b) => b.localeCompare(a))
        .map(date => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateText}>📅 {date}</Text>
            <FlatList
              data={groupedTodos[date]}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
            />
          </View>
        ))}
      <Footer />
    </View>
  );
};

export default TodoByDateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 20
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  taskItem: {
    marginLeft: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  deleteText: {
    color: 'red',
    fontSize: 14,
    paddingLeft: 10,
  },
});
