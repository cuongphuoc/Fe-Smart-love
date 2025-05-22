import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kiểm tra xem thiết bị có hỗ trợ sinh trắc học không
export const checkBiometricSupport = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

// Xác thực bằng sinh trắc học (vân tay/Face ID)
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Xác thực để chỉnh sửa quỹ',
      fallbackLabel: 'Sử dụng PIN',
      disableDeviceFallback: false,
    });
    
    return result.success;
  } catch (error) {
    console.error('Lỗi xác thực sinh trắc học:', error);
    return false;
  }
};

// Lưu PIN
export const savePin = async (pin: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('security_pin', pin);
  } catch (error) {
    console.error('Lỗi khi lưu PIN:', error);
    throw error;
  }
};

// Kiểm tra PIN
export const verifyPin = async (inputPin: string): Promise<boolean> => {
  try {
    const storedPin = await AsyncStorage.getItem('security_pin');
    return storedPin === inputPin;
  } catch (error) {
    console.error('Lỗi khi kiểm tra PIN:', error);
    return false;
  }
};

// Lưu cài đặt bảo mật
export const saveSecuritySettings = async (settings: {
  requirePin: boolean;
  pin: string;
  useBiometric: boolean;
}): Promise<void> => {
  try {
    await AsyncStorage.setItem('security_settings', JSON.stringify(settings));
    
    // Nếu có PIN, lưu PIN
    if (settings.requirePin && settings.pin) {
      await savePin(settings.pin);
    }
  } catch (error) {
    console.error('Lỗi khi lưu cài đặt bảo mật:', error);
    throw error;
  }
};

// Lấy cài đặt bảo mật
export const getSecuritySettings = async (): Promise<{
  requirePin: boolean;
  pin: string;
  useBiometric: boolean;
}> => {
  try {
    const settings = await AsyncStorage.getItem('security_settings');
    if (settings) {
      return JSON.parse(settings);
    }
    return {
      requirePin: false,
      pin: '',
      useBiometric: false
    };
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt bảo mật:', error);
    return {
      requirePin: false,
      pin: '',
      useBiometric: false
    };
  }
};

// Xác thực theo cài đặt (sinh trắc học hoặc PIN)
export const authenticate = async (): Promise<boolean> => {
  try {
    const settings = await getSecuritySettings();
    
    // Nếu không yêu cầu xác thực, luôn trả về thành công
    if (!settings.requirePin && !settings.useBiometric) {
      return true;
    }
    
    // Nếu yêu cầu sinh trắc học và thiết bị hỗ trợ
    if (settings.useBiometric && await checkBiometricSupport()) {
      const biometricResult = await authenticateWithBiometrics();
      if (biometricResult) return true;
    }
    
    // Nếu sinh trắc học thất bại hoặc không được sử dụng, kiểm tra PIN
    if (settings.requirePin) {
      // Người dùng sẽ nhập PIN qua modal trong app,
      // và kết quả sẽ được xử lý trong app
      return false; // Trả về false để app hiện modal nhập PIN
    }
    
    return false;
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    return false;
  }
}; 