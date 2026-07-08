import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFonts, RedHatText_400Regular, RedHatText_700Bold } from '@expo-google-fonts/red-hat-text';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Dashboard colors from screenshot
const DASHBOARD_COLORS = {
  background: '#1A1A1A',
  textPrimary: '#FFFFFF',
  promptBox: '#E5EAEB',
  promptText: '#1A1A1A',
  actionCard: 'rgba(1, 198, 157, 1)', // UIColor(red: 0.004, green: 0.776, blue: 0.616, alpha: 1)
  navIconBg: '#2D2D2D',
  micButton: '#FF9800',
  accentTeal: 'rgba(0, 191, 165, 0.15)',
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const DashboardScreen = () => {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [showDevMenu, setShowDevMenu] = useState(__DEV__);
  const [fontsLoaded] = useFonts({
    RedHatText_400Regular,
    RedHatText_700Bold,
  });

  const actionCards = [
    { id: '1', title: 'Service Request', route: '/voice-record' },
    { id: '2', title: 'My Packages', route: null },
    { id: '3', title: 'Guest Entry', route: null },
  ];

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decorative circles */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.circleArc, styles.circle1]} />
        <View style={[styles.circleArc, styles.circle2]} />
        <View style={[styles.circleArc, styles.circle3]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Avatar + Greeting */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>
            {getGreeting()},{'\n'}
            <Text style={styles.greetingName}>Krishna</Text>
          </Text>
        </View>

        {/* Prompt bubble */}
        <View style={styles.promptBox}>
          <Text style={styles.promptText}>What would you like to do today?</Text>
        </View>

        {isAdmin ? (
          <TouchableOpacity
            style={styles.adminBanner}
            activeOpacity={0.85}
            onPress={() => router.push('/buildings')}
          >
            <Text style={styles.adminBannerText}>Manage buildings</Text>
            <Ionicons name="business-outline" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        ) : null}

        {/* Action cards - horizontal scroll */}
        <View style={styles.actionCardsContainer}>
          {actionCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => card.route && router.push(card.route)}
            >
              <Text style={styles.actionCardText} numberOfLines={1}>
                {card.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.micButton]}
          onPress={() => router.push('/voice-record')}
        >
          <Ionicons name="mic" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Dev Navigation Helper - Only visible in development */}
      {__DEV__ && showDevMenu && (
        <View style={styles.devMenu}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/dashboard" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/voice-record" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Voice Record</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={styles.devButton}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.devButtonText}>Go to Forgot Password</Text>
          </TouchableOpacity>
          <Link href="/register-with-code" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Go to Register with Code</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Go to Sign Up</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/onboarding-1" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Go to Onboarding</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/check-health" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Check Health</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/check-email" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Check Email</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/add-user" asChild>
            <TouchableOpacity style={styles.devButton}>
              <Text style={styles.devButtonText}>Add User (Admin)</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={[styles.devButton, styles.devButtonClose]}
            onPress={() => setShowDevMenu(false)}
          >
            <Text style={styles.devButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dev Menu Toggle - Tap corner to show */}
      {__DEV__ && !showDevMenu && (
        <TouchableOpacity
          style={styles.devMenuToggle}
          onPress={() => setShowDevMenu(true)}
        >
          <Text style={styles.devMenuToggleText}>⚙️</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DASHBOARD_COLORS.background,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circleArc: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: DASHBOARD_COLORS.actionCard,
    opacity: 0.25,
  },
  circle1: {
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    right: -80,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  circle2: {
    width: 350,
    height: 350,
    borderRadius: 175,
    top: 100,
    left: -120,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  circle3: {
    width: 280,
    height: 280,
    borderRadius: 140,
    bottom: 150,
    right: -60,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  greeting: {
    color: DASHBOARD_COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'RedHatText_400Regular',
  },
  greetingName: {
    fontFamily: 'RedHatText_700Bold',
  },
  promptBox: {
    backgroundColor: DASHBOARD_COLORS.promptBox,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 24,
  },
  promptText: {
    color: DASHBOARD_COLORS.promptText,
    fontSize: 16,
    fontFamily: 'RedHatText_400Regular',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DASHBOARD_COLORS.actionCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  adminBannerText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontFamily: 'RedHatText_700Bold',
  },
  actionCardsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    height: 66,
    backgroundColor: DASHBOARD_COLORS.actionCard,
    borderRadius: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  actionCardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'RedHatText_700Bold',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DASHBOARD_COLORS.navIconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DASHBOARD_COLORS.micButton,
  },
  devMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    zIndex: 1000,
  },
  devButton: {
    backgroundColor: '#FFB066',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  devButtonClose: {
    backgroundColor: '#666',
    marginBottom: 0,
  },
  devButtonText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
  devMenuToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  devMenuToggleText: {
    fontSize: 20,
  },
});

export default DashboardScreen;
