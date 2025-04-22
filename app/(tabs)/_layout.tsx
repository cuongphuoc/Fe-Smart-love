import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const screens = [
    { name: "index", title: "Home", icon: "house.fill" },
    { name: "explore", title: "Explore", icon: "paperplane.fill" },
    { name: "profile", title: "Profile", icon: "person.fill" },
    { name: "CalendarScreen", title: "CalendarScreen", icon: "person.fill" },
    { name: "login", title: "Login", icon: "person.fill" },
  ];

  console.log("All tabs:", screens.map(screen => screen.name));
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />  
      
      <Tabs.Screen
        name="viewdiary"
        options={{
          title: 'viewdiary',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
      name="postdiary"
      options={{
        title: 'postdiary',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
      }}
    />
    <Tabs.Screen
      name="CalendarScreen"
      options={{
        title: 'CalendarScreen',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
      }}
    />
    <Tabs.Screen
      name="login"
      options={{
        title: 'login',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
      }}
    />
  
       
    </Tabs>
  );
}
