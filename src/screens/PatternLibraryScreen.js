import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react-native';
import { COLORS, SIZES, PATTERNS } from '../constants';

export default function PatternLibraryScreen({ navigation }) {
    const renderPatternSection = (title, patterns, type, icon) => {
        const IconComponent = icon;
        const color = type === 'bullish' ? COLORS.buy :
            type === 'bearish' ? COLORS.sell : COLORS.hold;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <IconComponent color={color} size={24} />
                    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
                </View>

                {patterns.map((pattern, index) => (
                    <TouchableOpacity
                        key={pattern.id}
                        style={styles.patternCard}
                        onPress={() => {/* Navigate to pattern detail */ }}
                    >
                        <View style={[styles.patternIndicator, { backgroundColor: color }]} />
                        <View style={styles.patternContent}>
                            <Text style={styles.patternName}>{pattern.name}</Text>
                            <Text style={styles.patternDescription} numberOfLines={2}>
                                {pattern.description}
                            </Text>
                        </View>
                        <ChevronRight color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Pattern Library</Text>
                <Text style={styles.subtitle}>
                    Learn about common candlestick patterns and their trading implications
                </Text>

                {renderPatternSection('Bullish Patterns', PATTERNS.bullish, 'bullish', TrendingUp)}
                {renderPatternSection('Bearish Patterns', PATTERNS.bearish, 'bearish', TrendingDown)}
                {renderPatternSection('Neutral Patterns', PATTERNS.neutral, 'neutral', Minus)}

                <View style={styles.educationCard}>
                    <Text style={styles.educationTitle}>📚 Trading Education</Text>
                    <Text style={styles.educationText}>
                        Candlestick patterns are visual representations of price movements. While they can
                        provide valuable insights, they should never be used in isolation. Always combine
                        pattern analysis with other technical indicators, volume analysis, and proper
                        risk management strategies.
                    </Text>
                </View>

                <View style={styles.disclaimer}>
                    <Text style={styles.disclaimerText}>
                        ⚠️ Pattern recognition is not a guarantee of future price movement.
                        Past performance does not predict future results.
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: 24,
        lineHeight: 22,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        marginLeft: 8,
    },
    patternCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 8,
    },
    patternIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
    },
    patternContent: {
        flex: 1,
        marginLeft: 12,
    },
    patternName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    patternDescription: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    educationCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.info,
    },
    educationTitle: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    educationText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    disclaimer: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
    },
    disclaimerText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});
