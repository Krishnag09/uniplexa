import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const Onboarding2Screen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.mainView}>
                    <Text style={{ color: '#FFF' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainView}>
                {/* Back Button */}
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                {/* Content Container */}
                <View style={styles.contentContainer}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="mic" size={80} color="rgba(255, 176, 102, 1)" />
                    </View>
                    
                    {/* Title */}
                    <Text style={styles.title}>
                        Voice Assistant
                    </Text>
                    
                    {/* Description */}
                    <Text style={styles.description}>
                        Use your voice to quickly request services, check packages, and manage your building needs
                    </Text>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Continue Button */}
                    <Button
                        title="Continue"
                        onPress={() => router.push('/onboarding-3')}
                        variant="primary"
                        fullWidth
                        style={styles.continueButton}
                    />
                    
                    {/* Skip Link */}
                    <TouchableOpacity 
                        style={styles.skipButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(28, 32, 31, 1)',
    },
    mainView: {
        width: width,
        minHeight: height,
        backgroundColor: 'rgba(28, 32, 31, 1)',
        justifyContent: 'space-between',
        paddingTop: 100,
        paddingBottom: 60,
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        borderRadius: 5,
        zIndex: 1000,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 14,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 176, 102, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'RedHatText_400Regular',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
    },
    bottomSection: {
        width: '100%',
        alignItems: 'center',
    },
    continueButton: {
        width: '100%',
        maxWidth: 335,
        marginBottom: 20,
    },
    skipButton: {
        paddingVertical: 12,
    },
    skipText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontFamily: 'RedHatText_400Regular',
        textAlign: 'center',
    },
});

export default Onboarding2Screen;


