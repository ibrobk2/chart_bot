import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Shield, Share2 } from 'lucide-react-native';
import { SIZES, SIGNAL_TYPES, CONFIDENCE_LEVELS, RISK_LEVELS } from '../constants';
import PatternRecognitionService from '../services/PatternRecognitionService';
import SignalEngine from '../services/SignalEngine';
import NotificationService from '../services/NotificationService';
import StorageService from '../services/StorageService';
import ExportService from '../services/ExportService';
import { useTheme } from '../context/ThemeContext';

export default function AnalysisScreen({ route, navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { imageUri, existingResult } = route.params;
    const [loading, setLoading] = useState(!existingResult);
    const [result, setResult] = useState(existingResult || null);

    useEffect(() => {
        if (!existingResult) {
            analyzeChart();
        }
    }, [existingResult]);

    const analyzeChart = async () => {
        try {
            setLoading(true);

            // Simulate pattern recognition
            const patterns = await PatternRecognitionService.detectPatterns(imageUri);

            // Generate signal based on patterns
            const signal = SignalEngine.generateSignal(patterns);

            const analysisResult = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                imageUri,
                patterns,
                signal,
            };

            setResult(analysisResult);

            // Save to history
            await StorageService.saveAnalysis(analysisResult);

            // Trigger notification for strong signals
            if (signal.action !== SIGNAL_TYPES.HOLD) {
                await NotificationService.sendSignalAlert(signal);
            }

        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSignalIcon = (signalType) => {
        switch (signalType) {
            case SIGNAL_TYPES.BUY:
                return <TrendingUp color={theme.buy} size={32} />;
            case SIGNAL_TYPES.SELL:
                return <TrendingDown color={theme.sell} size={32} />;
            default:
                return <Minus color={theme.hold} size={32} />;
        }
    };

    const getSignalColor = (signalType) => {
        switch (signalType) {
            case SIGNAL_TYPES.BUY:
                return theme.buy;
            case SIGNAL_TYPES.SELL:
                return theme.sell;
            default:
                return theme.hold;
        }
    };

    const getConfidenceConfig = (confidence) => {
        if (confidence >= CONFIDENCE_LEVELS.HIGH.min) return { ...CONFIDENCE_LEVELS.HIGH, color: theme.buy };
        if (confidence >= CONFIDENCE_LEVELS.MEDIUM.min) return { ...CONFIDENCE_LEVELS.MEDIUM, color: theme.warning };
        return { ...CONFIDENCE_LEVELS.LOW, color: theme.error };
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.text }]}>Analyzing chart...</Text>
                    <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>Detecting candlestick patterns</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!result) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.errorContainer}>
                    <AlertTriangle color={theme.error} size={48} />
                    <Text style={[styles.errorText, { color: theme.text }]}>Analysis Failed</Text>
                    <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>Unable to analyze the chart. Please try again.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const { patterns, signal } = result;
    const confidenceConfig = getConfidenceConfig(signal.confidence);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Chart Preview */}
                <View style={[styles.imageContainer, { backgroundColor: theme.surface }]}>
                    <Image source={{ uri: imageUri }} style={styles.chartImage} />
                </View>

                {/* Signal Card */}
                <View style={[styles.signalCard, {
                    borderColor: getSignalColor(signal.action),
                    backgroundColor: theme.surface
                }]}>
                    <View style={styles.signalHeader}>
                        {getSignalIcon(signal.action)}
                        <View style={styles.signalInfo}>
                            <Text style={[styles.signalAction, { color: getSignalColor(signal.action) }]}>
                                {signal.action}
                            </Text>
                            <Text style={[styles.signalLabel, { color: theme.textSecondary }]}>Trading Signal</Text>
                        </View>
                    </View>

                    {/* Confidence Bar */}
                    <View style={styles.confidenceSection}>
                        <View style={styles.confidenceHeader}>
                            <Text style={[styles.confidenceLabel, { color: theme.textSecondary }]}>Confidence</Text>
                            <Text style={[styles.confidenceValue, { color: confidenceConfig.color }]}>
                                {signal.confidence}% ({confidenceConfig.label})
                            </Text>
                        </View>
                        <View style={[styles.confidenceBar, { backgroundColor: theme.surfaceLight }]}>
                            <View
                                style={[
                                    styles.confidenceFill,
                                    { width: `${signal.confidence}%`, backgroundColor: confidenceConfig.color }
                                ]}
                            />
                        </View>
                    </View>

                    {/* Reasoning */}
                    <View style={[styles.reasoningContainer, { borderTopColor: theme.border }]}>
                        <Text style={[styles.reasoningText, { color: theme.text }]}>{signal.reasoning}</Text>
                    </View>
                </View>

                {/* Technical Indicators */}
                {signal.indicators && (
                    <>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Technical Indicators</Text>
                        <View style={[styles.indicatorsContainer, { backgroundColor: theme.surface }]}>
                            <View style={styles.indicatorRow}>
                                <View style={styles.indicatorItem}>
                                    <Text style={[styles.indicatorLabel, { color: theme.textSecondary }]}>RSI (14)</Text>
                                    <Text style={[styles.indicatorValue, {
                                        color: signal.indicators.rsi.signal === 'bullish' ? theme.buy :
                                            signal.indicators.rsi.signal === 'bearish' ? theme.sell : theme.text
                                    }]}>
                                        {signal.indicators.rsi.value}
                                    </Text>
                                    <Text style={[styles.indicatorSubtext, { color: theme.textSecondary }]}>{signal.indicators.rsi.zone}</Text>
                                </View>
                                <View style={styles.indicatorItem}>
                                    <Text style={[styles.indicatorLabel, { color: theme.textSecondary }]}>MACD</Text>
                                    <Text style={[styles.indicatorValue, {
                                        color: signal.indicators.macd.signal === 'bullish' ? theme.buy :
                                            signal.indicators.macd.signal === 'bearish' ? theme.sell : theme.text
                                    }]}>
                                        {signal.indicators.macd.histogram > 0 ? '+' : ''}{signal.indicators.macd.histogram}
                                    </Text>
                                    <Text style={[styles.indicatorSubtext, { color: theme.textSecondary }]}>{signal.indicators.macd.signal}</Text>
                                </View>
                            </View>

                            <View style={styles.indicatorRow}>
                                <View style={styles.indicatorItem}>
                                    <Text style={[styles.indicatorLabel, { color: theme.textSecondary }]}>Bollinger Bands</Text>
                                    <Text style={[styles.indicatorValue, { color: theme.text }]}>
                                        {signal.indicators.bollingerBands.bandwidth}%
                                    </Text>
                                    <Text style={[styles.indicatorSubtext, { color: theme.textSecondary }]}>{signal.indicators.bollingerBands.position}</Text>
                                </View>
                                <View style={styles.indicatorItem}>
                                    <Text style={[styles.indicatorLabel, { color: theme.textSecondary }]}>Stochastic</Text>
                                    <Text style={[styles.indicatorValue, {
                                        color: signal.indicators.stochastic.signal === 'bullish' ? theme.buy :
                                            signal.indicators.stochastic.signal === 'bearish' ? theme.sell : theme.text
                                    }]}>
                                        {signal.indicators.stochastic.k.toFixed(0)}/{signal.indicators.stochastic.d.toFixed(0)}
                                    </Text>
                                    <Text style={[styles.indicatorSubtext, { color: theme.textSecondary }]}>{signal.indicators.stochastic.zone}</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* Detected Patterns */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Detected Patterns</Text>
                <View style={[styles.patternsContainer, { backgroundColor: theme.surface }]}>
                    {patterns.length > 0 ? (
                        patterns.map((pattern, index) => (
                            <View key={index} style={[styles.patternCard, { borderBottomColor: theme.border }]}>
                                <View style={[styles.patternIndicator, {
                                    backgroundColor: pattern.type === 'bullish' ? theme.buy :
                                        pattern.type === 'bearish' ? theme.sell : theme.hold
                                }]} />
                                <View style={styles.patternInfo}>
                                    <Text style={[styles.patternName, { color: theme.text }]}>{pattern.name}</Text>
                                    <Text style={[styles.patternType, { color: theme.textSecondary }]}>{pattern.type}</Text>
                                </View>
                                <Text style={[styles.patternConfidence, { color: theme.primary }]}>{pattern.confidence}%</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.noPatterns, { color: theme.textSecondary }]}>No clear patterns detected</Text>
                    )}
                </View>

                {/* Risk Management */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Risk Management</Text>
                <View style={styles.riskContainer}>
                    <View style={[styles.riskCard, { backgroundColor: theme.surface }]}>
                        <Shield color={theme.error} size={24} />
                        <View style={styles.riskInfo}>
                            <Text style={[styles.riskLabel, { color: theme.textSecondary }]}>Stop Loss</Text>
                            <Text style={[styles.riskValue, { color: theme.text }]}>{signal.stopLoss}%</Text>
                        </View>
                    </View>
                    <View style={[styles.riskCard, { backgroundColor: theme.surface }]}>
                        <Target color={theme.success} size={24} />
                        <View style={styles.riskInfo}>
                            <Text style={[styles.riskLabel, { color: theme.textSecondary }]}>Take Profit</Text>
                            <Text style={[styles.riskValue, { color: theme.text }]}>{signal.takeProfit}%</Text>
                        </View>
                    </View>
                </View>

                {/* Disclaimer */}
                <View style={[styles.disclaimer, { backgroundColor: theme.surface, borderLeftColor: theme.warning }]}>
                    <AlertTriangle color={theme.warning} size={16} />
                    <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
                        This is not financial advice. Past performance does not guarantee future results.
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
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    topTitle: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
    },
    exportButton: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        marginTop: 24,
    },
    loadingSubtext: {
        fontSize: SIZES.md,
        marginTop: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding * 2,
    },
    errorText: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        marginTop: 16,
    },
    errorSubtext: {
        fontSize: SIZES.md,
        marginTop: 8,
        textAlign: 'center',
    },
    imageContainer: {
        height: 200,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        marginBottom: 16,
    },
    chartImage: {
        flex: 1,
        resizeMode: 'contain',
    },
    signalCard: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 24,
        borderWidth: 2,
    },
    signalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    signalInfo: {
        marginLeft: 16,
    },
    signalAction: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
    },
    signalLabel: {
        fontSize: SIZES.sm,
    },
    confidenceSection: {
        marginTop: 8,
    },
    confidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    confidenceLabel: {
        fontSize: SIZES.md,
    },
    confidenceValue: {
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    confidenceBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    confidenceFill: {
        height: '100%',
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        marginBottom: 12,
    },
    patternsContainer: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 24,
    },
    patternCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    patternIndicator: {
        width: 4,
        height: 32,
        borderRadius: 2,
    },
    patternInfo: {
        flex: 1,
        marginLeft: 12,
    },
    patternName: {
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    patternType: {
        fontSize: SIZES.sm,
        textTransform: 'capitalize',
    },
    patternConfidence: {
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    noPatterns: {
        fontSize: SIZES.md,
        textAlign: 'center',
        paddingVertical: 16,
    },
    riskContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    riskCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: 4,
    },
    riskInfo: {
        marginLeft: 12,
    },
    riskLabel: {
        fontSize: SIZES.sm,
    },
    riskValue: {
        fontSize: SIZES.lg,
        fontWeight: '600',
    },
    rrContainer: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rrLabel: {
        fontSize: SIZES.md,
    },
    rrValue: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
    },
    disclaimer: {
        flexDirection: 'row',
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        borderLeftWidth: 4,
    },
    disclaimerText: {
        flex: 1,
        fontSize: SIZES.sm,
        marginLeft: 12,
        lineHeight: 20,
    },
    reasoningContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    reasoningText: {
        fontSize: SIZES.md,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    indicatorsContainer: {
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 24,
    },
    indicatorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    indicatorItem: {
        flex: 1,
        alignItems: 'center',
    },
    indicatorLabel: {
        fontSize: SIZES.xs,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    indicatorValue: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
    },
    indicatorSubtext: {
        fontSize: SIZES.xs,
        marginTop: 2,
        textTransform: 'capitalize',
    },
});
