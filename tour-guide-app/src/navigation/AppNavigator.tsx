// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Tour } from '../types';

// Screens
import LoginScreen from '../screens/LoginScreen';
import TourListScreen from '../screens/TourListScreen';
import TourDetailScreen from '../screens/TourDetailScreen';
import GuideDashboard from '../screens/GuideDashboard';
import TouristDashboard from '../screens/TouristDashboard';
import BusinessScreen from '../screens/BusinessScreen';

export type RootStackParamList = {
  Login: undefined;
  TouristApp: undefined;
  GuideApp: undefined;
  TourDetail: { tour: Tour };
};

export type TourDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TourDetail'
>;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TouristTabs: React.FC = () => (
  <Tab.Navigator>
    <Tab.Screen name="Passeios" component={TourListScreen} />
    <Tab.Screen name="Meus Pedidos" component={TouristDashboard} />
    <Tab.Screen name="Lojas" component={BusinessScreen} />
  </Tab.Navigator>
);

const GuideTabs: React.FC = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={GuideDashboard} />
    <Tab.Screen name="Passeios" component={TourListScreen} />
    <Tab.Screen name="Lojas" component={BusinessScreen} />
  </Tab.Navigator>
);

const AppNavigator: React.FC = () => {
  const { user, userType } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : userType === 'tourist' ? (
          <Stack.Screen name="TouristApp" component={TouristTabs} />
        ) : (
          <Stack.Screen name="GuideApp" component={GuideTabs} />
        )}
        <Stack.Screen name="TourDetail" component={TourDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;