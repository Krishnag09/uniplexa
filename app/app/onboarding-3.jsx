import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const Onboarding3Screen = () => {
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
                    {/* Title */}
                    <Text style={styles.title}>
                        Enable Permissions
                    </Text>
                    
                    {/* Description */}
                    <Text style={styles.description}>
                        Allow notifications and location access to get the most out of Uniplexa
                    </Text>

                    {/* Permission Items */}
                    <View style={styles.permissionsList}>
                        <View style={styles.permissionItem}>
                            <Ionicons name="notifications" size={24} color="rgba(0, 180, 180, 1)" />
                            <Text style={styles.permissionText}>
                                Get notified about packages, service requests, and important updates
                            </Text>
                        </View>
                        <View style={styles.permissionItem}>
                            <Ionicons name="location" size={24} color="rgba(0, 180, 180, 1)" />
                            <Text style={styles.permissionText}>
                                Help us provide location-based services and faster delivery
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Continue Button */}
                    <Button
                        title="Allow Permissions"
                        onPress={() => router.push('/onboarding-4')}
                        variant="primary"
                        fullWidth
                        style={styles.continueButton}
                    />
                    
                    {/* Skip Link */}
                    <TouchableOpacity 
                        style={styles.skipButton}
                        onPress={() => router.push('/onboarding-4')}
                    >
                        <Text style={styles.skipText}>Skip for now</Text>
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'RedHatText_400Regular',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    permissionsList: {
        width: '100%',
        maxWidth: 335,
        gap: 24,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    permissionText: {
        flex: 1,
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'RedHatText_400Regular',
        lineHeight: 22,
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

export default Onboarding3Screen;


