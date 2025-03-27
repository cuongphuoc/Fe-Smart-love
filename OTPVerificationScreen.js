import React, { useState, useRef } from 'react';
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
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const { emailOrPhone } = route.params;

  const isFormValid = () => {
    const otpString = otp.join('');
    return otpString.length === 6;
  };

  const handleChange = (text, index) => {
    if (/[^0-9]/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (nativeEvent, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString === '123456') {
      navigation.navigate('ResetPassword', { emailOrPhone });
    } else {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  const handleResend = () => {
    if (!resendDisabled) {
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Success', 'OTP has been resent to ' + emailOrPhone);
      setResendDisabled(true);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit OTP sent to {emailOrPhone}
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              placeholder="-"
              placeholderTextColor="#9CA3AF"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent, index)}
              keyboardType="numeric"
              maxLength={1}
              ref={(ref) => (inputRefs.current[index] = ref)}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' },
          ]}
          disabled={!isFormValid()}
          onPress={handleVerify}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resendButton,
            { opacity: resendDisabled ? 0.5 : 1 },
          ]}
          onPress={handleResend}
          disabled={resendDisabled}
        >
          <Text style={styles.resendButtonText}>
            {resendDisabled ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
          </Text>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 50,
    height: 50,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  resendButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#EF4444',
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