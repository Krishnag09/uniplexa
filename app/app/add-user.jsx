import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const AddUserScreen = () => {
    const router = useRouter();
    
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });
    
    const [email, setEmail] = useState('');
    const [buildingAddress, setBuildingAddress] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const [emailError, setEmailError] = useState('');
    const [buildingAddressError, setBuildingAddressError] = useState('');
    const [unitNumberError, setUnitNumberError] = useState('');
    const [submitError, setSubmitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    if (!fontsLoaded) {
        return null;
    }

    const handleAddUser = async () => {
        // Clear previous errors
        setEmailError('');
        setBuildingAddressError('');
        setUnitNumberError('');
        setSubmitError(null);
        
        // Basic validation
        let isValid = true;
        
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!email.includes('@')) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }
        
        if (!buildingAddress) {
            setBuildingAddressError('Building address is required');
            isValid = false;
        }
        
        if (!unitNumber) {
            setUnitNumberError('Unit number is required');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const addUserEndpoint = `${backendUrl}/add_user`;
            
            // TODO: Map building address to building_id
            // For now, we'll send building_address and unit_number
            // Backend will need to handle mapping or we need to fetch building_id first
            const response = await axios.post(addUserEndpoint, {
                email: email,
                user_role: 'renter', // Default role for added users
                building_id: null, // TODO: Map building address to building_id
                // Include address and unit for reference
                building_address: buildingAddress,
                unit_number: unitNumber,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            setIsLoading(false);
            
            // TODO: Show success message and navigate back or to user list
            console.log('User added successfully:', response.data);
            
            // Clear form on success
            setEmail('');
            setBuildingAddress('');
            setUnitNumber('');
            
            // Show success message (you might want to add a toast/alert component)
            setSubmitError(null);
            
        } catch (error) {
            setIsLoading(false);
            
            let errorMessage = 'Failed to add user';
            if (error.response) {
                const errorData = error.response.data;
                errorMessage = errorData?.detail || errorData?.message || 'Failed to add user';
                
                // Handle specific field errors if provided by backend
                if (errorData?.errors) {
                    if (errorData.errors.email) {
                        setEmailError(errorData.errors.email);
                    }
                    if (errorData.errors.building_address) {
                        setBuildingAddressError(errorData.errors.building_address);
                    }
                    if (errorData.errors.unit_number) {
                        setUnitNumberError(errorData.errors.unit_number);
                    }
                }
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check your connection.';
            } else {
                errorMessage = error.message || 'Failed to add user';
            }
            
            setSubmitError(errorMessage);
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
                
                {/* Add User Container */}
                <View style={styles.addUserContainer}>
                    {/* Title */}
                    <Text style={styles.title}>Add User</Text>
                    
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

                    {/* Building Address Input */}
                    <Input
                        placeholder="Enter building address"
                        value={buildingAddress}
                        onChangeText={(text) => {
                            setBuildingAddress(text);
                            setBuildingAddressError('');
                        }}
                        error={buildingAddressError}
                        style={styles.input}
                    />

                    {/* Unit Number Input */}
                    <Input
                        placeholder="Enter unit number"
                        value={unitNumber}
                        onChangeText={(text) => {
                            setUnitNumber(text);
                            setUnitNumberError('');
                        }}
                        error={unitNumberError}
                        keyboardType="default"
                        style={styles.input}
                    />

                    {/* Error Message */}
                    {submitError && (
                        <Text style={styles.errorText}>{submitError}</Text>
                    )}

                    {/* Add User Button */}
                    <Button
                        title="Add User"
                        onPress={handleAddUser}
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
    addUserContainer: {
        width: 335,
        position: 'absolute',
        alignSelf: 'center',
        top: 200,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 0,
    },
    title: {
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

export default AddUserScreen;
