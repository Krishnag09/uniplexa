import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import axios from 'axios';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSendingPasswordResetLink, setIsSendingPasswordResetLink] = useState(false);

    if (!fontsLoaded) {
        return null;
    }
    const handleForgotPassword = async () => {
        // Validate email
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        
        setIsSendingPasswordResetLink(true);
        setEmailError('');
        
        try {
            const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const forgotPasswordEndpoint = `${backendUrl}/forgot_password`;
            
            console.log('Sending forgot password request to:', forgotPasswordEndpoint);
            console.log('Email:', email);
            
            const response = await axios.post(forgotPasswordEndpoint, {
                email: email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Password reset link sent successfully:', response.data);
            setIsSendingPasswordResetLink(false);
            
            // Navigate to check-email screen
            router.push({
                pathname: '/check-email',
                params: { email: email }
            });
        } catch (error) {
            setIsSendingPasswordResetLink(false);
            let errorMessage = 'Failed to send password reset link';
            
            if (error.response) {
                const errorData = error.response.data;
                errorMessage = errorData?.detail || errorData?.message || 'Failed to send password reset link';
                console.error('Forgot password error response:', error.response.status, errorData);
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check your connection.';
                console.error('Forgot password request error:', error.request);
            } else {
                errorMessage = error.message || 'An error occurred';
                console.error('Forgot password error:', error);
            }
            
            setEmailError(errorMessage);
        }
    }


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
                
                {/* Forgot Password Container - Form Elements */}
                <View style={styles.forgotPasswordContainer}>
                    {/* Text Header Section */}
                    <View style={styles.headerSection}>
                        {/* Password Recovery Title */}
                        <Text style={styles.title}>Password recovery</Text>
                        
                        {/* Description Text */}
                        <Text style={styles.description}>
                            Enter your email to restore your account
                        </Text>
                    </View>

                    {/* Email Input Field */}
                    <Input
                        placeholder="Enter email"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setEmailError('');
                        }}
                        error={emailError}
                        keyboardType="email-address"
                        style={styles.input}
                    />

                    {/* Continue Button */}
                    <Button
                        title="Continue"
                        onPress={() => {
                            handleForgotPassword();
                        }}
                        variant="primary"
                        fullWidth
                        loading={isSendingPasswordResetLink}
                        style={styles.continueButton}
                    />
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
    forgotPasswordContainer: {
        width: 335,
        position: 'absolute',
        alignSelf: 'center',
        top: 200, // Standardized positioning - lower to keep buttons in thumb zone
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    headerSection: {
        width: 335,
        height: 87,
        marginBottom: 16, // Spacing below header
    },
    title: {
        width: 335,
        height: 37,
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)', // UIColor(red: 1, green: 1, blue: 1, alpha: 1)
        fontSize: 28,
        lineHeight: 37.04, // Line height matches box height
        fontFamily: 'RedHatText_400Regular', // RedHatText-SemiBold not available, using Regular with fontWeight
        fontWeight: '700', // Bold weight
        marginBottom: 8, // Spacing between title and description
    },
    description: {
        width: 335,
        height: 42,
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)', // UIColor(red: 1, green: 1, blue: 1, alpha: 1)
        fontSize: 16,
        lineHeight: 21.17, // Line height 21.17 from Figma
        fontFamily: 'RedHatText_400Regular', // RedHatText-Regular
    },
    input: {
        marginBottom: 20, // Spacing before button
        width: 335,
    },
    continueButton: {
        width: 335,
        marginTop: 0,
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

export default ForgotPasswordScreen;

