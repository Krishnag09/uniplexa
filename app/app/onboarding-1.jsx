import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const Onboarding1Screen = () => {
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
                {/* Content Container */}
                <View style={styles.contentContainer}>
                    {/* App Logo/Title */}
                    <Text style={styles.appTitle}>Uniplexa</Text>
                    
                    {/* Welcome Message */}
                    <Text style={styles.welcomeText}>
                        Welcome to your smart building assistant
                    </Text>
                    
                    {/* Description */}
                    <Text style={styles.description}>
                        Manage your building services, packages, and amenities all in one place
                    </Text>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Continue Button */}
                    <Button
                        title="Get Started"
                        onPress={() => router.push('/onboarding-2')}
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
        backgroundColor: 'rgba(28, 32, 31, 1)', // Dark background
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
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    appTitle: {
        fontSize: 60,
        color: 'rgba(255, 176, 102, 1)', // Orange accent
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '500',
        marginBottom: 40,
        textAlign: 'center',
    },
    welcomeText: {
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

export default Onboarding1Screen;


