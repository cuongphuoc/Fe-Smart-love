import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { usePathname } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabStatusBarColors } from '@/constants/StatusBarConfig';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const currentTab = pathname.split('/').pop() || 'index';
  
  // Set StatusBar color based on current tab
  const statusBarConfig = TabStatusBarColors[currentTab] || TabStatusBarColors.index;
  
  React.useEffect(() => {
    StatusBar.setBackgroundColor(statusBarConfig.backgroundColor);
    StatusBar.setBarStyle(statusBarConfig.barStyle);
  }, [currentTab]);

  const screens = [
    { name: "index", title: "Home", icon: "house.fill" },
    { name: "viewdiary", title: "Diary", icon: "book.fill" },
    { name: "postdiary", title: "Write", icon: "pencil.line" },
    { name: "CalendarScreen", title: "Calendar", icon: "calendar.badge.clock" },
    { name: "CoupleFund", title: "Fund", icon: "creditcard.fill" },
    { name: "ToDoList", title: "To-Do", icon: "checkmark.circle.fill" },
    { name: "login", title: "Login", icon: "lock.fill" },
  ];

  console.log("All tabs:", screens.map(screen => screen.name));
  return (
    <>
      <StatusBar 
        backgroundColor={statusBarConfig.backgroundColor}
        barStyle={statusBarConfig.barStyle}
        translucent={true}
      />
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
            title: 'Diary',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="postdiary"
          options={{
            title: 'Write',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="pencil.line" color={color} />,
          }}
        />
        <Tabs.Screen
          name="CalendarScreen"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar.badge.clock" color={color} />,
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
          name="CoupleFund"
          options={{
            title: 'Fund',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="ToDoList"
          options={{
            title: 'To-Do',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle.fill" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
