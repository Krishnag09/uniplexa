import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

const Onboarding5Screen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [buildingAddress, setBuildingAddress] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const [buildingAddressError, setBuildingAddressError] = useState('');

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.mainView}>
                    <Text style={{ color: '#FFF' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleFinish = () => {
        if (!buildingAddress.trim()) {
            setBuildingAddressError('Building address is required');
            return;
        }
        // TODO: Save onboarding data
        // Navigate to home screen
        router.replace('/');
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
                        Where do you live?
                    </Text>
                    
                    {/* Description */}
                    <Text style={styles.description}>
                        Add your building address to get started
                    </Text>

                    {/* Building Address Input */}
                    <Input
                        placeholder="Building address"
                        value={buildingAddress}
                        onChangeText={(text) => {
                            setBuildingAddress(text);
                            setBuildingAddressError('');
                        }}
                        error={buildingAddressError}
                        autoCapitalize="words"
                        style={styles.input}
                    />

                    {/* Unit Number Input (Optional) */}
                    <Input
                        placeholder="Unit number (optional)"
                        value={unitNumber}
                        onChangeText={setUnitNumber}
                        autoCapitalize="none"
                        style={styles.input}
                    />
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Finish Button */}
                    <Button
                        title="Get Started"
                        onPress={handleFinish}
                        variant="primary"
                        fullWidth
                        style={styles.finishButton}
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
        fontSize: 32,
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'RedHatText_400Regular',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    input: {
        width: '100%',
        maxWidth: 335,
        marginBottom: 16,
    },
    bottomSection: {
        width: '100%',
        alignItems: 'center',
    },
    finishButton: {
        width: '100%',
        maxWidth: 335,
    },
});

export default Onboarding5Screen;


