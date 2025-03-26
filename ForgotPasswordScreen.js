import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');

  const isFormValid = () => {
    return emailOrPhone.trim() !== '';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email or phone number to reset your password
      </Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email/Phone Number"
          placeholderTextColor="#9CA3AF"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' },
          ]}
          disabled={!isFormValid()}
          onPress={() => {
            // Giả lập gửi OTP và chuyển sang màn hình nhập OTP
            navigation.navigate('OTPVerification', { emailOrPhone });
          }}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.backContainer}>
        <Text style={styles.backText}>Back to </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    marginBottom: 16,
  },
  sendButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#EF4444',
  },
});

export default ForgotPasswordScreen;