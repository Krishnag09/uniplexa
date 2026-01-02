import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const SignupScreen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [name, setName] = useState('');
    const [buildingAddress, setBuildingAddress] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.mainView}>
                    <Text style={{ color: '#FFF' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleSignup = () => {
        // Reset errors
        setNameError('');
        setEmailError('');
        setPasswordError('');

        // Validation
        let hasError = false;
        if (!name.trim()) {
            setNameError('Name is required');
            hasError = true;
        }
        if (!email.trim()) {
            setEmailError('Email is required');
            hasError = true;
        }
        if (!password.trim()) {
            setPasswordError('Password is required');
            hasError = true;
        }

        if (hasError) return;

        // TODO: Add signup logic
        console.log('Signup:', { name, buildingAddress: buildingAddress || null, email, password });
    };

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
                
                {/* Signup Container - Form Elements */}
                <View style={styles.signupContainer}>
                    {/* Text Header Section */}
                    <View style={styles.headerSection}>
                        {/* Sign up Title */}
                        <Text style={styles.title}>Sign up</Text>
                        
                        {/* Description Text */}
                        <Text style={styles.description}>
                            Enter your name, email and password to register your account
                        </Text>
                    </View>

                    {/* Name Input Field */}
                    <Input
                        placeholder="Enter name"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            setNameError('');
                        }}
                        error={nameError}
                        autoCapitalize="words"
                        style={styles.input}
                    />

                    {/* Building Address Input Field (Optional) */}
                    <Input
                        placeholder="Building address (optional)"
                        value={buildingAddress}
                        onChangeText={(text) => {
                            setBuildingAddress(text);
                        }}
                        autoCapitalize="words"
                        style={styles.input}
                    />

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

                    {/* Continue Button */}
                    <Button
                        title="Continue"
                        onPress={handleSignup}
                        variant="primary"
                        fullWidth
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
    signupContainer: {
        width: 335,
        position: 'absolute',
        alignSelf: 'center',
        top: 200, // Standardized positioning - lower to keep buttons in thumb zone
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    headerSection: {
        width: 335,
        marginBottom: 20, // Spacing below header
    },
    title: {
        width: 335,
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)', // White text
        fontSize: 28,
        lineHeight: 37.04, // Line height from Figma
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700', // Bold weight
        marginBottom: 8, // Spacing between title and description
    },
    description: {
        width: 335,
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)', // White text
        fontSize: 16,
        lineHeight: 21.17, // Line height from Figma
        fontFamily: 'RedHatText_400Regular',
    },
    input: {
        marginBottom: 16, // Spacing between inputs
        width: 335,
    },
    passwordContainer: {
        width: 335,
        position: 'relative',
        marginBottom: 16,
    },
    passwordInput: {
        marginBottom: 0,
        paddingRight: 50, // Space for eye icon
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 14.5, // Center vertically (input height 49 / 2 - icon size 20 / 2 = 14.5)
        zIndex: 1,
    },
    continueButton: {
        width: 335,
        marginTop: 8,
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

export default SignupScreen;

