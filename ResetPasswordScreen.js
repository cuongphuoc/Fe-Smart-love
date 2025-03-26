import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ResetPasswordScreen = ({ navigation, route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const { emailOrPhone } = route.params;

  const isFormValid = () => {
    return password.trim() !== '' && confirmPassword === password;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter a new password for {emailOrPhone}
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
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
            placeholder="Confirm New Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={password.trim() !== ''} // Chỉ cho nhập khi password đã điền
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Icon
              name={confirmPasswordVisible ? 'eye' : 'eye-slash'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' },
          ]}
          disabled={!isFormValid()}
          onPress={() => {
            // Giả lập đổi mật khẩu thành công
            console.log('Password reset for:', emailOrPhone, 'New password:', password);
            navigation.navigate('SignIn');
          }}
        >
          <Text style={styles.resetButtonText}>Reset Password</Text>
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
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  resetButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ResetPasswordScreen;