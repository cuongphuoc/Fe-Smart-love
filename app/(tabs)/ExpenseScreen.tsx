import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { accounts, chartLegend } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'
import FloatingButton from '@/components/expense/FloatingButton';
import { ExpenseStackParamList } from '@/components/expense/ExpenseStack';

type ExpenseScreenNavigationProp = StackNavigationProp<ExpenseStackParamList, 'ExpenseScreen'>;
const screenWidth = Dimensions.get('window').width;

const ExpenseScreen = () => {
  const navigation = useNavigation<ExpenseScreenNavigationProp>();
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
        <Ionicons name="search" size={26} color="white" />
      </View>

      <ScrollView>
        {/* Total Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>123.456 đ</Text>
          <View style={styles.changeContainer}>
            <Text style={styles.increase}>+2.000</Text>
            <Text style={styles.decrease}>-1.500</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartLegend}
              width={screenWidth - 64}
              height={250}
              chartConfig={{
                color: () => `black`,
              }}
              accessor="percentage"
              backgroundColor="transparent"
              paddingLeft="75"
              hasLegend={false}
            />
          </View>
          <Text style={styles.monthText}>May 2025</Text>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          {chartLegend.map((item) => (
            <View style={styles.legendItem} key={item.name}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name} ({item.percentage}%)</Text>
            </View>
          ))}
        </View>

        {/* Accounts Title */}
        <TouchableOpacity
          style={styles.accountsHeader}
          onPress={() => navigation.navigate('ExpenseTransaction')}>
          <Text style={styles.accountsTitle}>Accounts</Text>
          <Ionicons name="chevron-forward" size={26} color="black" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Accounts List */}
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.accountItem}>
              <View style={styles.accountLeft}>
                <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                <View>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <Text style={styles.accountCategory}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.accountRight}>
                <Text style={styles.accountAmount}>{item.amount.toLocaleString()} đ</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingButton onPress={() => {
        navigation.navigate('AddExpense');
      }} />
    </View>
  );
};

export default ExpenseScreen;

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
    paddingVertical: 12,
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
  changeContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 20,
  },
  increase: {
    color: 'green',
    fontFamily: 'Poppins',
  },
  decrease: {
    color: 'red',
    fontFamily: 'Poppins',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EE1D52',
    fontFamily: 'Poppins',
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
  accountsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  accountsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    gap: 8,
  },
  accountAmount: {
    fontSize: 16,
    fontFamily: 'Poppins',
  },
});
