import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Camera, History, Settings, Activity } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants';
import {
    HomeScreen,
    CaptureScreen,
    AnalysisScreen,
    HistoryScreen,
    SettingsScreen,
    BacktestingScreen,
} from '../screens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
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
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: COLORS.background },
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
                            backgroundColor: COLORS.surface,
                        },
                        headerTintColor: COLORS.text,
                    }}
                />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Backtesting" component={BacktestingScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
