import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from 'react-native';
import { API_URL } from "../../constants/Gloubal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Footer from '@/components/Footer';

const ToDoList = () => {
    const [task, setTask] = useState('');
    const [todoList, setTodoList] = useState([]);
    const [customMinutes, setCustomMinutes] = useState('25');
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const wasRunningRef = useRef(false);
    const navigation = useNavigation();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            wasRunningRef.current = true;
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            handleFinish();
        }

        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return hrs !== '00' ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
    };

    const startTimer = () => {
        const minutes = parseInt(customMinutes);
        if (!isNaN(minutes) && minutes > 0) {
            setTimeLeft(minutes * 60);
            setIsRunning(true);
        }
    };

    const addTask = () => {
        if (task.trim() === '') return;
        setTodoList([...todoList, { id: Date.now().toString(), text: task }]);
        setTask('');
    };

    const deleteTask = (id: string) => {
        setTodoList(todoList.filter(item => item.id !== id));
    };

    const handleFinish = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            navigation.navigate('login' as never);
            return;
        }
        setIsRunning(false);
        setTimeLeft(0);

        if (wasRunningRef.current) {
            wasRunningRef.current = false;

            try {
                const response = await fetch(`${API_URL}/api/todo`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ todos: todoList }),
                });

                if (response.ok) {
                    Alert.alert(
                        'Done!',
                        'Tasks sent to server 🎉',
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.navigate('ViewTodoList' as never),
                            },
                        ],
                        { cancelable: false }
                    );
                } else {
                    Alert.alert('Error', 'Failed to send tasks');
                }
            } catch (error) {
                Alert.alert('Network Error', 'Could not connect to server');
            }
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>❌</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📋 To-Do List</Text>
            <Text style={styles.timerText}>⏳ {formatTime(timeLeft)}</Text>

            {/* Timer Controls */}
            <View style={styles.timerSetup}>
                <TextInput
                    style={styles.timerInput}
                    keyboardType="numeric"
                    value={customMinutes}
                    onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, '');
                        setCustomMinutes(numericText);
                    }}
                    placeholder="Minutes"
                />
                <TouchableOpacity style={styles.controlButton} onPress={startTimer}>
                    <Text style={styles.controlButtonText}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton1} onPress={() => setIsRunning(false)}>
                    <Text style={styles.controlButtonText1}>Stop</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: '#6c757d' }]}
                    onPress={() => {
                        setIsRunning(false);
                        setTimeLeft(0);
                        wasRunningRef.current = false;
                    }}
                >
                    <Text style={styles.controlButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: 'orange' }]}
                    onPress={handleFinish}
                >
                    <Text style={styles.controlButtonText}>Finish</Text>
                </TouchableOpacity>
            </View>

            {/* Add Task */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a task"
                    value={task}
                    onChangeText={setTask}
                />
                <TouchableOpacity style={styles.addButton} onPress={addTask}>
                    <Text style={styles.addButtonText}>＋</Text>
                </TouchableOpacity>
            </View>

            {/* ViewTodoList Button */}
            <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: '#17a2b8', alignSelf: 'center', marginBottom: 20 }]}
                onPress={() => navigation.navigate('ViewTodoList' as never)}
            >
                <Text style={styles.controlButtonText}>📄 View All Todos</Text>
            </TouchableOpacity>

            {/* Task List */}
            <FlatList
                data={todoList}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', marginTop: 40 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#dc3545',
        marginBottom: 20,
        textAlign: 'center',
    },
    timerSetup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 30,
    },
    timerInput: {
        borderColor: '#aaa',
        borderWidth: 1,
        padding: 10,
        width: 100,
        borderRadius: 8,
        marginRight: 10,
        textAlign: 'center',
        fontSize: 18,
    },
    controlButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
        marginTop: 10,
    },
    controlButton1: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
        marginTop: 10,
    },
    controlButtonText: { color: '#fff', fontSize: 16 },
    controlButtonText1: { color: '#fff', fontSize: 16 },
    inputContainer: { flexDirection: 'row', marginBottom: 20 },
    input: {
        flex: 1,
        borderColor: '#aaa',
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
    },
    addButton: {
        backgroundColor: '#28a745',
        padding: 10,
        marginLeft: 10,
        borderRadius: 8,
    },
    addButtonText: { color: '#fff', fontSize: 20 },
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#f4f4f4',
        marginBottom: 10,
        borderRadius: 8,
    },
    taskText: { fontSize: 16 },
    deleteButton: { fontSize: 18 },
});

export default ToDoList;
