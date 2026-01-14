import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Camera, History, Settings, Activity } from 'lucide-react-native';
import { SIZES, SHADOWS } from '../constants';


import {
    HomeScreen,
    CaptureScreen,
    AnalysisScreen,
    HistoryScreen,
    SettingsScreen,
    BacktestingScreen,
} from '../screens';

import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopColor: 'transparent',
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    borderRadius: 25,
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                    elevation: 5,
                    ...(SHADOWS?.medium || {}),
                    borderWidth: 1,
                    borderColor: theme.border,
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                tabBarLabelStyle: {
                    fontSize: SIZES.sm,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="CaptureTab"
                component={CaptureScreen}
                options={{
                    tabBarLabel: 'Capture',
                    tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="HistoryTab"
                component={HistoryScreen}
                options={{
                    tabBarLabel: 'History',
                    tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="BacktestingTab"
                component={BacktestingScreen}
                options={{
                    tabBarLabel: 'Analytics',
                    tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { theme, isDarkMode } = useTheme();

    const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;
    const navigationTheme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: theme.primary,
            background: theme.background,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
            notification: theme.accent,
        },
    };

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: theme.background },
                }}
            >
                <Stack.Screen name="Main" component={HomeTabs} />
                <Stack.Screen
                    name="Capture"
                    component={CaptureScreen}
                    options={{
                        presentation: 'fullScreenModal',
                    }}
                />
                <Stack.Screen
                    name="Analysis"
                    component={AnalysisScreen}
                    options={{
                        presentation: 'card',
                        headerShown: true,
                        headerTitle: 'Analysis Result',
                        headerStyle: {
                            backgroundColor: theme.surface,
                            elevation: 0,
                            shadowOpacity: 0,
                        },
                        headerTintColor: theme.text,
                    }}
                />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Backtesting" component={BacktestingScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
