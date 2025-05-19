import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';
// Import API_URL from your constants file
import { API_URL } from "../../constants/Gloubal"; // Adjust the path if needed

const router = useRouter();
const SignInScreen = ({ navigation }: any) => {

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    const isValidEmail = (text) => {
        return text.includes('@');
    };

    const isFormValid = () => {
        return email.trim() !== '' && isValidEmail(email) && password.trim() !== '';
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (!isValidEmail(text)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    const handleSignIn = async () => {
        if (isFormValid()) {
            try {
                const response = await fetch(`${API_URL}/api/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    Alert.alert('Success', 'Sign in successful!');
                    console.log('Login successful:', data);
                    await AsyncStorage.setItem('token', data.token);
                    // Pass couplecode to CreateCouple
                    if (data.id_couple) {
                        router.push({
                            pathname: '/', // Đã có couple -> về trang chủ
                        });
                    } else {
                        router.push({
                            pathname: '/CreateCouple',
                            params: { coupleCode: data.couplecode }, // Chưa có couple -> tạo mới
                        });
                    }
                } else {
                    Alert.alert('Error', data.message || 'Sign in failed.');
                }
            } catch (error) {
                Alert.alert('Error', 'An unexpected error occurred.');
                console.error('Sign in error:', error);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Sign In</Text>

            {/* Form */}
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={handleEmailChange}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!passwordVisible}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                        <Icon
                            name={passwordVisible ? 'eye' : 'eye-slash'}
                            size={20}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                </View>

                {/* Forgot Password Link */}
                

                {/* Sign In Button */}
                <TouchableOpacity
                    style={[
                        styles.signInButton,
                        { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' },
                    ]}
                    disabled={!isFormValid()}
                    onPress={handleSignIn}
                >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't you have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/SignUpScreen')}>
                    <Text style={styles.linkText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 24,
    },
    formContainer: {
        width: '100%',
    },
    input: {
        width: '100%',
        padding: 12,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        marginBottom: 12,
    },
    passwordContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 12,
    },
    signInButton: {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    signInButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    signUpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    signUpText: {
        color: '#6B7280',
        textAlign: 'center',
    },
    linkText: {
        color: '#EF4444',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    forgotPasswordText: {
        color: '#EF4444',
        fontSize: 14,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
    },
});

export default SignInScreen;