import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Aperture, X, RotateCcw, Check } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants';

export default function CaptureScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState(null);
    const [facing, setFacing] = useState('back');
    const cameraRef = useRef(null);

    if (!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>Loading camera...</Text>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Aperture color={COLORS.primary} size={64} />
                    <Text style={styles.title}>Camera Permission Needed</Text>
                    <Text style={styles.subtitle}>
                        We need camera access to capture candlestick charts for analysis.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                setCapturedImage(photo.uri);
            } catch (error) {
                Alert.alert('Error', 'Failed to capture image.');
            }
        }
    };

    const retakePicture = () => {
        setCapturedImage(null);
    };

    const analyzeImage = () => {
        // Navigate to analysis screen with the image
        navigation.navigate('Analysis', { imageUri: capturedImage });
        setCapturedImage(null);
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    if (capturedImage) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.previewContainer}>
                    <Image source={{ uri: capturedImage }} style={styles.previewImage} />

                    {/* Overlay Grid */}
                    <View style={styles.overlayGrid}>
                        <View style={styles.gridLine} />
                        <View style={[styles.gridLine, styles.gridLineHorizontal]} />
                    </View>

                    <View style={styles.previewHeader}>
                        <TouchableOpacity style={styles.closeButton} onPress={retakePicture}>
                            <X color={COLORS.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.previewFooter}>
                        <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
                            <RotateCcw color={COLORS.text} size={24} />
                            <Text style={styles.buttonLabel}>Retake</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
                            <Check color={COLORS.text} size={24} />
                            <Text style={styles.buttonLabel}>Analyze</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
            >
                {/* Header */}
                <View style={styles.cameraHeader}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                        <X color={COLORS.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Position chart in frame</Text>
                    <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                        <RotateCcw color={COLORS.text} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Chart Detection Overlay */}
                <View style={styles.chartOverlay}>
                    <View style={styles.chartFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <Text style={styles.overlayHint}>Align candlestick chart within frame</Text>
                </View>

                {/* Capture Button */}
                <View style={styles.cameraFooter}>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    camera: {
        flex: 1,
    },
    text: {
        color: COLORS.text,
        fontSize: SIZES.lg,
        textAlign: 'center',
        marginTop: 100,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.padding * 2,
    },
    title: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 24,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 22,
    },
    permissionButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: SIZES.radius,
        marginTop: 32,
    },
    permissionButtonText: {
        fontSize: SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    cameraHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    headerText: {
        color: COLORS.text,
        fontSize: SIZES.md,
        fontWeight: '500',
    },
    closeButton: {
        padding: 8,
    },
    flipButton: {
        padding: 8,
    },
    chartOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartFrame: {
        width: '85%',
        height: '60%',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: COLORS.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    overlayHint: {
        color: COLORS.text,
        fontSize: SIZES.sm,
        marginTop: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    cameraFooter: {
        padding: SIZES.padding * 2,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.text,
    },
    previewContainer: {
        flex: 1,
    },
    previewImage: {
        flex: 1,
        resizeMode: 'contain',
    },
    overlayGrid: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridLine: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    gridLineHorizontal: {
        width: 1,
        height: '100%',
    },
    previewHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: SIZES.padding,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    previewFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: SIZES.padding * 2,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    retakeButton: {
        alignItems: 'center',
        padding: 12,
    },
    analyzeButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radius,
        paddingHorizontal: 32,
    },
    buttonLabel: {
        color: COLORS.text,
        fontSize: SIZES.sm,
        marginTop: 4,
    },
});
