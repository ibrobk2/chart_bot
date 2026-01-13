import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, TrendingUp, History, AlertCircle, Activity } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants';

export default function HomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logo}
                        />
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Chart Bot</Text>
                            <Text style={styles.subtitle}>AI Candlestick Analysis</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Scans Today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>--</Text>
                        <Text style={styles.statLabel}>Win Rate</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Signals</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('Capture')}
                    >
                        <Camera color={COLORS.text} size={32} />
                        <Text style={styles.actionText}>Capture Chart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: COLORS.secondary }]}
                        onPress={() => navigation.navigate('History')}
                    >
                        <History color={COLORS.text} size={32} />
                        <Text style={styles.actionText}>View History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: COLORS.accent }]}
                        onPress={() => navigation.navigate('BacktestingTab')}
                    >
                        <Activity color={COLORS.text} size={32} />
                        <Text style={styles.actionText}>Analytics</Text>
                    </TouchableOpacity>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerCard}>
                    <AlertCircle color={COLORS.warning} size={20} />
                    <Text style={styles.disclaimerText}>
                        This app is for educational purposes only. Trading involves significant risk of loss.
                        Always practice proper risk management.
                    </Text>
                </View>

                {/* Recent Activity */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.emptyState}>
                    <TrendingUp color={COLORS.textSecondary} size={48} />
                    <Text style={styles.emptyText}>No recent scans</Text>
                    <Text style={styles.emptySubtext}>Capture your first chart to get started</Text>
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
    header: {
        marginBottom: 32,
        marginTop: 8,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    actionCard: {
        flex: 1,
        borderRadius: SIZES.radius,
        padding: 20,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 8,
    },
    disclaimerCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: 24,
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
    emptyState: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
});
