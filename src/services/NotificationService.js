import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import StorageService from './StorageService';
import { NOTIFICATION_THRESHOLDS } from '../constants/patterns';

/**
 * Notification Service
 * 
 * Handles push notifications/alerts for strong trading signals
 */

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

class NotificationService {
    /**
     * Request permissions for notifications
     */
    async requestPermissions() {
        if (Platform.OS === 'web') return false;

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
        if (!(await this.isEnabled())) return;

        const threshold = await this.getThreshold();
        if (signal.confidence < threshold) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `🔥 Strong ${signal.action} Signal!`,
                body: `Confidence: ${signal.confidence}% - ${signal.reasoning.substring(0, 50)}...`,
                data: { signal },
            },
            trigger: null, // Send immediately
        });
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
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Chart Bot Alert Test",
                body: "This is a test notification from your trading assistant.",
            },
            trigger: null,
        });
    }
}

export default new NotificationService();
