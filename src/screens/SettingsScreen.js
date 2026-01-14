import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Bell, Moon, Trash2, Info, ExternalLink } from 'lucide-react-native';
import { SIZES, RISK_LEVELS, NOTIFICATION_THRESHOLDS } from '../constants';
import StorageService from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
    const { isDarkMode, theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [notificationThreshold, setNotificationThreshold] = useState(NOTIFICATION_THRESHOLDS.HIGH);
    const [riskLevel, setRiskLevel] = useState('MODERATE');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await StorageService.getSettings();
        if (settings) {
            setNotifications(settings.notificationsEnabled ?? true);
            setNotificationThreshold(settings.notificationThreshold ?? NOTIFICATION_THRESHOLDS.HIGH);
            setRiskLevel(settings.riskLevel ?? 'MODERATE');
        }
    };

    const saveSettings = async (key, value) => {
        const currentSettings = await StorageService.getSettings() || {};
        await StorageService.saveSettings({
            ...currentSettings,
            [key]: value,
        });
    };

    const handleNotificationsChange = (value) => {
        setNotifications(value);
        saveSettings('notificationsEnabled', value);
    };

    const handleThresholdChange = (threshold) => {
        setNotificationThreshold(threshold);
        saveSettings('notificationThreshold', threshold);
    };

    const handleRiskLevelChange = (level) => {
        setRiskLevel(level);
        saveSettings('riskLevel', level);
    };

    const handleTestNotification = async () => {
        const permitted = await NotificationService.requestPermissions();
        if (permitted) {
            await NotificationService.sendTestNotification();
        } else {
            Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your analysis history and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await StorageService.clearAll();
                        // Reset local state (theme is kept as is or reset via toggle)
                        setNotifications(true);
                        setNotificationThreshold(NOTIFICATION_THRESHOLDS.HIGH);
                        setRiskLevel('MODERATE');
                        Alert.alert('Success', 'All data has been cleared.');
                    }
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

                {/* Risk Management Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Risk Management</Text>
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
                        <View style={styles.settingInfo}>
                            <Shield color={theme.primary} size={20} />
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Risk Tolerance</Text>
                        </View>
                    </View>

                    <View style={styles.riskOptions}>
                        {Object.entries(RISK_LEVELS).map(([key, config]) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.riskOption,
                                    { backgroundColor: theme.surfaceLight },
                                    riskLevel === key && { borderColor: theme.primary, backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' },
                                ]}
                                onPress={() => handleRiskLevelChange(key)}
                            >
                                <Text style={[
                                    styles.riskOptionText,
                                    { color: theme.text },
                                    riskLevel === key && { color: theme.primary },
                                ]}>
                                    {config.label}
                                </Text>
                                <Text style={[styles.riskDetail, { color: theme.textSecondary }]}>
                                    SL: {config.stopLossPercent}% / TP: {config.takeProfitPercent}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Appearance Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
                        <View style={styles.settingInfo}>
                            <Moon color={theme.primary} size={20} />
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: theme.surfaceLight, true: theme.primary }}
                            thumbColor={theme.text}
                        />
                    </View>
                </View>

                {/* Notifications Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Notifications</Text>
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
                        <View style={styles.settingInfo}>
                            <Bell color={theme.primary} size={20} />
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Signal Alerts</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={handleNotificationsChange}
                            trackColor={{ false: theme.surfaceLight, true: theme.primary }}
                            thumbColor={theme.text}
                            disabled={NotificationService.isEnvironmentDisabled()}
                        />
                    </View>

                    {!NotificationService.isEnvironmentDisabled() && notifications && (
                        <View style={[styles.thresholdSection, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }]}>
                            <Text style={[styles.subSectionTitle, { color: theme.textSecondary }]}>Alert Confidence Threshold</Text>
                            <View style={styles.thresholdOptions}>
                                {Object.entries(NOTIFICATION_THRESHOLDS).map(([key, value]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.thresholdOption,
                                            { backgroundColor: theme.surfaceLight },
                                            notificationThreshold === value && { borderColor: theme.primary, backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' },
                                        ]}
                                        onPress={() => handleThresholdChange(value)}
                                    >
                                        <Text style={[
                                            styles.thresholdText,
                                            { color: theme.textSecondary },
                                            notificationThreshold === value && { color: theme.primary, fontWeight: 'bold' },
                                        ]}>
                                            {key} ({value}%)
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.testButton, { borderColor: theme.primary }]}
                                onPress={handleTestNotification}
                            >
                                <Bell color={theme.primary} size={16} />
                                <Text style={[styles.testButtonText, { color: theme.primary }]}>Send Test Alert</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {NotificationService.isEnvironmentDisabled() && (
                        <View style={[styles.warningBox, { backgroundColor: theme.warningBackground }]}>
                            <Info color={theme.warning} size={16} />
                            <Text style={[styles.warningText, { color: theme.warning }]}>
                                Push notifications are limited in Expo Go (Android).
                                Use a development build for full support.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Data Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Data</Text>
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity style={[styles.settingRow, { borderBottomColor: 'transparent' }]} onPress={handleClearData}>
                        <View style={styles.settingInfo}>
                            <Trash2 color={theme.error} size={20} />
                            <Text style={[styles.settingLabel, { color: theme.error }]}>
                                Clear All Data
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>About</Text>
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
                        <View style={styles.settingInfo}>
                            <Info color={theme.primary} size={20} />
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
                        </View>
                        <Text style={[styles.settingValue, { color: theme.textSecondary }]}>1.0.0</Text>
                    </View>
                </View>

                {/* Disclaimer */}
                <Text style={[styles.disclaimerText, { color: theme.textSecondary, textAlign: 'center', marginTop: 32, paddingHorizontal: 20 }]}>
                    This application is for educational and informational purposes only.
                    It is NOT financial advice. Trading carries significant risk of loss.
                    Never invest money you cannot afford to lose. Always do your own research
                    and consult with a licensed financial advisor before making any investment decisions.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: SIZES.padding,
        paddingBottom: 40,
    },
    title: {
        fontSize: SIZES.xxxl,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 16,
    },
    card: {
        borderRadius: SIZES.radius,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        borderBottomWidth: 1,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: SIZES.md,
        marginLeft: 12,
    },
    settingValue: {
        fontSize: SIZES.md,
    },
    riskOptions: {
        padding: SIZES.padding,
    },
    riskOption: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    riskOptionText: {
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    riskDetail: {
        fontSize: SIZES.sm,
        marginTop: 4,
    },
    disclaimer: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginTop: 24,
        borderLeftWidth: 4,
    },
    disclaimerTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        marginBottom: 8,
    },
    disclaimerText: {
        fontSize: SIZES.sm,
        lineHeight: 20,
    },
    thresholdSection: {
        padding: SIZES.padding,
        paddingTop: 0,
    },
    subSectionTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    thresholdOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    thresholdOption: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    thresholdText: {
        fontSize: SIZES.xs,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    testButtonText: {
        fontSize: SIZES.sm,
        marginLeft: 8,
        fontWeight: '600',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        padding: 12,
        margin: SIZES.padding,
        marginTop: 0,
        borderRadius: 8,
    },
    warningText: {
        fontSize: SIZES.xs,
        marginLeft: 8,
        flex: 1,
    },
});
