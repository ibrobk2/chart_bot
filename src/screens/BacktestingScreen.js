import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart2, PieChart, TrendingUp, TrendingDown, Target, Brain } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants';
import BacktestingService from '../services/BacktestingService';

const { width } = Dimensions.get('window');

export default function BacktestingScreen() {
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
            <SafeAreaView style={styles.container}>
                <View style={[styles.container, styles.center]}>
                    <Text style={styles.loadingText}>Loading analytics...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
        <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Icon color={color} size={24} />
            </View>
            <View style={styles.statInfo}>
                <Text style={styles.statLabel}>{title}</Text>
                <Text style={styles.statValue}>{value}</Text>
                {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                <Text style={styles.title}>Performance Analytics</Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Analyses"
                        value={stats?.totalAnalyses || 0}
                        icon={BarChart2}
                        color={COLORS.primary}
                    />
                    <StatCard
                        title="Avg. Confidence"
                        value={`${stats?.avgConfidence || 0}%`}
                        icon={Brain}
                        color={COLORS.accent}
                    />
                    <StatCard
                        title="Win Rate"
                        value={`${stats?.winRate || 0}%`}
                        subValue="Estimated"
                        icon={Target}
                        color={COLORS.secondary}
                    />
                </View>

                <Text style={styles.sectionTitle}>Signal Distribution</Text>
                <View style={styles.chartCard}>
                    <View style={styles.distRow}>
                        <View style={styles.distItem}>
                            <TrendingUp color={COLORS.buy} size={20} />
                            <Text style={styles.distLabel}>BUY</Text>
                            <Text style={[styles.distValue, { color: COLORS.buy }]}>
                                {stats?.signalDistribution.BUY || 0}
                            </Text>
                        </View>
                        <View style={styles.distItem}>
                            <TrendingDown color={COLORS.sell} size={20} />
                            <Text style={styles.distLabel}>SELL</Text>
                            <Text style={[styles.distValue, { color: COLORS.sell }]}>
                                {stats?.signalDistribution.SELL || 0}
                            </Text>
                        </View>
                        <View style={styles.distItem}>
                            <PieChart color={COLORS.hold} size={20} />
                            <Text style={styles.distLabel}>HOLD</Text>
                            <Text style={[styles.distValue, { color: COLORS.hold }]}>
                                {stats?.signalDistribution.HOLD || 0}
                            </Text>
                        </View>
                    </View>

                    {/* Simplified Bar Chart visualization */}
                    <View style={styles.barContainer}>
                        {stats?.totalAnalyses > 0 ? (
                            <>
                                <View style={[styles.bar, {
                                    flex: stats.signalDistribution.BUY,
                                    backgroundColor: COLORS.buy,
                                    borderTopLeftRadius: 4, borderBottomLeftRadius: 4
                                }]} />
                                <View style={[styles.bar, {
                                    flex: stats.signalDistribution.SELL,
                                    backgroundColor: COLORS.sell
                                }]} />
                                <View style={[styles.bar, {
                                    flex: stats.signalDistribution.HOLD,
                                    backgroundColor: COLORS.hold,
                                    borderTopRightRadius: 4, borderBottomRightRadius: 4
                                }]} />
                            </>
                        ) : (
                            <View style={[styles.bar, { flex: 1, backgroundColor: COLORS.surfaceLight }]} />
                        )}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Top Performing Patterns</Text>
                <View style={styles.patternsCard}>
                    {stats?.topPatterns.length > 0 ? (
                        stats.topPatterns.map((pattern, index) => (
                            <View key={index} style={styles.patternItem}>
                                <Text style={styles.patternName}>{pattern.name}</Text>
                                <View style={styles.patternRight}>
                                    <Text style={styles.patternCount}>{pattern.count} times</Text>
                                    <View style={styles.miniBarContainer}>
                                        <View style={[styles.miniBar, {
                                            width: `${(pattern.count / stats.totalAnalyses) * 100}%`
                                        }]} />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No patterns detected yet</Text>
                    )}
                </View>

                <View style={styles.infoCard}>
                    <Brain color={COLORS.primary} size={24} />
                    <Text style={styles.infoText}>
                        Analytics are based on your total analysis history. Use the Mark Outcome feature
                        in History to track actual trade results for more accurate metrics.
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
        color: COLORS.text,
        marginBottom: 24,
    },
    loadingText: {
        color: COLORS.textSecondary,
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
        backgroundColor: COLORS.surface,
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
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statSubValue: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
    },
    chartCard: {
        backgroundColor: COLORS.surface,
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
        color: COLORS.textSecondary,
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
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 6,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
    },
    patternsCard: {
        backgroundColor: COLORS.surface,
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
        borderBottomColor: COLORS.border,
    },
    patternName: {
        fontSize: SIZES.md,
        color: COLORS.text,
        flex: 1,
    },
    patternRight: {
        alignItems: 'flex-end',
        flex: 1,
    },
    patternCount: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    miniBarContainer: {
        width: 80,
        height: 4,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 2,
    },
    miniBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
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
        color: COLORS.textSecondary,
        marginLeft: 12,
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 20,
        color: COLORS.textSecondary,
        fontSize: SIZES.md,
    },
});
