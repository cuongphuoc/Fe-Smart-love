import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { API_URL } from '../../constants/Gloubal';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import FloatingButton from '@/components/expense/FloatingButton';
import { ExpenseStackParamList } from '@/components/expense/ExpenseStack';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/Footer';
type ExpenseScreenNavigationProp = StackNavigationProp<ExpenseStackParamList, 'ExpenseScreen'>;

const screenWidth = Dimensions.get('window').width;

interface Expense {
  _id: string;
  description: string;
  money: number;
  kind: string;
  isexpense: boolean;
  deleted: boolean;
  date: string;
}

const colorPalette = ['#EE1D52', '#FBB03B', '#5BC0BE', '#6A0572', '#3B9C9C', '#FF8C42', '#9C27B0'];

const ExpenseScreen = () => {
  const navigation = useNavigation<ExpenseScreenNavigationProp>();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [showFilter, setShowFilter] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);

  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        console.log('No access token found.');
        // Handle the case where there is no token, e.g., navigate to login
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
  };

  const fetchExpenses = useCallback(async (selectedMonth: number, selectedYear: number) => {
    try {
      setLoading(true);
      if (!token) {
        await getToken();
        if (!token) {
          return; // Stop fetching if no token is available
        }
      }
      const response = await axios.get(
        `${API_URL}/api/expenses?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFilteredExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Handle specific error cases, e.g., unauthorized
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    getToken(); // Get the token when the component mounts
  }, []);

  // Tự động fetch lại dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchExpenses(month, year);
      }
    }, [month, year, fetchExpenses, token])
  );

  useEffect(() => {
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      const dateFiltered = filteredExpenses.filter((expense) => expense.date.startsWith(isoDate));
      setFilteredExpenses(dateFiltered);
    }
  }, [selectedDate, filteredExpenses]);

  const totalAmount = filteredExpenses.reduce(
    (sum, item) => sum + (item.isexpense ? -item.money : item.money),
    0
  );

  const grouped = filteredExpenses.reduce((acc, item) => {
    const key = item.kind;
    if (!acc[key]) {
      acc[key] = { money: 0, kind: item.kind };
    }
    acc[key].money += item.money * (item.isexpense ? -1 : 1);
    return acc;
  }, {} as Record<string, { money: number; kind: string }>);

  const groupedArray = Object.values(grouped);

  const pieChartData = groupedArray.map((item, index) => ({
    name: item.kind,
    population: Math.abs(item.money),
    color: colorPalette[index % colorPalette.length],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderHeader = () => (
    <>
      {/* Total Amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{totalAmount.toLocaleString()} đ</Text>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <View style={styles.chartContainer}>
          <PieChart
            data={pieChartData}
            width={screenWidth - 64}
            height={250}
            chartConfig={{
              color: () => 'black',
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="75"
            hasLegend={false}
          />
        </View>
        <Text style={styles.monthText}>
          {selectedDate ? selectedDate.toLocaleDateString() : `${month}/${year}`}
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {pieChartData.map((item) => (
          <View style={styles.legendItem} key={item.name}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.name}</Text>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expense</Text>
        </View>
        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <Ionicons name="filter" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EE1D52" />
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const colorIndex = groupedArray.findIndex((g) => g.kind === item.kind);
            const color = colorPalette[colorIndex % colorPalette.length];

            return (
              <View style={styles.accountItem}>
                <View style={styles.accountLeft}>
                  <View style={[styles.colorBar, { backgroundColor: color }]} />
                  <View>
                    <Text style={styles.accountName}>{item.description}</Text>
                    <Text style={styles.accountCategory}>{item.kind}</Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={styles.accountAmount}>
                    {(item.isexpense ? '-' : '+') + item.money.toLocaleString()} đ
                  </Text>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() => (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: 'gray', fontFamily: 'Poppins', fontSize: 16 }}>
                No expenses for the selected month/year{selectedDate ? ' and date' : ''}.
              </Text>
            </View>
          )}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter Expenses</Text>

            <TouchableOpacity style={styles.filterOption} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.filterOptionText}>Select Date</Text>
              {selectedDate && (
                <Text style={styles.selectedDateText}>{selectedDate.toLocaleDateString()}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={month}
                onValueChange={(itemValue) => setMonth(itemValue)}
                style={styles.picker}
              >
                {[...Array(12)].map((_, index) => (
                  <Picker.Item key={index} label={`${index + 1}`} value={index + 1} />
                ))}
              </Picker>
              <Picker
                selectedValue={year}
                onValueChange={(itemValue) => setYear(itemValue)}
                style={styles.picker}
              >
                {Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - 2 + index).map(
                  (yr) => (
                    <Picker.Item key={yr} label={`${yr}`} value={yr} />
                  )
                )}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setSelectedDate(undefined);
                fetchExpenses(month, year);
                setShowFilter(false);
              }}
            >
              <Text style={styles.applyButtonText}>Apply Month/Year</Text>
            </TouchableOpacity>

            {selectedDate && (
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  const isoDate = selectedDate.toISOString().split('T')[0];
                  const dateFiltered = filteredExpenses.filter((expense) =>
                    expense.date.startsWith(isoDate)
                  );
                  setFilteredExpenses(dateFiltered);
                  setShowDatePicker(false);
                  setShowFilter(false);
                }}
              >
                <Text style={styles.applyButtonText}>Apply Selected Date</Text>
              </TouchableOpacity>
            )}

            {selectedDate && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => {
                  setSelectedDate(undefined);
                  fetchExpenses(month, year);
                  setShowFilter(false);
                }}
              >
                <Text style={styles.clearFilterButtonText}>Clear Date Filter</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFilter(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Floating Action Button */}
      <FloatingButton onPress={() => navigation.navigate('AddExpense')} />
        <Footer/>
    </View>
  );
};

export default ExpenseScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EE1D52',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Poppins',
    marginLeft: 8,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    textAlign: 'center',
    color: 'gray',
    fontFamily: 'Poppins',
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'Poppins',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  accountName: {
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  accountCategory: {
    color: 'gray',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
  accountRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountAmount: {
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  applyButton: {
    backgroundColor: '#EE1D52',
    padding: 10,
    width: '100%',
    borderRadius: 5,
    marginBottom: 10,
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#EE1D52',
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterOptionText: {
    fontSize: 16,
  },
  selectedDateText: {
    color: 'gray',
  },
  clearFilterButton: {
    padding: 10,
    marginBottom: 10,
  },
  clearFilterButtonText: {
    color: 'orange',
    textAlign: 'center',
  },
});