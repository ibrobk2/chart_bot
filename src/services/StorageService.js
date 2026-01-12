import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    HISTORY: '@chart_analyzer_history',
    SETTINGS: '@chart_analyzer_settings',
};

class StorageService {
    // History Management
    async getHistory() {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    async saveAnalysis(analysis) {
        try {
            const history = await this.getHistory();
            history.push(analysis);
            // Keep only last 50 analyses
            const trimmed = history.slice(-50);
            await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
        } catch (error) {
            console.error('Error saving analysis:', error);
        }
    }

    async clearHistory() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    }

    // Settings Management
    async getSettings() {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting settings:', error);
            return null;
        }
    }

    async saveSettings(settings) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Clear all data
    async clearAll() {
        try {
            await AsyncStorage.multiRemove([STORAGE_KEYS.HISTORY, STORAGE_KEYS.SETTINGS]);
        } catch (error) {
            console.error('Error clearing all data:', error);
        }
    }
}

export default new StorageService();
