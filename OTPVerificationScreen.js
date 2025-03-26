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

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const { emailOrPhone } = route.params; // Nhận emailOrPhone từ ForgotPasswordScreen

    const isFormValid = () => {
        return otp.trim().length === 6; // Giả định OTP là 6 ký tự
    };

    // const isFormValid = () => {
    //     return otp.trim() === '123456'; // Giả lập OTP là 123456
    // };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit OTP sent to {emailOrPhone}
      </Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#9CA3AF"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
        />



        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' },
          ]}
          disabled={!isFormValid()}
        //   onPress={() => {
        //     // Giả lập xác nhận OTP thành công
        //     console.log('OTP verified:', otp);
        //     navigation.navigate('ResetPassword', { emailOrPhone });
        //   }}
        
        onPress={() => {
            if (otp === '123456') {
              navigation.navigate('ResetPassword', { emailOrPhone });
            } else {
              Alert.alert('Error', 'Invalid OTP');
            }
          }} // Giả lập xác nhận OTP không thành công
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity> 
      </View>

      <View style={styles.backContainer}> 
        <Text style={styles.backText}>Back to </Text>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Forgot Password</Text>
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
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
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

export default OTPVerificationScreen;