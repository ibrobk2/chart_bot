import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import StorageService from './StorageService';
import { NOTIFICATION_THRESHOLDS } from '../constants/patterns';

// Environment detection
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = Platform.OS === 'android';
const shouldSkipNotifications = isAndroid && isExpoGo;

// Mock notifications object to avoid library loading in Expo Go
let Notifications = {
    setNotificationHandler: () => { },
    getPermissionsAsync: async () => ({ status: 'undetermined' }),
    requestPermissionsAsync: async () => ({ status: 'undetermined' }),
    scheduleNotificationAsync: async () => { },
    cancelAllScheduledNotificationsAsync: async () => { },
};

// Only require the real library if NOT in the restricted Expo Go environment
if (!shouldSkipNotifications && Platform.OS !== 'web') {
    try {
        Notifications = require('expo-notifications');
    } catch (error) {
        console.warn('Failed to load expo-notifications:', error);
    }
}

/**
 * Notification Service
 * 
 * Handles push notifications/alerts for strong trading signals
 */

if (!shouldSkipNotifications && Platform.OS !== 'web') {
    try {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    } catch (error) {
        console.warn('Failed to set notification handler:', error);
    }
}

class NotificationService {
    /**
     * Request permissions for notifications
     */
    async requestPermissions() {
        if (Platform.OS === 'web' || shouldSkipNotifications) {
            console.log('Notifications skipped in this environment (Web or Expo Go Android)');
            return false;
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return false;
            }

            return true;
        } catch (error) {
            console.warn('Error requesting notification permissions:', error);
            return false;
        }
    }

    /**
     * Check if notifications are enabled in settings
     */
    async isEnabled() {
        const settings = await StorageService.getSettings();
        return settings?.notificationsEnabled !== false; // Default to true
    }

    /**
     * Send a local notification for a signal
     * @param {Object} signal - The generated signal
     */
    async sendSignalAlert(signal) {
        if (shouldSkipNotifications || !(await this.isEnabled())) return;

        const threshold = await this.getThreshold();
        if (signal.confidence < threshold) return;

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `🔥 Strong ${signal.action} Signal!`,
                    body: `Confidence: ${signal.confidence}% - ${signal.reasoning.substring(0, 50)}...`,
                    data: { signal },
                },
                trigger: null, // Send immediately
            });
        } catch (error) {
            console.warn('Failed to send signal alert notification:', error);
        }
    }

    /**
     * Get notification threshold from settings
     */
    async getThreshold() {
        const settings = await StorageService.getSettings();
        return settings?.notificationThreshold || NOTIFICATION_THRESHOLDS.HIGH;
    }

    /**
     * Send a test notification
     */
    async sendTestNotification() {
        if (shouldSkipNotifications) {
            console.log('Test notification skipped in Expo Go Android');
            return;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Chart Bot Alert Test",
                    body: "This is a test notification from your trading assistant.",
                },
                trigger: null,
            });
        } catch (error) {
            console.warn('Failed to send test notification:', error);
        }
    }

    /**
     * Utility to check if notifications are disabled due to environment
     */
    isEnvironmentDisabled() {
        return shouldSkipNotifications;
    }
}

export default new NotificationService();
