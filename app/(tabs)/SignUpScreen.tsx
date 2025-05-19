import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert, // Import Alert để hiển thị thông báo
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from "../../constants/Gloubal";
const SignUpScreen = () => {
  const navigation = useNavigation();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (text) => {
    return text.includes('@');
  };

  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      email.trim() !== '' &&
      isValidEmail(email) &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword
    );
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (!isValidEmail(text)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleCreateAccount = async () => {
    if (isFormValid()) {
      try {
        const response = await fetch(`${API_URL}/api/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Đăng ký thành công, có thể chuyển hướng người dùng hoặc hiển thị thông báo
          Alert.alert('Success', 'Account created successfully!');
          navigation.navigate('login'); // Ví dụ: chuyển đến màn hình đăng nhập
        } else {
          // Đăng ký thất bại, hiển thị thông báo lỗi từ API
          Alert.alert('Error', data.message || 'Failed to create account.');
        }
      } catch (error) {
        // Lỗi mạng hoặc lỗi không mong muốn
        Alert.alert('Error', 'An unexpected error occurred.');
        console.error('Sign up error:', error);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
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

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!passwordConfirmVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={password.trim() !== ''} // Chỉ cho phép nhập khi password đã được điền
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordConfirmVisible(!passwordConfirmVisible)}
          >
            <Icon
              name={passwordConfirmVisible ? 'eye' : 'eye-slash'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' },
          ]}
          disabled={!isFormValid()}
          onPress={handleCreateAccount} // Gọi hàm xử lý API call
        >
          <Text style={styles.createButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Do you have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('login')}>
          <Text style={styles.linkText}>Sign In</Text>
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
  createButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  signInText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#EF4444',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
});

export default SignUpScreen;