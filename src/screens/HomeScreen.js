import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, TrendingUp, History, AlertCircle, Activity, ChevronRight } from 'lucide-react-native';
import { SIZES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import StorageService from '../services/StorageService';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        todayScans: 0,
        winRate: '--',
        totalSignals: 0
    });

    const loadData = async () => {
        const fullHistory = await StorageService.getHistory();
        // Get recent 5 items for the home screen
        const recentHistory = [...fullHistory].reverse().slice(0, 5);
        setHistory(recentHistory);

        // Calculate stats
        const today = new Date().toLocaleDateString();
        const todayScans = fullHistory.filter(item =>
            new Date(item.timestamp).toLocaleDateString() === today
        ).length;

        const signals = fullHistory.filter(item => item.signal && item.signal.action !== 'HOLD');

        // Simple win rate calculation for demonstration (if result exists in some items)
        // For now just showing total signals
        setStats({
            todayScans,
            winRate: signals.length > 0 ? `${Math.round((signals.length / fullHistory.length) * 100)}%` : '--',
            totalSignals: signals.length
        });
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const renderActivityItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.activityItem, { backgroundColor: theme.surfaceLight }]}
            onPress={() => navigation.navigate('Analysis', { analysis: item })}
        >
            <View style={[styles.signalDot, { backgroundColor: theme[item.signal?.action?.toLowerCase()] || theme.primary }]} />
            <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>
                    {item.patterns?.[0]?.name || 'Unknown Pattern'}
                </Text>
                <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <View style={styles.activityMeta}>
                <Text style={[styles.confidenceText, { color: theme.primary }]}>
                    {item.signal?.confidence || 0}%
                </Text>
                <ChevronRight color={theme.textSecondary} size={16} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logo}
                        />
                        <View style={styles.headerText}>
                            <Text style={[styles.title, { color: theme.text }]}>Chart Bot</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>AI Candlestick Analysis</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.todayScans}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Scans Today</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.winRate}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Strength</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalSignals}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Signals</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('Capture')}
                    >
                        <Camera color="#FFFFFF" size={28} />
                        <Text style={styles.actionText}>Capture</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: theme.secondary }]}
                        onPress={() => navigation.navigate('History')}
                    >
                        <History color="#FFFFFF" size={28} />
                        <Text style={styles.actionText}>History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: theme.accent }]}
                        onPress={() => navigation.navigate('BacktestingTab')}
                    >
                        <Activity color="#FFFFFF" size={28} />
                        <Text style={styles.actionText}>Analytics</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Activity */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
                    {history.length > 0 && (
                        <TouchableOpacity onPress={() => navigation.navigate('History')}>
                            <Text style={{ color: theme.primary }}>View All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {history.length > 0 ? (
                    <View style={styles.activityList}>
                        {history.map(renderActivityItem)}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
                        <TrendingUp color={theme.textSecondary} size={48} />
                        <Text style={[styles.emptyText, { color: theme.text }]}>No recent scans</Text>
                        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Capture your first chart to get started</Text>
                    </View>
                )}

                {/* Disclaimer */}
                <View style={[styles.disclaimerCard, { backgroundColor: theme.surface, borderLeftColor: theme.warning }]}>
                    <AlertCircle color={theme.warning} size={20} />
                    <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                        Educational purposes only. Trading involves risk. Practice proper risk management.
                    </Text>
                </View>
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
        paddingBottom: 100, // Bottom space for tab bar
    },
    header: {
        marginBottom: 24,
        marginTop: 8,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 12,
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: SIZES.sm,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: SIZES.xs,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    actionCard: {
        flex: 1,
        borderRadius: SIZES.radius,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: SIZES.sm,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 8,
    },
    disclaimerCard: {
        flexDirection: 'row',
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginTop: 24,
        borderLeftWidth: 4,
    },
    disclaimerText: {
        flex: 1,
        fontSize: SIZES.xs,
        marginLeft: 12,
        lineHeight: 18,
    },
    activityList: {
        gap: 8,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: SIZES.radius,
    },
    signalDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    activityTime: {
        fontSize: SIZES.xs,
        marginTop: 2,
    },
    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    confidenceText: {
        fontSize: SIZES.sm,
        fontWeight: 'bold',
        marginRight: 8,
    },
    emptyState: {
        borderRadius: SIZES.radius,
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: SIZES.md,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: SIZES.sm,
        marginTop: 4,
    },
});

