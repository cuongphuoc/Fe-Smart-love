import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import{API_URL} from "../../constants/Gloubal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '@/components/Footer';
type RootStackParamList = {
    ExpenseScreen: undefined;
    ExpenseTransaction: undefined; // Ensure ExpenseTransaction is in yourParamList
};

const AddExpense = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [type, setType] = useState<'Income' | 'Expense'>('Income');
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

    const handleSave = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error('No token found, authentication required.');
                // Optionally navigate to login screen
                return;
            }

            const payload = {
                description,
                money: Number(amount),
                date: date.toISOString().split('T')[0],
                kind: category,
                isexpense: type === 'Expense',
            };

            const response = await axios.post(`${API_URL}/api/expenses`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Response:', response.data);
            navigation.navigate('ExpenseTransaction');
        } catch (error) {
            console.error('Failed to save expense:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        }
    }, [amount, description, category, date, type, navigation]);

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
        }
        setShowDatePicker(false);
    };

    const handleSelectCategory = (selectedCategory: string) => {
        setCategory(selectedCategory);
        setCategoryModalVisible(false);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <View style={styles.header}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('ExpenseScreen')}>
                        <Ionicons name="chevron-back" size={26} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Expense</Text>
                </View>
                <Ionicons name="search" size={26} color="white" />
            </View>
            <Text style={styles.amountLabel}>Amount</Text>
            <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => {
                    // Allow only numbers and a single decimal point
                    if (/^\d*\.?\d*$/.test(text)) {
                        setAmount(text);
                    }
                }}
                placeholder="0"
                placeholderTextColor="#ccc"
            />

            <View style={styles.contentContainer}>
                <Ionicons name="heart-circle" size={62} color="#EE1D52" />

                <TextInput
                    style={[styles.input, { color: 'black', marginTop: 16 }]}
                    placeholder="Description"
                    placeholderTextColor="#A4A4A4"
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={{ position: 'relative' }}>
                    <TouchableOpacity style={styles.input} onPress={() => setCategoryModalVisible(!isCategoryModalVisible)}>
                        <Text style={{ color: category ? '#000' : '#A4A4A4', fontSize: 16 }}>{category || 'Category'}</Text>
                        <Ionicons name="chevron-down" size={20} color="#A4A4A4" style={{ position: 'absolute', right: 12, top: 14 }} />
                    </TouchableOpacity>

                    {isCategoryModalVisible && (
                        <View style={styles.dropdown}>
                            {['Savings', 'Food & Drink', 'Relationship', 'Others'].map((item) => (
                                <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => handleSelectCategory(item)}>
                                    <Text style={{ color: '#000' }}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.dateInput}>
                    <Text style={{ color: '#000' }}>{date.toISOString().split('T')[0]}</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar-outline" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || date;
                            setShowDatePicker(false);
                            setDate(currentDate);
                        }}
                    />
                )}

                <View style={styles.typeContainer}>
                    <TouchableOpacity
                        style={[styles.typeButton, type === 'Income' && styles.typeButtonSelected]}
                        onPress={() => setType('Income')}
                    >
                        <Text style={[styles.typeText, type === 'Income' && styles.typeTextSelected]}>Income</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.typeButton, type === 'Expense' && styles.typeButtonSelected]}
                        onPress={() => setType('Expense')}
                    >
                        <Text style={[styles.typeText, type === 'Expense' && styles.typeTextSelected]}>Expense</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View><Footer/>
        </KeyboardAvoidingView>
        
    );
};

export default AddExpense;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    amountLabel: {
        marginTop: 20,
        marginLeft: 20,
        fontSize: 20,
        fontWeight: '400',
        fontFamily: 'Poppins',
        color: '#F88585',
    },
    amountInput: {
        fontSize: 36,
        fontWeight: '400',
        fontFamily: 'Poppins',
        color: '#EE1D52',
        margin: 20,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        textAlign: 'center',
    },
    contentContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: 10,
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#fff',
        color: '#A4A4A4',
        position: 'relative',
        fontSize: 16,
        height: 50,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 16,
        height: 50,
    },
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        marginTop: 16,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginHorizontal: 10,
    },
    typeButtonSelected: {
        backgroundColor: '#F88585',
        borderColor: '#F88585',
    },
    typeText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins',
    },
    typeTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        width: 142,
        height: 40,
        backgroundColor: '#EE1D52',
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Poppins',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        fontSize: 16,
    },
});