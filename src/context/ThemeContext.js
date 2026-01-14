import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme';
import StorageService from '../services/StorageService';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
    const [theme, setTheme] = useState(isDarkMode ? DARK_THEME : LIGHT_THEME);

    useEffect(() => {
        loadTheme();
    }, []);

    useEffect(() => {
        setTheme(isDarkMode ? DARK_THEME : LIGHT_THEME);
    }, [isDarkMode]);

    const loadTheme = async () => {
        const settings = await StorageService.getSettings();
        if (settings && settings.darkMode !== undefined) {
            setIsDarkMode(settings.darkMode);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        const settings = await StorageService.getSettings() || {};
        await StorageService.saveSettings({
            ...settings,
            darkMode: newMode,
        });
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
