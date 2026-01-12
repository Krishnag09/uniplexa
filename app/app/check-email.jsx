import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const CheckEmailScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params.email || '';
    
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [isResending, setIsResending] = useState(false);

    if (!fontsLoaded) {
        return null;
    }

    const handleOpenMailApp = async () => {
        // Open the default mail app
        const mailto = 'mailto:';
        const canOpen = await Linking.canOpenURL(mailto);
        if (canOpen) {
            await Linking.openURL(mailto);
        } else {
            console.log('Mail app not available');
        }
    };

    const handleResendLink = async () => {
        if (!email) return;
        
        setIsResending(true);
        try {
            const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const forgotPasswordEndpoint = `${backendUrl}/forgot_password`;
            
            // Use forgot_password endpoint for sign-in link (magic link)
            const response = await axios.post(forgotPasswordEndpoint, {
                email: email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Sign-in link resent successfully');
            // TODO: Show success message
        } catch (error) {
            console.error('Error resending link:', error);
            // TODO: Show error message
        } finally {
            setIsResending(false);
        }
    };

    const handleUsePasswordInstead = () => {
        // Navigate to password login screen
        router.push({
            pathname: '/login-password',
            params: { email: email }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainView}>
                {/* Back Button */}
                {__DEV__ && (
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                )}
                
                {/* Check Email Container */}
                <View style={styles.checkEmailContainer}>
                    {/* Title */}
                    <Text style={styles.title}>Check your email</Text>
                    
                    {/* Description */}
                    <Text style={styles.description}>
                        If that email exists, we sent a link. It expires in 15 minutes.
                    </Text>

                    {/* Open Mail App Button */}
                    <Button
                        title="Open mail app"
                        onPress={handleOpenMailApp}
                        variant="primary"
                        fullWidth
                        style={styles.primaryButton}
                    />

                    {/* Resend Link Button */}
                    <Button
                        title="Resend link"
                        onPress={handleResendLink}
                        variant="secondary"
                        fullWidth
                        loading={isResending}
                        style={styles.secondaryButton}
                    />

                    {/* Use Password Instead Button */}
                    <TouchableOpacity 
                        style={styles.passwordLink}
                        onPress={handleUsePasswordInstead}
                    >
                        <Text style={styles.passwordLinkText}>
                            Use password instead
                        </Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkEmailContainer: {
        width: 335,
        position: 'absolute',
        alignSelf: 'center',
        top: 200,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    title: {
        width: 335,
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 28,
        lineHeight: 37.04,
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
        marginBottom: 16,
    },
    description: {
        width: 335,
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 16,
        lineHeight: 21.17,
        fontFamily: 'RedHatText_400Regular',
        marginBottom: 32,
    },
    primaryButton: {
        marginBottom: 16,
        width: 335,
    },
    secondaryButton: {
        marginBottom: 20,
        width: 335,
    },
    passwordLink: {
        alignSelf: 'center',
        paddingVertical: 8,
    },
    passwordLinkText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
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
});

export default CheckEmailScreen;
