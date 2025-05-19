import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FloatingButton from '@/components/expense/FloatingButton';
import { ExpenseStackParamList } from '@/components/expense/ExpenseStack';
import { API_URL } from '../../constants/Gloubal';
import Footer from '@/components/Footer';
type NavigationProp = StackNavigationProp<ExpenseStackParamList, 'ExpenseScreen'>;

type ExpenseItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  type: 'income' | 'expense';
};

type ExpenseDayGroup = {
  date: string;
  total: string;
  items: ExpenseItem[];
};

const ExpenseTransaction = () => {
  const navigation = useNavigation<NavigationProp>();
  const [monthIndex, setMonthIndex] = useState(0);
  const [dataByMonth, setDataByMonth] = useState<{ [key: string]: ExpenseDayGroup[] }>({});

  const months: string[] = [];
  const monthKeys: string[] = [];

  for (let y = 2000; y <= 2050; y++) {
    for (let m = 0; m < 12; m++) {
      const date = new Date(y, m);
      months.push(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
      monthKeys.push(`${y}-${String(m + 1).padStart(2, '0')}`);
    }
  }

  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentIndex = monthKeys.findIndex(k => k === currentMonthKey);

  useEffect(() => {
    if (currentIndex >= 0) setMonthIndex(currentIndex);
  }, [currentIndex]);

  const fetchExpenses = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      const grouped: { [key: string]: ExpenseDayGroup[] } = {};

      data.forEach((item: any) => {
        const date = new Date(item.date);
        const monthKey = item.date.slice(0, 7);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit' });
        const money = Number(item.money);
        const formattedAmount = money.toLocaleString('vi-VN') + ' đ';

        const expense: ExpenseItem = {
          id: item._id,
          title: item.description || 'No title',
          category: item.kind || 'Uncategorized',
          amount: formattedAmount,
          type: item.isexpense ? 'expense' : 'income',
        };

        if (!grouped[monthKey]) grouped[monthKey] = [];

        const dayGroup = grouped[monthKey].find(g => g.date === dayLabel);

        if (dayGroup) {
          dayGroup.items.push(expense);
          const total = dayGroup.items.reduce((sum, e) => {
            const amount = Number(e.amount.replace(/\D/g, ''));
            return e.type === 'income' ? sum + amount : sum - amount;
          }, 0);
          dayGroup.total = total.toLocaleString('vi-VN') + ' đ';
        } else {
          const total = item.isexpense ? -money : money;
          grouped[monthKey].push({
            date: dayLabel,
            total: total.toLocaleString('vi-VN') + ' đ',
            items: [expense],
          });
        }
      });

      setDataByMonth(grouped);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useFocusEffect(useCallback(() => {
    fetchExpenses();
  }, [fetchExpenses]));

  const changeMonth = (dir: 'prev' | 'next') => {
    setMonthIndex(prev =>
      dir === 'prev' && prev > 0 ? prev - 1 :
      dir === 'next' && prev < monthKeys.length - 1 ? prev + 1 :
      prev
    );
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/expenses/${id}`, { method: 'DELETE', headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      } });
      if (res.ok) fetchExpenses();
      else console.error('Delete failed');
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('ExpenseScreen')}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction</Text>
        </View>
        <Ionicons name="search" size={26} color="white" />
      </View>

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => changeMonth('prev')}>
            <Ionicons name="chevron-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{months[monthIndex]}</Text>
          <TouchableOpacity onPress={() => changeMonth('next')}>
            <Ionicons name="chevron-forward" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dataByMonth[monthKeys[monthIndex]] || []}
          keyExtractor={(item, idx) => `${item.date}-${idx}`}
          renderItem={({ item }) => (
            <View style={styles.daySection}>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{item.date}</Text>
                <Text style={styles.totalText}>{item.total}</Text>
              </View>
              {item.items.map((e, i) => (
                <View key={i} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.title}>{e.title}</Text>
                    <Text style={styles.category}>{e.category}</Text>
                  </View>
                  <Text style={[styles.amount, e.type === 'income' ? styles.income : styles.expense]}>
                    {e.amount}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(e.id)}>
                    <Ionicons name="trash-bin" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />

        <FloatingButton onPress={() => navigation.navigate('AddExpense')} />
      </View>
      <Footer/>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EE1D52',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Poppins',
    marginLeft: 8,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  daySection: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    alignItems: 'center',
    elevation: 1,
    justifyContent: 'space-between',
  },
  itemContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  category: {
    fontSize: 12,
    color: '#888',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  income: {
    color: 'green',
  },
  expense: {
    color: '#f43f5e',
  },
});

export default ExpenseTransaction;
