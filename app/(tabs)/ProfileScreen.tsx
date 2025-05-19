import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Gloubal';
import { useNavigation } from '@react-navigation/native';
import Footer from '@/components/Footer';
const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();  // Dùng hook navigation

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toISOString().split('T')[0];
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    
    // Đảm bảo tên route đúng (thường là chữ hoa 'Login')
    navigation.navigate('login'); 
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No user data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      <View style={styles.section}>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{user._id}</Text>

        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Created At:</Text>
        <Text style={styles.value}>{formatDate(user.createdAt)}</Text>
      </View>

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
      <Footer/>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    color: '#222',
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
