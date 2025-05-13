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
    { name: "explore", title: "Explore", icon: "paperplane.fill" },
    { name: "profile", title: "Profile", icon: "person.fill" },
    { name: "CalendarScreen", title: "CalendarScreen", icon: "person.fill" },
    { name: "login", title: "Login", icon: "person.fill" },
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
        <Tabs.Screen
          name="CoupleFund"
          options={{
            title: 'CoupleFund',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />        <Tabs.Screen
          name="ToDoList"
          options={{
            title: 'To-Do List',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle.fill" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
