import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Minus, Clock, Trash2 } from 'lucide-react-native';
import { COLORS, SIZES, SIGNAL_TYPES } from '../constants';
import StorageService from '../services/StorageService';

export default function HistoryScreen({ navigation }) {
    const [history, setHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const data = await StorageService.getHistory();
            setHistory(data.reverse()); // Most recent first
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }, []);

    useEffect(() => {
        loadHistory();

        // Refresh when screen comes into focus
        const unsubscribe = navigation.addListener('focus', loadHistory);
        return unsubscribe;
    }, [navigation, loadHistory]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    }, [loadHistory]);

    const clearHistory = async () => {
        await StorageService.clearHistory();
        setHistory([]);
    };

    const getSignalIcon = (signalType) => {
        switch (signalType) {
            case SIGNAL_TYPES.BUY:
                return <TrendingUp color={COLORS.buy} size={20} />;
            case SIGNAL_TYPES.SELL:
                return <TrendingDown color={COLORS.sell} size={20} />;
            default:
                return <Minus color={COLORS.hold} size={20} />;
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

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.historyCard}
            onPress={() => navigation.navigate('Analysis', {
                imageUri: item.imageUri,
                existingResult: item
            })}
        >
            <View style={styles.thumbnailContainer}>
                <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
            </View>

            <View style={styles.cardContent}>
                <View style={styles.signalRow}>
                    {getSignalIcon(item.signal.action)}
                    <Text style={[styles.signalText, { color: getSignalColor(item.signal.action) }]}>
                        {item.signal.action}
                    </Text>
                    <View style={styles.confidenceBadge}>
                        <Text style={styles.confidenceText}>{item.signal.confidence}%</Text>
                    </View>
                </View>

                <Text style={styles.patternCount}>
                    {item.patterns.length} pattern{item.patterns.length !== 1 ? 's' : ''} detected
                </Text>

                <View style={styles.timeRow}>
                    <Clock color={COLORS.textSecondary} size={14} />
                    <Text style={styles.timeText}>{formatDate(item.timestamp)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Clock color={COLORS.textSecondary} size={64} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptySubtitle}>
                Your analyzed charts will appear here
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>
                <View style={styles.headerActions}>
                    {history.length > 0 && (
                        <>
                            <TouchableOpacity
                                onPress={() => ExportService.exportHistoryToCSV(history)}
                                style={styles.headerButton}
                            >
                                <Share2 color={COLORS.primary} size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={clearHistory} style={styles.headerButton}>
                                <Trash2 color={COLORS.error} size={20} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        marginLeft: 16,
        padding: 4,
    },
    listContent: {
        padding: SIZES.padding,
        flexGrow: 1,
    },
    historyCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: 12,
        marginBottom: 12,
    },
    thumbnailContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: COLORS.surfaceLight,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    signalRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signalText: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    confidenceBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    confidenceText: {
        fontSize: SIZES.xs,
        fontWeight: '600',
        color: COLORS.text,
    },
    patternCount: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
});
