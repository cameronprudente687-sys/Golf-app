import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import MemberDirectoryScreen from '../screens/MemberDirectoryScreen';
import MemberProfileScreen from '../screens/MemberProfileScreen';

import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab bar icon component using text glyphs (no icon library needed)
function TabIcon({ label, focused }) {
  const icons = {
    Home: focused ? '⌂' : '⌂',
    Members: focused ? '◈' : '◇',
    Rounds: focused ? '⛳' : '⛳',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIconText, focused && styles.tabIconFocused]}>
        {icons[label]}
      </Text>
    </View>
  );
}

// Stack navigator wrapping Member Directory so Profile can push on top
function MembersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MemberDirectory" component={MemberDirectoryScreen} />
      <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: Colors.gold.primary,
          tabBarInactiveTintColor: Colors.charcoal.pale,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={route.name} focused={focused} />
          ),
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="Members"
          component={MembersStack}
          options={{ tabBarLabel: 'Members' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.green.deep,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 20,
    color: Colors.charcoal.pale,
  },
  tabIconFocused: {
    color: Colors.gold.primary,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
