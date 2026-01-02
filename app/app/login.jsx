import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    if (!fontsLoaded) {
        return null;
    }

    const handleLogin = () => {
        // Basic validation
        if (!email) {
            setEmailError('Email is required');
            return;
        }
        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        
        // TODO: Add actual login logic
        console.log('Login:', { email, password });
        // router.push('/dashboard');
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
                        autoCapitalize="none"
                        style={styles.input}
                    />

                    {/* Password Input with Visibility Toggle */}
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

                    {/* Continue Button */}
                    <Button
                        title="Continue"
                        onPress={handleLogin}
                        variant="primary"
                        fullWidth
                        style={styles.continueButton}
                    />

                    {/* Don't have an account section */}
                    <TouchableOpacity 
                        style={styles.registerPromptContainer}
                        onPress={() => console.log('Register prompt clicked')}
                    >
                        <Text style={styles.registerPrompt}>
                            Don't have an account?
                        </Text>
                    </TouchableOpacity>

                    {/* Register with code Button */}
                    <Button
                        title="Register with code"
                        onPress={() => router.push('/register-with-code')}
                        variant="secondary"
                        fullWidth
                        style={[styles.registerButton, { backgroundColor: 'rgba(0, 180, 180, 1)' }]}
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
        top: 200, // Standardized positioning - lower to keep buttons in thumb zone
        justifyContent: 'flex-start',
        alignItems: 'flex-start', // Align left for title
        paddingHorizontal: 0,
    },
    loginTitle: {
        width: 335,
        height: 37,
        textAlign: 'left', // Align left like in the design
        color: 'rgba(255, 255, 255, 1)', // UIColor(red: 1, green: 1, blue: 1, alpha: 1)
        fontSize: 28,
        lineHeight: 37.04, // Line height matches box height
        fontFamily: 'RedHatText_400Regular', // RedHatText-SemiBold not available, using Regular with fontWeight
        fontWeight: '700', // Bold weight
        marginBottom: 24, // Spacing between title and first input
    },
    input: {
        marginBottom: 16, // Spacing between inputs
        width: 335, // Ensure inputs fit container
    },
    passwordContainer: {
        width: 335,
        position: 'relative',
        marginBottom: 16,
    },
    passwordInput: {
        paddingRight: 50, // Space for eye icon
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 14.5, // Center vertically (49/2 - icon size/2)
        zIndex: 1,
    },
    forgotPassword: {
        alignSelf: 'flex-end', // Right aligned
        marginTop: 8,
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    continueButton: {
        marginTop: 0,
        marginBottom: 24,
        width: 335,
    },
    registerPromptContainer: {
        width: 335,
        marginBottom: 12,
        alignItems: 'center',
    },
    registerPrompt: {
        color: Colors.textPrimary,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'RedHatText_400Regular',
    },
    registerButton: {
        width: 335,
        marginBottom: 0,
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

