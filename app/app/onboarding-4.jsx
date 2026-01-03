import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const Onboarding4Screen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.mainView}>
                    <Text style={{ color: '#FFF' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleContinue = () => {
        if (!name.trim()) {
            setNameError('Name is required');
            return;
        }
        router.push('/onboarding-5');
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

                {/* Content Container */}
                <View style={styles.contentContainer}>
                    {/* Title */}
                    <Text style={styles.title}>
                        Let's personalize your experience
                    </Text>
                    
                    {/* Profile Picture Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={60} color="rgba(255, 255, 255, 0.6)" />
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <Ionicons name="camera" size={20} color="rgba(255, 255, 255, 1)" />
                        </TouchableOpacity>
                    </View>

                    {/* Name Input */}
                    <Input
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            setNameError('');
                        }}
                        error={nameError}
                        autoCapitalize="words"
                        style={styles.input}
                    />
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
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
        backgroundColor: 'rgba(28, 32, 31, 1)',
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
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
        marginBottom: 40,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: width / 2 - 80,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 176, 102, 1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(28, 32, 31, 1)',
    },
    input: {
        width: '100%',
        maxWidth: 335,
        marginBottom: 0,
    },
    bottomSection: {
        width: '100%',
        alignItems: 'center',
    },
    continueButton: {
        width: '100%',
        maxWidth: 335,
    },
});

export default Onboarding4Screen;


