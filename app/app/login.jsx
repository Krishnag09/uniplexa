import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });
    
    const [email, setEmail] = useState(params.email || '');
    const [emailError, setEmailError] = useState('');
    const [isSendingLink, setIsSendingLink] = useState(false);
    
    useEffect(() => {
        // Set email from params if provided
        if (params.email) {
            setEmail(params.email);
        }
    }, [params.email]);
    
    if (!fontsLoaded) {
        return null;
    }

    const handleUsePassword = () => {
        // Navigate to password login screen
        router.push({
            pathname: '/login-password',
            params: { email: email }
        });
    };

    const handleSendMagicLink = async () => {
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        
        setEmailError('');
        setIsSendingLink(true);
        
        try {
            const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const requestSigninLinkEndpoint = `${backendUrl}/request-signin-link`;
            
            // Use forgot_password endpoint for magic link
            await axios.post(requestSigninLinkEndpoint, {
                email: email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Navigate to check-email screen
            router.push({
                pathname: '/check-email',
                params: { email: email }
            });
        } catch (error) {
            setIsSendingLink(false);
            
            let errorMessage = 'Failed to send sign-in link';
            if (error.response) {
                const errorData = error.response.data;
                errorMessage = errorData?.detail || errorData?.message || 'Failed to send sign-in link';
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check your connection.';
            } else {
                errorMessage = error.message || 'Failed to send sign-in link';
            }
            
            setEmailError(errorMessage);
        }
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
                
                {/* Login Container - Form Elements */}
                <View style={styles.loginContainer}>
                    {/* Log in Title */}
                    <Text style={styles.loginTitle}>Log in</Text>
                    
                    {/* Email Input */}
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

                    {/* Use Password Instead Button */}
                    <TouchableOpacity 
                        style={styles.toggleButton}
                        onPress={handleUsePassword}
                    >
                        <Text style={styles.toggleButtonText}>
                            Use password instead
                        </Text>
                    </TouchableOpacity>

                    {/* Primary CTA Button */}
                    <Button
                        title="Send Sign-in Magic Link"
                        onPress={handleSendMagicLink}
                        variant="primary"
                        fullWidth
                        loading={isSendingLink}
                        style={styles.primaryButton}
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
    loginContainer: {
        width: 335,
        position: 'absolute',
        alignSelf: 'center',
        top: 200,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 0,
    },
    loginTitle: {
        width: 335,
        height: 37,
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 28,
        lineHeight: 37.04,
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
        width: 335,
    },
    toggleButton: {
        alignSelf: 'flex-start',
        marginBottom: 20,
        paddingVertical: 4,
    },
    toggleButtonText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
    },
    primaryButton: {
        marginTop: 0,
        marginBottom: 24,
        width: 335,
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

export default LoginScreen;
