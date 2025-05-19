// components/Footer.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type FooterIconProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  active?: boolean;
};

function FooterIcon({ name, label, onPress, active = false }: FooterIconProps) {
  return (
    <TouchableOpacity style={styles.iconContainer} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={name} size={24} color={active ? '#007AFF' : '#555'} />
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: 'home', label: 'Home', route: '/' },
    // { name: 'calendar', label: 'Calendar', route: '/CalendarScreen' }, // Bỏ Calendar
    { name: 'chatbubbles', label: 'Chatbot', route: '/Chatbot' },
    { name: 'list', label: 'ToDo', route: '/ToDoList' },
    { name: 'wallet', label: 'Expense', route: '/AddExpense' },
    { name: 'person-circle', label: 'Profile', route: '/ProfileScreen' }, // Thêm Profile
    // { name: 'log-out', label: 'Logout', route: '/login' }, // Bỏ Logout
  ];

  return (
    <View style={styles.footer}>
      {tabs.map(({ name, label, route }) => (
        <FooterIcon
          key={route}
          name={name}
          label={label}
          onPress={() => router.push(route)}
          active={pathname === route}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute', // ✅ CHÍNH XÁC
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    height: 60,
  },
  iconContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    color: '#555',
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
