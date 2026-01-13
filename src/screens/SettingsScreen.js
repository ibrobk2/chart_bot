import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Bell, Moon, Trash2, Info, ExternalLink } from 'lucide-react-native';
import { COLORS, SIZES, RISK_LEVELS, NOTIFICATION_THRESHOLDS } from '../constants';
import StorageService from '../services/StorageService';
import NotificationService from '../services/NotificationService';

export default function SettingsScreen() {
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [notificationThreshold, setNotificationThreshold] = useState(NOTIFICATION_THRESHOLDS.HIGH);
    const [riskLevel, setRiskLevel] = useState('MODERATE');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await StorageService.getSettings();
        if (settings) {
            setDarkMode(settings.darkMode ?? true);
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

    const handleDarkModeChange = (value) => {
        setDarkMode(value);
        saveSettings('darkMode', value);
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
                        // Reset local state
                        setDarkMode(true);
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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                {/* Risk Management Section */}
                <Text style={styles.sectionTitle}>Risk Management</Text>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Shield color={COLORS.primary} size={20} />
                            <Text style={styles.settingLabel}>Risk Tolerance</Text>
                        </View>
                    </View>

                    <View style={styles.riskOptions}>
                        {Object.entries(RISK_LEVELS).map(([key, config]) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.riskOption,
                                    riskLevel === key && styles.riskOptionActive,
                                ]}
                                onPress={() => handleRiskLevelChange(key)}
                            >
                                <Text style={[
                                    styles.riskOptionText,
                                    riskLevel === key && styles.riskOptionTextActive,
                                ]}>
                                    {config.label}
                                </Text>
                                <Text style={styles.riskDetail}>
                                    SL: {config.stopLossPercent}% / TP: {config.takeProfitPercent}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Appearance Section */}
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Moon color={COLORS.primary} size={20} />
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={handleDarkModeChange}
                            trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                            thumbColor={COLORS.text}
                        />
                    </View>
                </View>

                {/* Notifications Section */}
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Bell color={COLORS.primary} size={20} />
                            <Text style={styles.settingLabel}>Signal Alerts</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={handleNotificationsChange}
                            trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                            thumbColor={COLORS.text}
                            disabled={NotificationService.isEnvironmentDisabled()}
                        />
                    </View>

                    {!NotificationService.isEnvironmentDisabled() && notifications && (
                        <View style={styles.thresholdSection}>
                            <Text style={styles.subSectionTitle}>Alert Confidence Threshold</Text>
                            <View style={styles.thresholdOptions}>
                                {Object.entries(NOTIFICATION_THRESHOLDS).map(([key, value]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.thresholdOption,
                                            notificationThreshold === value && styles.thresholdOptionActive,
                                        ]}
                                        onPress={() => handleThresholdChange(value)}
                                    >
                                        <Text style={[
                                            styles.thresholdText,
                                            notificationThreshold === value && styles.thresholdTextActive,
                                        ]}>
                                            {key} ({value}%)
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.testButton}
                                onPress={handleTestNotification}
                            >
                                <Bell color={COLORS.primary} size={16} />
                                <Text style={styles.testButtonText}>Send Test Alert</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {NotificationService.isEnvironmentDisabled() && (
                        <View style={styles.warningBox}>
                            <Info color={COLORS.warning} size={16} />
                            <Text style={styles.warningText}>
                                Push notifications are limited in Expo Go (Android).
                                Use a development build for full support.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Data Section */}
                <Text style={styles.sectionTitle}>Data</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
                        <View style={styles.settingInfo}>
                            <Trash2 color={COLORS.error} size={20} />
                            <Text style={[styles.settingLabel, { color: COLORS.error }]}>
                                Clear All Data
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Info color={COLORS.primary} size={20} />
                            <Text style={styles.settingLabel}>Version</Text>
                        </View>
                        <Text style={styles.settingValue}>1.0.0</Text>
                    </View>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
                    <Text style={styles.disclaimerText}>
                        This application is for educational and informational purposes only.
                        It is NOT financial advice. Trading carries significant risk of loss.
                        Never invest money you cannot afford to lose. Always do your own research
                        and consult with a licensed financial advisor before making any investment decisions.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.padding,
    },
    title: {
        fontSize: SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 12,
        marginTop: 16,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: SIZES.md,
        color: COLORS.text,
        marginLeft: 12,
    },
    settingValue: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    riskOptions: {
        padding: SIZES.padding,
    },
    riskOption: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    riskOptionActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    riskOptionText: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    riskOptionTextActive: {
        color: COLORS.primary,
    },
    riskDetail: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    disclaimer: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginTop: 24,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
    },
    disclaimerTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.warning,
        marginBottom: 8,
    },
    disclaimerText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    thresholdSection: {
        padding: SIZES.padding,
        paddingTop: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    subSectionTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 12,
        marginTop: 8,
    },
    thresholdOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    thresholdOption: {
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    thresholdOptionActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    thresholdText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    thresholdTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    testButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
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
        color: COLORS.warning,
        marginLeft: 8,
        flex: 1,
    },
});
