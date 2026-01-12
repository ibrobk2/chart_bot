import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Shield } from 'lucide-react-native';
import { COLORS, SIZES, SIGNAL_TYPES, CONFIDENCE_LEVELS, RISK_LEVELS } from '../constants';
import PatternRecognitionService from '../services/PatternRecognitionService';
import SignalEngine from '../services/SignalEngine';
import StorageService from '../services/StorageService';

export default function AnalysisScreen({ route, navigation }) {
    const { imageUri } = route.params;
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        analyzeChart();
    }, []);

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

        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSignalIcon = (signalType) => {
        switch (signalType) {
            case SIGNAL_TYPES.BUY:
                return <TrendingUp color={COLORS.buy} size={32} />;
            case SIGNAL_TYPES.SELL:
                return <TrendingDown color={COLORS.sell} size={32} />;
            default:
                return <Minus color={COLORS.hold} size={32} />;
        }
    };

    const getSignalColor = (signalType) => {
        switch (signalType) {
            case SIGNAL_TYPES.BUY:
                return COLORS.buy;
            case SIGNAL_TYPES.SELL:
                return COLORS.sell;
            default:
                return COLORS.hold;
        }
    };

    const getConfidenceConfig = (confidence) => {
        if (confidence >= CONFIDENCE_LEVELS.HIGH.min) return CONFIDENCE_LEVELS.HIGH;
        if (confidence >= CONFIDENCE_LEVELS.MEDIUM.min) return CONFIDENCE_LEVELS.MEDIUM;
        return CONFIDENCE_LEVELS.LOW;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Analyzing chart...</Text>
                    <Text style={styles.loadingSubtext}>Detecting candlestick patterns</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!result) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <AlertTriangle color={COLORS.error} size={48} />
                    <Text style={styles.errorText}>Analysis Failed</Text>
                    <Text style={styles.errorSubtext}>Unable to analyze the chart. Please try again.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const { patterns, signal } = result;
    const confidenceConfig = getConfidenceConfig(signal.confidence);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Chart Preview */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.chartImage} />
                </View>

                {/* Signal Card */}
                <View style={[styles.signalCard, { borderColor: getSignalColor(signal.action) }]}>
                    <View style={styles.signalHeader}>
                        {getSignalIcon(signal.action)}
                        <View style={styles.signalInfo}>
                            <Text style={[styles.signalAction, { color: getSignalColor(signal.action) }]}>
                                {signal.action}
                            </Text>
                            <Text style={styles.signalLabel}>Trading Signal</Text>
                        </View>
                    </View>

                    {/* Confidence Bar */}
                    <View style={styles.confidenceSection}>
                        <View style={styles.confidenceHeader}>
                            <Text style={styles.confidenceLabel}>Confidence</Text>
                            <Text style={[styles.confidenceValue, { color: confidenceConfig.color }]}>
                                {signal.confidence}% ({confidenceConfig.label})
                            </Text>
                        </View>
                        <View style={styles.confidenceBar}>
                            <View
                                style={[
                                    styles.confidenceFill,
                                    { width: `${signal.confidence}%`, backgroundColor: confidenceConfig.color }
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Detected Patterns */}
                <Text style={styles.sectionTitle}>Detected Patterns</Text>
                <View style={styles.patternsContainer}>
                    {patterns.length > 0 ? (
                        patterns.map((pattern, index) => (
                            <View key={index} style={styles.patternCard}>
                                <View style={[styles.patternIndicator, {
                                    backgroundColor: pattern.type === 'bullish' ? COLORS.buy :
                                        pattern.type === 'bearish' ? COLORS.sell : COLORS.hold
                                }]} />
                                <View style={styles.patternInfo}>
                                    <Text style={styles.patternName}>{pattern.name}</Text>
                                    <Text style={styles.patternType}>{pattern.type}</Text>
                                </View>
                                <Text style={styles.patternConfidence}>{pattern.confidence}%</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noPatterns}>No clear patterns detected</Text>
                    )}
                </View>

                {/* Risk Management */}
                <Text style={styles.sectionTitle}>Risk Management</Text>
                <View style={styles.riskContainer}>
                    <View style={styles.riskCard}>
                        <Shield color={COLORS.error} size={24} />
                        <View style={styles.riskInfo}>
                            <Text style={styles.riskLabel}>Stop Loss</Text>
                            <Text style={styles.riskValue}>{signal.stopLoss}%</Text>
                        </View>
                    </View>
                    <View style={styles.riskCard}>
                        <Target color={COLORS.success} size={24} />
                        <View style={styles.riskInfo}>
                            <Text style={styles.riskLabel}>Take Profit</Text>
                            <Text style={styles.riskValue}>{signal.takeProfit}%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.rrContainer}>
                    <Text style={styles.rrLabel}>Risk/Reward Ratio</Text>
                    <Text style={styles.rrValue}>1:{signal.riskRewardRatio}</Text>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <AlertTriangle color={COLORS.warning} size={16} />
                    <Text style={styles.disclaimerText}>
                        This is not financial advice. Past performance does not guarantee future results.
                        Always use proper risk management.
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 24,
    },
    loadingSubtext: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
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
        color: COLORS.text,
        marginTop: 16,
    },
    errorSubtext: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    imageContainer: {
        height: 200,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        marginBottom: 16,
    },
    chartImage: {
        flex: 1,
        resizeMode: 'contain',
    },
    signalCard: {
        backgroundColor: COLORS.surface,
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
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
    },
    confidenceValue: {
        fontSize: SIZES.md,
        fontWeight: '600',
    },
    confidenceBar: {
        height: 8,
        backgroundColor: COLORS.surfaceLight,
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
        color: COLORS.text,
        marginBottom: 12,
    },
    patternsContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 24,
    },
    patternCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
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
        color: COLORS.text,
    },
    patternType: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    patternConfidence: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.primary,
    },
    noPatterns: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
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
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: 4,
    },
    riskInfo: {
        marginLeft: 12,
    },
    riskLabel: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    riskValue: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    rrContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rrLabel: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    rrValue: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    disclaimer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
    },
    disclaimerText: {
        flex: 1,
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginLeft: 12,
        lineHeight: 20,
    },
});
