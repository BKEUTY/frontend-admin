import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

import AccountScreen from '../Account/AccountScreen';
import ProfileScreen from '../Account/ProfileScreen';
import OrderDetailScreen from '../Admin/Orders/OrderDetailScreen';
import OrderListScreen from '../Admin/Orders/OrderListScreen';
import { COLORS } from '../constants/Theme';
import { useLanguage } from '../i18n/LanguageContext';
import AdminDashboard from '../Admin/Dashboard/DashboardScreen';
import AdminProductList from '../Admin/Products/ProductListScreen';
import AdminProductCreate from '../Admin/Products/ProductCreateScreen';

import NotFoundScreen from '../Component/ErrorPages/NotFoundScreen';
import ServerErrorScreen from '../Component/ErrorPages/ServerErrorScreen';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../Auth/LoginScreen';
import ForgotPasswordScreen from '../Auth/ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    const { t } = useLanguage();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.mainTitle,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { paddingBottom: 5, height: 60 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'AdminDashboard') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    else if (route.name === 'AdminProducts') iconName = focused ? 'cube' : 'cube-outline';
                    else if (route.name === 'AdminOrders') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Account') iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
                tabBarLabelStyle: { fontSize: 12, paddingBottom: 5 }
            })}
        >
            <Tab.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: t('dashboard') }} />
            <Tab.Screen name="AdminProducts" component={AdminProductList} options={{ title: t('products') }} />
            <Tab.Screen name="AdminOrders" component={OrderListScreen} options={{ title: t('orders') || 'Orders' }} />
            <Tab.Screen name="Account" component={AccountScreen} options={{ title: t('account') }} />
        </Tab.Navigator >
    );
}

export default function AppNavigator() {
    const { t } = useLanguage();
    return (
        <>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Main" component={TabNavigator} />
                    

                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: t('forgot_password') || 'Forgot Password' }} />

                    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: t('account') }} />
                    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false }} />

                    <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
                    <Stack.Screen name="AdminProductCreate" component={AdminProductCreate} options={{ headerShown: false }} />

                    <Stack.Screen name="NotFound" component={NotFoundScreen} />
                    <Stack.Screen name="ServerError" component={ServerErrorScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
