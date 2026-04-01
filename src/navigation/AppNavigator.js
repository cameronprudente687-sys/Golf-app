import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import FeedScreen from '../screens/FeedScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ConversationScreen from '../screens/ConversationScreen';
import MemberDirectoryScreen from '../screens/MemberDirectoryScreen';
import MemberProfileScreen from '../screens/MemberProfileScreen';

import { Colors } from '../constants/colors';
import { conversations } from '../data/mockData';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const totalUnread = conversations.reduce((n, c) => n + c.unread, 0);

const TAB_ICONS = {
  Home:     { normal: '⌂',  active: '⌂'  },
  Feed:     { normal: '◻',  active: '◼'  },
  Messages: { normal: '✉',  active: '✉'  },
  Members:  { normal: '◇',  active: '◈'  },
};

function TabIcon({ name, focused }) {
  const icons = TAB_ICONS[name] || { normal: '●', active: '●' };
  const isMessages = name === 'Messages';

  return (
    <View style={styles.tabIconWrapper}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>
        {focused ? icons.active : icons.normal}
      </Text>
      {isMessages && totalUnread > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{totalUnread}</Text>
        </View>
      )}
    </View>
  );
}

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

function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="FeedMain" component={FeedScreen} />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MessagesList" component={MessagesScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
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
            <TabIcon name={route.name} focused={focused} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
        <Tab.Screen name="Feed" component={FeedStack}    options={{ tabBarLabel: 'Feed' }} />
        <Tab.Screen name="Messages" component={MessagesStack} options={{ tabBarLabel: 'Messages' }} />
        <Tab.Screen name="Members" component={MembersStack}  options={{ tabBarLabel: 'Members' }} />
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
    shadowOpacity: 0.18,
    shadowRadius: 14,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 8,
  },
  tabIconWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  tabIconText: { fontSize: 20, color: Colors.charcoal.pale },
  tabIconTextActive: { color: Colors.gold.primary },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.gold.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.green.deep,
  },
  tabBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.charcoal.dark },
  tabLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginTop: 1 },
});
