import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from './homeScreen';
import BrowseDealsScreen from './browseDealsScreen';
import UploadCouponScreen from './uploadCouponScreen';
import ProfileScreen from './profileScreen';

const Tab = createBottomTabNavigator();

// Custom Tab Icons
const TabIcon = ({ name, focused, label }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
      {name}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

export default function MainAppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#B71C1C',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="🏠" focused={focused} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="BrowseDealsTab"
        component={BrowseDealsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="🎫" focused={focused} label="Deals" />
          ),
        }}
      />
      <Tab.Screen
        name="UploadCouponTab"
        component={UploadCouponScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="📤" focused={focused} label="Upload" />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="👤" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabIconActive: {
    color: '#B71C1C',
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
  },
  tabLabelActive: {
    color: '#B71C1C',
    fontWeight: 'bold',
  },
});
