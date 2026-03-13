import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Theme';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const SetPasswordScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const rawToken = typeof params.token === 'string' ? params.token : params.token?.[0];
    const token = rawToken ? decodeURIComponent(rawToken) : undefined;
    
    console.log('[SetPassword] rawToken:', rawToken);
    console.log('[SetPassword] decoded token:', token);

    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!fontsLoaded) {
        return null;
    }

    const handleSetPassword = async () => {
        setPasswordError('');
        setConfirmError('');
        setSubmitError(null);

        if (!password) {
            setPasswordError('Password is required');
            return;
        }
        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match');
            return;
        }

        if (!token) {
            setSubmitError('Invalid or expired link. Request a new sign-up link.');
            return;
        }

        setIsLoading(true);
        try {
            const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            await axios.post(
                `${backendUrl}/set_password`,
                { token, new_password: password },
                { headers: { 'Content-Type': 'application/json' } }
            );
            router.replace('/login-password');
        } catch (error) {
            setIsLoading(false);
            const detail = error.response?.data?.detail;
            setSubmitError(typeof detail === 'string' ? detail : 'Failed to set password. The link may have expired.');
        }
    };

    if (!token) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.mainView}>
                    <View style={styles.loginContainer}>
                        <Text style={styles.title}>Set your password</Text>
                        <Text style={styles.errorText}>
                            Invalid or expired link. Please request a new sign-up link from your admin.
                        </Text>
                        <Button
                            title="Go to login"
                            onPress={() => router.replace('/login-password')}
                            variant="primary"
                            fullWidth
                            style={styles.primaryButton}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainView}>
                <View style={styles.loginContainer}>
                    <Text style={styles.title}>Set your password</Text>
                    <Text style={styles.subtitle}>Choose a password to complete your Uniplexa sign-up.</Text>

                    <View style={styles.passwordContainer}>
                        <Input
                            placeholder="New password"
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

                    <Input
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setConfirmError('');
                        }}
                        error={confirmError}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                    />

                    {submitError && <Text style={styles.errorText}>{submitError}</Text>}

                    <Button
                        title="Set password"
                        onPress={handleSetPassword}
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
        backgroundColor: 'rgba(28, 32, 31, 1)',
    },
    mainView: {
        width,
        minHeight: height,
        backgroundColor: 'rgba(28, 32, 31, 1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginContainer: {
        width: 335,
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
        fontFamily: 'RedHatText_700Bold',
        marginBottom: 8,
    },
    subtitle: {
        width: 335,
        color: Colors.textSecondary,
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
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
    errorText: {
        color: '#FF4444',
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
        marginBottom: 16,
        width: 335,
    },
    primaryButton: {
        marginTop: 8,
        marginBottom: 24,
        width: 335,
    },
});

export default SetPasswordScreen;
