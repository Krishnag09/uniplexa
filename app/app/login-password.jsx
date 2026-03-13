import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const LoginPasswordScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });
    
    const [email, setEmail] = useState(params.email || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        // Set email from params if provided
        if (params.email) {
            setEmail(params.email);
        }
    }, [params.email]);
    
    if (!fontsLoaded) {
        return null;
    }

    const checkLogin = async () => {
        setLoginError(null);
        setIsLoading(true);

        try {
            const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const loginEndpoint = `${backendUrl}/login`;
            
            const response = await axios.post(loginEndpoint, {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            setLoginError(null);
            setIsLoading(false);
            // Navigate to dashboard on success (for local testing without magic links)
            router.replace('/dashboard');
            return response.data;
        } catch (error) {
            setIsLoading(false);
            
            let errorMessage = 'An error occurred during login';
            if (error.response) {
                const errorData = error.response.data;
                errorMessage = errorData?.detail || errorData?.message || JSON.stringify(errorData) || 'Login failed';
                console.error('Login error response:', error.response.status, errorData);
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check your connection.';
                console.error('Login request error:', error.request);
            } else {
                errorMessage = error.message || 'An error occurred during login';
                console.error('Login error:', error);
            }
            
            setLoginError(errorMessage);
            throw error;
        }
    };

    const handlePasswordLogin = async () => {
        // Basic validation
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        
        // Clear previous errors
        setEmailError('');
        setPasswordError('');
        
        await checkLogin();
    };

    const handleUseMagicLink = () => {
        // Navigate back to login screen (magic link mode)
        router.push({
            pathname: '/login',
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

                    {/* Password Input */}
                    <View style={styles.passwordContainer}>
                        <Input
                            placeholder="Enter password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setPasswordError('');
                            }}
                            error={passwordError}
                            secureTextEntry={!showPassword}
                            style={[styles.input, styles.passwordInput]}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color={Colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password Link - Right Aligned */}
                    <TouchableOpacity 
                        style={styles.forgotPassword}
                        onPress={() => router.push('/forgot-password')}
                    >
                        <Text style={styles.forgotPasswordText}>
                            Forgot password?
                        </Text>
                    </TouchableOpacity>

                    {/* Error Message */}
                    {loginError && (
                        <Text style={styles.errorText}>{loginError}</Text>
                    )}

                    {/* Use Magic Link Button */}
                    <TouchableOpacity 
                        style={styles.toggleButton}
                        onPress={handleUseMagicLink}
                    >
                        <Text style={styles.toggleButtonText}>
                            Use magic link instead
                        </Text>
                    </TouchableOpacity>

                    {/* Sign In Button */}
                    <Button
                        title="Sign in"
                        onPress={handlePasswordLogin}
                        variant="primary"
                        fullWidth
                        loading={isLoading}
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
    passwordContainer: {
        width: 335,
        position: 'relative',
        marginBottom: 16,
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 14.5,
        zIndex: 1,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
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
    errorText: {
        color: '#FF4444',
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
        marginBottom: 16,
        width: 335,
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

export default LoginPasswordScreen;
