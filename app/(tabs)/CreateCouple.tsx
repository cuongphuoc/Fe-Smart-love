import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Clipboard,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Gloubal';
import io from 'socket.io-client';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateCoupleScreen = () => {
    const router = useRouter();
    const { coupleCode: initialCodeFromLogin } = useLocalSearchParams();
    const [partnerCode, setPartnerCode] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [myCoupleCode, setMyCoupleCode] = useState<string | null>(null);
    const socketRef = useRef<any>(null);

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [connectionDate, setConnectionDate] = useState<Date | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('userId');
                setUserId(id);
            } catch (e) {
                console.error('Error fetching user ID', e);
                setError('Failed to load user information.');
            }
        };

        fetchUserId();

        if (initialCodeFromLogin) {
            setMyCoupleCode(Array.isArray(initialCodeFromLogin) ? initialCodeFromLogin[0] : initialCodeFromLogin);
        }

        socketRef.current = io(API_URL, {
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected:', socketRef.current.id);
        });

        socketRef.current.on('coupleStatus', (data: any) => {
            console.log('Couple updated:', data);
            if (data.success === true) {
                socketRef.current.disconnect();
                router.push('/');
            }
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [initialCodeFromLogin]);

    useEffect(() => {
        let checkIntervalId: NodeJS.Timeout | null = null;

        const startCheckingCoupleStatus = async () => {
            const token = await AsyncStorage.getItem('token');
            if (socketRef.current && token) {
                checkIntervalId = setInterval(() => {
                    socketRef.current.emit('checkCoupleStatus', { token });
                    console.log('Checking couple status...');
                }, 3000);
            }
        };

        const stopCheckingCoupleStatus = () => {
            if (checkIntervalId) {
                clearInterval(checkIntervalId);
                checkIntervalId = null;
            }
        };

        startCheckingCoupleStatus();

        return () => {
            stopCheckingCoupleStatus();
        };
    }, []);

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setConnectionDate(currentDate);
    };

    const showDatepickerModal = () => {
        setShowDatePicker(true);
    };

    const handleGenerateMyCode = async () => {
        if (!userId) {
            Alert.alert('Error', 'User ID not found. Please try again.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/couples`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
                },
                body: JSON.stringify({ "couplecode": myCoupleCode, "connectionDate": connectionDate?.toISOString() }), // Send connectionDate
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data);
                if (socketRef.current && myCoupleCode && userId) {
                    socketRef.current.emit('CoupleStatus', { coupleCode: myCoupleCode, userId });
                }
            } else {
                setError(data.error || 'Failed to generate code.');
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred while generating the code.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCouple = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/couples`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    couplecode: partnerCode.trim(),
                    "connectionDate": connectionDate?.toISOString() // Send connectionDate
                }),
            });

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                if (data.token) {
                    await AsyncStorage.setItem('token', data.token);
                }
                Alert.alert('Success', data.message || 'Joined couple successfully!', [
                    { text: 'OK', onPress: () => router.push('/') },
                ]);
            } else {
                setError(data.error || 'Failed to join couple.');
            }
        } catch (error) {
            console.error('Error joining couple:', error);
            setError('An unexpected error occurred while joining the couple.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (myCoupleCode) {
            await Clipboard.setString(myCoupleCode);
            Alert.alert('Copied!', 'Your code has been copied to the clipboard.');
        } else {
            Alert.alert('Oops!', 'No code to copy.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Couple Connection</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {loading && !myCoupleCode && <ActivityIndicator size="large" color="#FF6B6B" />}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Unique Code</Text>
                {myCoupleCode ? (
                    <View style={styles.codeDisplay}>
                        <Text style={styles.myCodeText}>{String(myCoupleCode)}</Text>
                        <TouchableOpacity onPress={handleCopyToClipboard} style={styles.copyButton}>
                            <Text style={styles.copyButtonText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleGenerateMyCode}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Generating...' : 'Generate Your Code'}
                        </Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.infoText}>Share this code with your partner.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connect with Partner</Text>
                <Text style={styles.infoText}>
                    Enter your partner's unique code to connect.
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Partner's Code"
                    keyboardType="numeric"
                    onChangeText={(text) => setPartnerCode(text.replace(/[^0-9]/g, ''))}
                    editable={!loading}
                    value={partnerCode}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleJoinCouple}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Connect</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select First Date</Text>
                <TouchableOpacity style={styles.button} onPress={showDatepickerModal}>
                    <Text style={styles.buttonText}>
                        {connectionDate ? connectionDate.toLocaleDateString() : 'Select Date'}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={'date'}
                        is24Hour={true}
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
                {connectionDate && (
                    <Text style={styles.infoText}>Selected Date: {connectionDate.toLocaleDateString()}</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#FF6B6B',
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 15,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f0f0f0',
    },
    button: {
        backgroundColor: '#FF6B6B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 10,
    },
    codeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    myCodeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    copyButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    copyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CreateCoupleScreen;