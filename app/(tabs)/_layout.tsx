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
  { name: "CalendarScreen", title: "CalendarScreen", icon: "calendar.fill" },
  { name: "login", title: "Login", icon: "lock.fill" },
  { name: "CreateCouple", title: "Couple", icon: "heart.fill" }, // Added CreateCouple
  { name: "Chatbot", title: "Chatbot", icon: "heart.fill" }, 
  { name: "ToDoList", title: "ToDoList", icon: "heart.fill" },
  { name: "ViewTodoList", title: "ViewTodoList", icon: "heart.fill" }, // Added CreateCouple
   // Added CreateCouple
  // Added CreateCouple

 ];

 console.log("All tabs:", screens.map(screen => screen.name));
 return (
  <Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    tabBarStyle: {
      display: 'none', // Ẩn hoàn toàn thanh tab
    },
  }}
>
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
     title: 'Diary',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
    }}
   />
   <Tabs.Screen
    name="postdiary"
    options={{
     title: 'Post',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
    }}
   />
   <Tabs.Screen
    name="CalendarScreen"
    options={{
     title: 'Calendar',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
    }}
   />
   <Tabs.Screen
    name="login"
    options={{
     title: 'Login',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="lock.fill" color={color} />,
    }}
   />
   <Tabs.Screen
    name="CreateCouple"
    options={{
     title: 'Couple',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
    }}
   />
   <Tabs.Screen
    name="Chatbot"
    options={{
     title: 'Chatbot',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
    }}
   />
   <Tabs.Screen
    name="ViewTodoList"
    options={{
     title: 'ViewTodoList',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
    }}
   />
   <Tabs.Screen
    name="ProfileScreen"
    options={{
     title: 'ProfileScreen',
     tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
    }}
   />
   
  </Tabs>
  
  
  
 );
}