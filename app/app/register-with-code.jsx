import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const RegisterWithCodeScreen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const codeInputRef = useRef(null);

    const handleCodeChange = (text) => {
        // Only allow numbers and limit to 6 digits
        const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
        setCode(numericText);
        setCodeError('');
    };

    const handleBoxPress = () => {
        codeInputRef.current?.focus();
    };

    const handleContinue = () => {
        if (code.length !== 6) {
            setCodeError('Please enter the complete 6-digit code');
            return;
        }
        // TODO: Add code verification logic
        console.log('Verifying code:', code);
    };

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
                
                {/* Register Container - Form Elements */}
                <View style={styles.registerContainer}>
                    {/* Debug: Test if screen is rendering */}
                    <Text style={{ color: '#FFF', fontSize: 20, marginBottom: 20 }}>Register with Code Screen</Text>
                    {/* Text Header Section */}
                    <View style={styles.headerSection}>
                        {/* Enter Code Title */}
                        <Text style={styles.title}>Enter code</Text>
                        
                        {/* Description Text */}
                        <Text style={styles.description}>
                            We have sent you a confirmation code to your e-mail
                        </Text>
                    </View>

                    {/* Code Input Boxes - 6 individual boxes */}
                    <TouchableOpacity 
                        style={styles.codeContainer}
                        activeOpacity={1}
                        onPress={handleBoxPress}
                    >
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <View key={index} style={styles.codeBox}>
                                <Text style={styles.codeText}>
                                    {code[index] || ''}
                                </Text>
                            </View>
                        ))}
                    </TouchableOpacity>
                    
                    {/* Hidden TextInput for code entry */}
                    <TextInput
                        ref={codeInputRef}
                        value={code}
                        onChangeText={handleCodeChange}
                        keyboardType="number-pad"
                        maxLength={6}
                        style={styles.hiddenInput}
                        autoFocus={false}
                    />

                    {/* Continue Button */}
                    <Button
                        title="Continue"
                        onPress={handleContinue}
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
    registerContainer: {
        width: 335,
        position: 'absolute',
        alignSelf: 'center',
        top: 200, // Standardized positioning - lower to keep buttons in thumb zone
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    headerSection: {
        width: 335,
        // Removed fixed height to allow content to determine size
        marginBottom: 20, // Spacing below header
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
    codeContainer: {
        width: 335,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    codeBox: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // UIColor(red: 0, green: 0, blue: 0, alpha: 0.2)
        borderWidth: 1,
        borderColor: 'rgba(41, 51, 50, 1)', // UIColor(red: 0.161, green: 0.2, blue: 0.196, alpha: 1)
        borderRadius: 30, // Corner radius 30
        justifyContent: 'center',
        alignItems: 'center',
    },
    codeText: {
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 24,
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    continueButton: {
        width: 335,
        marginTop: 16,
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

export default RegisterWithCodeScreen;

