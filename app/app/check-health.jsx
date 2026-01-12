import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/Theme';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const CheckHealthScreen = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        RedHatText_400Regular,
        RedHatText_700Bold,
    });

    const [isChecking, setIsChecking] = useState(false);
    const [healthStatus, setHealthStatus] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [error, setError] = useState(null);
    const [lastChecked, setLastChecked] = useState(null);

    if (!fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.mainView}>
                    <Text style={{ color: '#FFF' }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const checkHealth = async () => {
        setIsChecking(true);
        setError(null);
        setHealthStatus(null);
        setConnectionStatus(null);

        const startTime = Date.now();

        try {
            // TODO: Replace with your actual backend URL
            const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            const healthEndpoint = `${backendUrl}/health`;
            
            // Check connection and health using axios
            const response = await axios.get(healthEndpoint, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 second timeout
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            setConnectionStatus({
                status: 'connected',
                responseTime: responseTime,
                statusCode: response.status,
            });

            setHealthStatus({
                status: response.data.status || 'healthy',
                timestamp: response.data.timestamp || new Date().toISOString(),
                version: response.data.version,
                uptime: response.data.uptime,
                details: response.data,
            });
        } catch (err) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setConnectionStatus({
                    status: 'error',
                    statusCode: err.response.status,
                    responseTime: responseTime,
                });
                setError(`Backend returned status ${err.response.status}`);
            } else if (err.request) {
                // The request was made but no response was received
                setConnectionStatus({
                    status: 'disconnected',
                    error: 'No response from server',
                    responseTime: responseTime,
                });
                setError(`Connection failed: No response from server`);
            } else {
                // Something happened in setting up the request that triggered an Error
                setConnectionStatus({
                    status: 'disconnected',
                    error: err.message,
                    responseTime: responseTime,
                });
                setError(`Connection failed: ${err.message}`);
            }
        } finally {
            setIsChecking(false);
            setLastChecked(new Date().toLocaleString());
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'connected':
            case 'healthy':
                return 'rgba(0, 180, 180, 1)'; // Teal
            case 'error':
                return 'rgba(255, 176, 102, 1)'; // Orange
            case 'disconnected':
                return '#FF4444'; // Red
            default:
                return 'rgba(255, 255, 255, 0.6)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'connected':
            case 'healthy':
                return 'checkmark-circle';
            case 'error':
                return 'warning';
            case 'disconnected':
                return 'close-circle';
            default:
                return 'help-circle';
        }
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
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.contentContainer}>
                        {/* Title */}
                        <Text style={styles.title}>Health Check</Text>
                        
                        {/* Description */}
                        <Text style={styles.description}>
                            Check backend connectivity and health status
                        </Text>

                        {/* Check Health Button */}
                        <Button
                            title={isChecking ? "Checking..." : "Check Health"}
                            onPress={checkHealth}
                            variant="primary"
                            fullWidth
                            disabled={isChecking}
                            loading={isChecking}
                            style={styles.checkButton}
                        />

                        {/* Loading Indicator */}
                        {isChecking && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="rgba(255, 176, 102, 1)" />
                                <Text style={styles.loadingText}>Checking backend...</Text>
                            </View>
                        )}

                        {/* Connection Status */}
                        {connectionStatus && (
                            <View style={styles.statusCard}>
                                <View style={styles.statusHeader}>
                                    <Ionicons 
                                        name={getStatusIcon(connectionStatus.status)} 
                                        size={24} 
                                        color={getStatusColor(connectionStatus.status)} 
                                    />
                                    <Text style={styles.statusTitle}>Connection Status</Text>
                                </View>
                                <View style={styles.statusContent}>
                                    <View style={styles.statusRow}>
                                        <Text style={styles.statusLabel}>Status:</Text>
                                        <Text style={[styles.statusValue, { color: getStatusColor(connectionStatus.status) }]}>
                                            {connectionStatus.status.toUpperCase()}
                                        </Text>
                                    </View>
                                    {connectionStatus.responseTime && (
                                        <View style={styles.statusRow}>
                                            <Text style={styles.statusLabel}>Response Time:</Text>
                                            <Text style={styles.statusValue}>{connectionStatus.responseTime}ms</Text>
                                        </View>
                                    )}
                                    {connectionStatus.statusCode && (
                                        <View style={styles.statusRow}>
                                            <Text style={styles.statusLabel}>HTTP Status:</Text>
                                            <Text style={styles.statusValue}>{connectionStatus.statusCode}</Text>
                                        </View>
                                    )}
                                    {connectionStatus.error && (
                                        <Text style={styles.errorText}>{connectionStatus.error}</Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Health Status */}
                        {healthStatus && (
                            <View style={styles.statusCard}>
                                <View style={styles.statusHeader}>
                                    <Ionicons 
                                        name={getStatusIcon(healthStatus.status)} 
                                        size={24} 
                                        color={getStatusColor(healthStatus.status)} 
                                    />
                                    <Text style={styles.statusTitle}>Health Status</Text>
                                </View>
                                <View style={styles.statusContent}>
                                    <View style={styles.statusRow}>
                                        <Text style={styles.statusLabel}>Status:</Text>
                                        <Text style={[styles.statusValue, { color: getStatusColor(healthStatus.status) }]}>
                                            {healthStatus.status.toUpperCase()}
                                        </Text>
                                    </View>
                                    {healthStatus.version && (
                                        <View style={styles.statusRow}>
                                            <Text style={styles.statusLabel}>Version:</Text>
                                            <Text style={styles.statusValue}>{healthStatus.version}</Text>
                                        </View>
                                    )}
                                    {healthStatus.uptime && (
                                        <View style={styles.statusRow}>
                                            <Text style={styles.statusLabel}>Uptime:</Text>
                                            <Text style={styles.statusValue}>{healthStatus.uptime}</Text>
                                        </View>
                                    )}
                                    {healthStatus.timestamp && (
                                        <View style={styles.statusRow}>
                                            <Text style={styles.statusLabel}>Timestamp:</Text>
                                            <Text style={styles.statusValue}>
                                                {new Date(healthStatus.timestamp).toLocaleString()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Error Display */}
                        {error && (
                            <View style={styles.errorCard}>
                                <Ionicons name="alert-circle" size={24} color="#FF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Last Checked */}
                        {lastChecked && (
                            <Text style={styles.lastChecked}>
                                Last checked: {lastChecked}
                            </Text>
                        )}

                        {/* Backend URL Info */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>Backend URL</Text>
                            <Text style={styles.infoText}>
                                {process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}
                            </Text>
                            <Text style={styles.infoSubtext}>
                                Set EXPO_PUBLIC_API_URL in your .env file
                            </Text>
                        </View>
                    </View>
                </ScrollView>
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
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
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
        paddingTop: 100,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'RedHatText_400Regular',
        textAlign: 'center',
        marginBottom: 32,
    },
    checkButton: {
        width: '100%',
        maxWidth: 335,
        alignSelf: 'center',
        marginBottom: 24,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 12,
        fontFamily: 'RedHatText_400Regular',
    },
    statusCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(41, 51, 50, 1)',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    statusTitle: {
        fontSize: 20,
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '700',
    },
    statusContent: {
        gap: 12,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        fontFamily: 'RedHatText_400Regular',
    },
    statusValue: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 1)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '600',
    },
    errorCard: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: '#FF4444',
        fontFamily: 'RedHatText_400Regular',
    },
    lastChecked: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginTop: 8,
        fontFamily: 'RedHatText_400Regular',
    },
    infoCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 16,
        padding: 20,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(41, 51, 50, 1)',
    },
    infoTitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'RedHatText_400Regular',
        fontWeight: '600',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: 'rgba(0, 180, 180, 1)',
        fontFamily: 'RedHatText_400Regular',
        marginBottom: 4,
    },
    infoSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        fontFamily: 'RedHatText_400Regular',
        marginTop: 4,
    },
});

export default CheckHealthScreen;

