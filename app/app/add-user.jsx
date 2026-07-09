import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Theme';
import axios from 'axios';
import { getApiBaseUrl } from '@/lib/api';

const { width, height } = Dimensions.get('window');

const AddUserScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const buildingIdParam = params.buildingId != null ? String(params.buildingId) : '';
    const buildingNameParam = params.buildingName != null ? String(params.buildingName) : '';

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
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSuccessMsg(null);
        setSubmitError(null);
    }, [buildingIdParam]);

    if (!fontsLoaded) {
        return null;
    }

    const handleAddUser = async () => {
        setEmailError('');
        setBuildingAddressError('');
        setUnitNumberError('');
        setSubmitError(null);
        setSuccessMsg(null);

        let isValid = true;

        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!email.includes('@')) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }

        const parsedBuildingId = buildingIdParam ? parseInt(buildingIdParam, 10) : NaN;
        const hasBuilding = Number.isFinite(parsedBuildingId) && parsedBuildingId > 0;

        if (!hasBuilding) {
            if (!buildingAddress) {
                setBuildingAddressError('Building address is required (or open Invite from a building)');
                isValid = false;
            }
            if (!unitNumber) {
                setUnitNumberError('Unit number is required (or open Invite from a building)');
                isValid = false;
            }
        }

        if (!isValid) {
            return;
        }

        setIsLoading(true);

        try {
            const backendUrl = getApiBaseUrl();
            const addUserEndpoint = `${backendUrl}/add_user`;

            const body = {
                email,
                user_role: 'renter',
                building_id: hasBuilding ? parsedBuildingId : null,
            };

            const response = await axios.post(addUserEndpoint, body, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setIsLoading(false);
            setEmail('');
            if (!hasBuilding) {
                setBuildingAddress('');
                setUnitNumber('');
            }
            setSubmitError(null);
            const link = response.data?.signup_link;
            setSuccessMsg(
                link
                    ? 'User added. Sign-up link generated (check server logs or response for testing).'
                    : 'User added successfully.'
            );
        } catch (error) {
            setIsLoading(false);

            let errorMessage = 'Failed to add user';
            if (error.response) {
                const errorData = error.response.data;
                errorMessage = errorData?.detail || errorData?.message || 'Failed to add user';

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

    const parsedBuildingId = buildingIdParam ? parseInt(buildingIdParam, 10) : NaN;
    const hasBuilding = Number.isFinite(parsedBuildingId) && parsedBuildingId > 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainView}>
                {__DEV__ && (
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.addUserContainer}>
                    <Text style={styles.title}>Add User</Text>

                    {hasBuilding ? (
                        <Text style={styles.contextLine}>
                            Building: {buildingNameParam || `#${parsedBuildingId}`}
                        </Text>
                    ) : (
                        <Text style={styles.hint}>
                            To invite someone to an existing building, open{' '}
                            <Text style={styles.hintEmph}>Manage buildings</Text> → choose a building →{' '}
                            <Text style={styles.hintEmph}>Invite resident</Text>.
                        </Text>
                    )}

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

                    {!hasBuilding ? (
                        <>
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
                        </>
                    ) : null}

                    {submitError && <Text style={styles.errorText}>{submitError}</Text>}
                    {successMsg && <Text style={styles.successText}>{successMsg}</Text>}

                    <Button
                        title="Add User"
                        onPress={handleAddUser}
                        variant="primary"
                        fullWidth
                        loading={isLoading}
                        style={styles.primaryButton}
                    />

                    {!hasBuilding ? (
                        <Button
                            title="Manage buildings"
                            onPress={() => router.push('/buildings')}
                            variant="primary"
                            fullWidth
                            style={styles.secondaryButton}
                        />
                    ) : null}
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
        textAlign: 'left',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 28,
        fontFamily: 'RedHatText_700Bold',
        marginBottom: 12,
    },
    contextLine: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
        marginBottom: 16,
        width: 335,
    },
    hint: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontFamily: 'RedHatText_400Regular',
        marginBottom: 16,
        width: 335,
        lineHeight: 20,
    },
    hintEmph: {
        color: '#fff',
        fontWeight: '600',
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
    successText: {
        color: '#4ade80',
        fontSize: 14,
        fontFamily: 'RedHatText_400Regular',
        marginBottom: 16,
        width: 335,
    },
    primaryButton: {
        marginTop: 0,
        marginBottom: 12,
        width: 335,
    },
    secondaryButton: {
        marginBottom: 24,
        width: 335,
        opacity: 0.9,
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
