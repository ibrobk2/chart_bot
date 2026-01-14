import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Image, Text, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const AnimatedSplashScreen = ({ onAnimationComplete }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start infinite rotation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                easing: Animated.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Delay before hiding to show the logo
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }).start(() => {
                    if (onAnimationComplete) {
                        onAnimationComplete();
                    }
                });
            }, 3000); // Increased slightly for spinning effect
        });
    }, [fadeAnim, scaleAnim, rotateAnim, onAnimationComplete]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { rotate: spin }
                        ],
                    },
                ]}
            >
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>CHART ANALYZER</Text>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.copyright}>© Kloud Corp Systems</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#38BDF8',
        letterSpacing: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    copyright: {
        color: '#94A3B8',
        fontSize: 14,
        letterSpacing: 1,
    },
});

export default AnimatedSplashScreen;
