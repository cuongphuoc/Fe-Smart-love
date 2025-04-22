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
import CheckBox from 'react-native-check-box';
import { useNavigation } from '@react-navigation/native';
const SignUpScreen = () => {
  const navigation = useNavigation();

  const [toggleCheckBox, setToggleCheckBox] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Kiểm tra tất cả điều kiện để bật nút "Create Account"
  const isFormValid = () => {
    return (
      name.trim() !== '' &&
      emailOrPhone.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword &&
      toggleCheckBox
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>


      {/* Social Buttons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
          <Icon name="facebook-f" size={20} color="#2563EB" />
          <Text style={styles.facebookText}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
          <Icon name="google" size={20} color="#DC2626" />
          <Text style={styles.googleText}>Google</Text>
        </TouchableOpacity>
      </View>

      {/* Divider with "Or" */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or</Text>
        <View style={styles.dividerLine} />
      </View>

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
          placeholder="Email/Phone Number"
          placeholderTextColor="#9CA3AF"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
        />
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

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <CheckBox
            style={{ padding: 10 }}
            onClick={() => setToggleCheckBox(!toggleCheckBox)}
            isChecked={toggleCheckBox}
            checkBoxColor="#2563EB"
          />
          <Text style={styles.checkboxText} numberOfLines={2} ellipsizeMode="tail">
            I'm agree to the{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Create Account Button */}
        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' }, // Đổi màu khi hợp lệ
          ]}
          disabled={!isFormValid()} // Vô hiệu hóa khi không hợp lệ
          onPress={() => {
            // Xử lý khi nhấn "Create Account" (ví dụ: gửi dữ liệu lên server)
            console.log('Account created:', { name, emailOrPhone, password });
          }}
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
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    padding: 12,
    borderRadius: 8,
  },
  facebookButton: {
    backgroundColor: '#DBEAFE',
  },
  googleButton: {
    backgroundColor: '#FEE2E2',
  },
  facebookText: {
    color: '#2563EB',
    marginLeft: 8,
  },
  googleText: {
    color: '#DC2626',
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 8,
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
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  checkboxText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flexShrink: 1,
  },
  linkText: {
    color: '#EF4444',
  },
  createButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
});

export default SignUpScreen;