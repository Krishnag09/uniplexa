import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, Link } from 'expo-router';
import { useFonts, RedHatText_300Light, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';

const { width, height } = Dimensions.get('window');

const Dashboard = () => {
    const router = useRouter();
    const [showDevMenu, setShowDevMenu] = useState(__DEV__); // Only show in dev mode
    const [fontsLoaded] = useFonts({
        RedHatText_300Light,
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.mainView}>
                    <Text style={{ color: 'rgba(255, 176, 102, 1)', fontSize: 24 }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const options = [
        "What would you like to do today?",
        '"Raise a service request"',
        '"Book an amenity"',
        '"Check my packages"',
        '"Request guest entry"',
        '"View my documents"',
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.mainView}>
                    {/* Centered Uniplexa Text */}
                    <View style={styles.centerContainer}>
                        <Text style={styles.uniplexaText}>
                            Uniplexa
                        </Text>
                    </View>
                    
                    {/* Login Container - First Set of Elements */}
                    <View style={styles.loginContainer}>
                        {/* Elements will go here */}
                    </View>
                </View>
            </ScrollView>
            
            {/* Dev Navigation Helper - Only visible in development */}
            {showDevMenu && (
                <View style={styles.devMenu}>
                    <Link href="/login" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Go to Login</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/dashboard" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Go to Dashboard</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/voice-record" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Voice Record</Text>
                        </TouchableOpacity>
                    </Link>
                    <TouchableOpacity 
                        style={styles.devButton}
                        onPress={() => router.push('/forgot-password')}
                    >
                        <Text style={styles.devButtonText}>Go to Forgot Password</Text>
                    </TouchableOpacity>
                    <Link href="/register-with-code" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Go to Register with Code</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/signup" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Go to Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/onboarding-1" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Go to Onboarding</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/check-health" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Check Health</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/check-email" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Check Email</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/add-user" asChild>
                        <TouchableOpacity style={styles.devButton}>
                            <Text style={styles.devButtonText}>Add User (Admin)</Text>
                        </TouchableOpacity>
                    </Link>
                    <TouchableOpacity 
                        style={[styles.devButton, styles.devButtonClose]}
                        onPress={() => setShowDevMenu(false)}
                    >
                        <Text style={styles.devButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            {/* Dev Menu Toggle - Tap corner to show */}
            {!showDevMenu && __DEV__ && (
                <TouchableOpacity 
                    style={styles.devMenuToggle}
                    onPress={() => setShowDevMenu(true)}
                >
                    <Text style={styles.devMenuToggleText}>⚙️</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(28, 32, 31, 1)', // UIColor(red: 0.11, green: 0.124, blue: 0.123, alpha: 1)
    },
    scrollContent: {
        flexGrow: 1,
    },
    mainView: {
        width: width,
        minHeight: height,
        backgroundColor: 'rgba(28, 32, 31, 1)', // Figma background color
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    uniplexaText: {
        width: 249,
        height: 77,
        textAlign: 'center',
        color: 'rgba(255, 176, 102, 1)', // UIColor(red: 1, green: 0.69, blue: 0.4, alpha: 1)
        fontSize: 60,
        lineHeight: 76.56, // Line height matches box height
        // TODO: Add SpaceGrotesk-Medium font
        // For now using system font - install @expo-google-fonts/space-grotesk or add font file
        fontFamily: Platform.select({
            ios: 'System',
            android: 'sans-serif-medium',
        }),
        fontWeight: '500', // Medium weight
    },
    loginContainer: {
        width: 335,
        height: 279,
        position: 'absolute',
        alignSelf: 'center',
        // Centered with 0.5pt offset on Y axis (negligible, so just center)
        top: '50%',
        marginTop: -139.5, // Half of height (279/2) to center vertically
    },
    // Keep old styles for reference - remove as you build new design
    topPanel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 60,
        gap: 15,
        marginRight: 20
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'white',
    },
    greetingContainer: {
        alignItems: 'flex-end',
    },
    greeting: {
        fontSize: 24,
        color: '#3C3C6B',
        fontWeight: '300',
        fontFamily: 'RedHatText_400Regular',
    },
    bold: {
        fontSize: 26,
        fontFamily: 'RedHatText_700Bold',
        color: '#3C3C6B',
        fontWeight: 'bold'
    },
    optionsPanel: {
        marginTop: 280,
        paddingHorizontal: 10,
    },
    optionButton: {
        borderRadius: 50,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'white',
        alignSelf: 'flex-start',
        marginLeft: 10
    },
    blurView: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#8B90F1',
        fontFamily: 'RedHatText_400Regular',
    },
    blackText: {
        color: '#3C3C6B',
        fontFamily: 'RedHatText_400Regular',
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 0,
        paddingHorizontal: 5,
        width: '90%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'white',
        top: 50,
        alignSelf: 'center',
    },
    navButton: {
        alignItems: 'center',
    },
    voiceButton: {
        width: 60,
        height: 60,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 20
    },
    navIcon: {
        width: 48,
        height: 48,
    },
    voiceIcon: {
        width: 140,
        height: 140,
    },
    // Dev Navigation Helper Styles
    devMenu: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 10,
        padding: 10,
        zIndex: 1000,
    },
    devButton: {
        backgroundColor: '#FFB066',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    devButtonClose: {
        backgroundColor: '#666',
        marginBottom: 0,
    },
    devButtonText: {
        color: '#FFF',
        fontSize: 12,
        textAlign: 'center',
    },
    devMenuToggle: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    devMenuToggleText: {
        fontSize: 20,
    },
});

export default Dashboard;
