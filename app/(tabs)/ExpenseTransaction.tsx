import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack'
import FloatingButton from '@/components/expense/FloatingButton';
import { ExpenseStackParamList } from '@/components/expense/ExpenseStack';
import { useNavigation } from '@react-navigation/native';

type ExpenseScreenNavigationProp = StackNavigationProp<ExpenseStackParamList, 'ExpenseScreen'>;

const mockData = {
    '2025-05': [
        {
            date: 'Sunday, 25',
            total: '785.000 đ',
            items: [
                { title: 'BaNa Hills', category: 'Relationship', amount: '700.000 đ', type: 'expense' },
                { title: 'food to bring', category: 'Home', amount: '85.000 đ', type: 'expense' },
            ]
        },
        {
            date: 'Wednesday, 21',
            total: '598.000 đ',
            items: [
                { title: 'Mom’s gift', category: 'Family | Copper Bank', amount: '219.000 đ', type: 'expense' },
                { title: 'Picnic', category: 'Entertainment | Neon', amount: '250.000 đ', type: 'expense' },
                { title: 'Groceries', category: 'Home | Neon', amount: '120.000 đ', type: 'expense' },
            ]
        },
        {
            date: 'Monday, 23',
            total: '125.000 đ',
            items: [
                { title: 'Salary', category: 'Salary | Iron Bank', amount: '20.000.000 đ', type: 'income' },
                { title: 'movies theater', category: 'Entertainment | Neon', amount: '125.000 đ', type: 'expense' },
            ]
        },
    ]
};

const ExpenseTransaction = () => {
    const navigation = useNavigation<ExpenseScreenNavigationProp>();
    const [monthIndex, setMonthIndex] = useState(0);
    const months = ['May 2025', 'April 2025', 'March 2025'];
    const monthKey = '2025-05';

    const handlePrev = () => {
        if (monthIndex < months.length - 1) setMonthIndex(monthIndex + 1);
    };

    const handleNext = () => {
        if (monthIndex > 0) setMonthIndex(monthIndex - 1);
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
                    <TouchableOpacity onPress={handlePrev}>
                        <Ionicons name="chevron-back" size={24} color="gray" />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>{months[monthIndex]}</Text>
                    <TouchableOpacity onPress={handleNext}>
                        <Ionicons name="chevron-forward" size={24} color="gray" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={mockData[monthKey]}
                    keyExtractor={(item, index) => `${item.date}-${index}`}
                    renderItem={({ item }) => (
                        <View style={styles.daySection}>
                            <View style={styles.dateRow}>
                                <Text style={styles.dateText}>{item.date}</Text>
                                {item.total && <Text style={styles.totalText}>{item.total}</Text>}
                            </View>
                            {item.items.map((i, idx) => (
                                <View key={idx} style={styles.itemCard}>
                                    <View style={styles.itemContent}>
                                        <Text style={styles.title}>{i.title}</Text>
                                        <Text style={styles.category}>{i.category}</Text>
                                    </View>
                                    <Text style={[styles.amount, i.type === 'income' ? styles.income : styles.expense]}>{i.amount}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                />

                <FloatingButton onPress={() => {
                    navigation.navigate('AddExpense');
                }} />
            </View>
        </View>
    );
};

export default ExpenseTransaction;

const styles = StyleSheet.create({
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
    daySection: {
        marginBottom: 16,
    },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginVertical: 6,
        alignItems: 'center',
        elevation: 1,
    },
    icon: {
        width: 36,
        height: 36,
        marginRight: 12,
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
