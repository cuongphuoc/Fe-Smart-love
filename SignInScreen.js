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

const SignInScreen = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  // Kiểm tra điều kiện để bật nút "Sign In"
  const isFormValid = () => {
    return emailOrPhone.trim() !== '' && password.trim() !== '';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign In</Text>

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

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgotten your password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[
            styles.signInButton,
            { backgroundColor: isFormValid() ? '#EF4444' : '#FEE2E2' }, // Đổi màu khi hợp lệ
          ]}
          disabled={!isFormValid()} // Vô hiệu hóa khi không hợp lệ
          onPress={() => {
            // Xử lý khi nhấn "Sign In" (ví dụ: gửi dữ liệu lên server)
            console.log('Sign In:', { emailOrPhone, password });
          }}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't you have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
});

export default SignInScreen;