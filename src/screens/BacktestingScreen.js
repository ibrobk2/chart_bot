import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart2, PieChart, TrendingUp, TrendingDown, Target, Brain } from 'lucide-react-native';
import { SIZES } from '../constants';
import BacktestingService from '../services/BacktestingService';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function BacktestingScreen() {
    const { theme, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await BacktestingService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.container, styles.center]}>
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading analytics...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Icon color={color} size={24} />
            </View>
            <View style={styles.statInfo}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{title}</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
                {subValue && <Text style={[styles.statSubValue, { color: theme.textSecondary }]}>{subValue}</Text>}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
            >
                <Text style={[styles.title, { color: theme.text }]}>Performance Analytics</Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Analyses"
                        value={stats?.totalAnalyses || 0}
                        icon={BarChart2}
                        color={theme.primary}
                    />
                    <StatCard
                        title="Avg. Confidence"
                        value={`${stats?.avgConfidence || 0}%`}
                        icon={Brain}
                        color={theme.accent}
                    />
                    <StatCard
                        title="Win Rate"
                        value={`${stats?.winRate || 0}%`}
                        subValue="Estimated"
                        icon={Target}
                        color={theme.buy}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Signal Distribution</Text>
                <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.distRow}>
                        <View style={styles.distItem}>
                            <TrendingUp color={theme.buy} size={20} />
                            <Text style={[styles.distLabel, { color: theme.textSecondary }]}>BUY</Text>
                            <Text style={[styles.distValue, { color: theme.buy }]}>
                                {stats?.signalDistribution.BUY || 0}
                            </Text>
                        </View>
                        <View style={styles.distItem}>
                            <TrendingDown color={theme.sell} size={20} />
                            <Text style={[styles.distLabel, { color: theme.textSecondary }]}>SELL</Text>
                            <Text style={[styles.distValue, { color: theme.sell }]}>
                                {stats?.signalDistribution.SELL || 0}
                            </Text>
                        </View>
                        <View style={styles.distItem}>
                            <PieChart color={theme.hold} size={20} />
                            <Text style={[styles.distLabel, { color: theme.textSecondary }]}>HOLD</Text>
                            <Text style={[styles.distValue, { color: theme.hold }]}>
                                {stats?.signalDistribution.HOLD || 0}
                            </Text>
                        </View>
                    </View>

                    {/* Simplified Bar Chart visualization */}
                    <View style={[styles.barContainer, { backgroundColor: theme.surfaceLight }]}>
                        {stats?.totalAnalyses > 0 ? (
                            <>
                                <View style={[styles.bar, {
                                    flex: stats.signalDistribution.BUY,
                                    backgroundColor: theme.buy,
                                    borderTopLeftRadius: 4, borderBottomLeftRadius: 4
                                }]} />
                                <View style={[styles.bar, {
                                    flex: stats.signalDistribution.SELL,
                                    backgroundColor: theme.sell
                                }]} />
                                <View style={[styles.bar, {
                                    flex: stats.signalDistribution.HOLD,
                                    backgroundColor: theme.hold,
                                    borderTopRightRadius: 4, borderBottomRightRadius: 4
                                }]} />
                            </>
                        ) : (
                            <View style={[styles.bar, { flex: 1, backgroundColor: theme.surfaceLight }]} />
                        )}
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Performing Patterns</Text>
                <View style={[styles.patternsCard, { backgroundColor: theme.surface }]}>
                    {stats?.topPatterns.length > 0 ? (
                        stats.topPatterns.map((pattern, index) => (
                            <View key={index} style={[styles.patternItem, { borderBottomColor: theme.border }]}>
                                <Text style={[styles.patternName, { color: theme.text }]}>{pattern.name}</Text>
                                <View style={styles.patternRight}>
                                    <Text style={[styles.patternCount, { color: theme.textSecondary }]}>{pattern.count} times</Text>
                                    <View style={[styles.miniBarContainer, { backgroundColor: theme.surfaceLight }]}>
                                        <View style={[styles.miniBar, {
                                            width: `${(pattern.count / (stats.totalAnalyses || 1)) * 100}%`,
                                            backgroundColor: theme.primary
                                        }]} />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No patterns detected yet</Text>
                    )}
                </View>

                <View style={[styles.infoCard, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }]}>
                    <Brain color={theme.primary} size={24} />
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                        Analytics are based on your total analysis history. Use history to track actual results.
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: SIZES.padding,
    },
    title: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    loadingText: {
        fontSize: SIZES.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: (width - SIZES.padding * 2 - 12) / 2,
        borderRadius: SIZES.radius,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: SIZES.xs,
        marginBottom: 4,
    },
    statValue: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
    },
    statSubValue: {
        fontSize: 10,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        marginBottom: 12,
    },
    chartCard: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 24,
    },
    distRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    distItem: {
        alignItems: 'center',
    },
    distLabel: {
        fontSize: SIZES.xs,
        marginTop: 4,
    },
    distValue: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        marginTop: 2,
    },
    barContainer: {
        height: 12,
        flexDirection: 'row',
        borderRadius: 6,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
    },
    patternsCard: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 24,
    },
    patternItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    patternName: {
        fontSize: SIZES.md,
        flex: 1,
    },
    patternRight: {
        alignItems: 'flex-end',
        flex: 1,
    },
    patternCount: {
        fontSize: SIZES.sm,
        marginBottom: 4,
    },
    miniBarContainer: {
        width: 80,
        height: 4,
        borderRadius: 2,
    },
    miniBar: {
        height: '100%',
        borderRadius: 2,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        alignItems: 'center',
        marginBottom: 32,
    },
    infoText: {
        flex: 1,
        fontSize: SIZES.sm,
        marginLeft: 12,
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 20,
        fontSize: SIZES.md,
    },
});
