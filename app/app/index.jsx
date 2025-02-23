import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { useFonts, RedHatText_300Light, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';

const Dashboard = () => {
    const [fontsLoaded] = useFonts({
        RedHatText_300Light,
        RedHatText_400Regular,
    });

    if (!fontsLoaded) {
        return null;
    }

    const options = [
        "What would you like to do today?",
        '"Raise a service request"',
        '"Book an amenity"',
        '"Check my packages"',
        '"Request guest entry"',
        '"View my documents"',
    ];

    return (
        <ScrollView contentContainerStyle={styles.wrapper}>
            <ImageBackground source={require('../assets/images/bg-main.png')} style={styles.background}>

                {/* Top Greeting Panel */}
                <View>
                    <View style={styles.topPanel}>
                        <View style={styles.greetingContainer}>
                            <Text style={styles.greeting}>Good Morning,</Text>
                            <Text style={styles.bold}>Krishna</Text>
                        </View>
                        <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
                    </View>

                    {/* Main Options Panel */}
                    <View style={styles.optionsPanel}>
                        {options.map((text, index) => (
                            <TouchableOpacity key={index} style={styles.optionButton}>
                                <BlurView intensity={50} tint="light" style={styles.blurView}>
                                    <Text style={[styles.optionText, index === 0 && styles.blackText]}>
                                        {text}
                                    </Text>
                                </BlurView>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bottom Navigation */}
                    <View style={styles.navigationBar}>
                        <TouchableOpacity style={styles.navButton}>
                            <Image source={require('../assets/images/menu_button.png')} style={styles.navIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.voiceButton}>
                            <Image source={require('../assets/images/button_voice.png')} style={styles.voiceIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton}>
                            <Image source={require('../assets/images/keyboard.png')} style={styles.navIcon} />
                        </TouchableOpacity>
                    </View>
                </View>


            </ImageBackground>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        height: '100%',
        alignItems: 'center',
    },
    background: {
        width: '100%',
        height: '100%',
        flex: 1,

    },
    topPanel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 60,
        gap: 15,
        marginRight:20

    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'white',
    },
    greetingContainer: {
        alignItems: 'flex-end',
    },
    greeting: {
        fontSize: 24,
        color: '#3C3C6B',
        fontWeight: '300',
        fontFamily: 'RedHatText_400Regular',
    },
    bold: {
        fontSize: 26,
        fontFamily: 'RedHatText_700Bold',
        color: '#3C3C6B',
        fontWeight:'bold'
    },
    optionsPanel: {
        marginTop: 280,
        paddingHorizontal: 10,
    },
    optionButton: {
        borderRadius: 50,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'white',
        alignSelf: 'flex-start',
        marginLeft:10
    },
    blurView: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#8B90F1',
        fontFamily: 'RedHatText_400Regular',
    },
    blackText: {
        color: '#3C3C6B',
        fontFamily: 'RedHatText_400Regular',
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 0,
        paddingHorizontal: 5,
        width: '90%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'white',
        top: 50,
        alignSelf: 'center',
    },
    navButton: {
        alignItems: 'center',
    },
    voiceButton: {
        width: 60,
        height: 60,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 20
    },
    navIcon: {
        width: 48,
        height: 48,
    },
    voiceIcon: {
        width: 140,
        height: 140,
    },
});

export default Dashboard;
