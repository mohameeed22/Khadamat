import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RequestProvider } from './src/context/RequestContext';
import { ArtisanProvider } from './src/context/ArtisanContext';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { OtpVerifyScreen } from './src/screens/auth/OtpVerifyScreen';
import { RoleSelectScreen } from './src/screens/auth/RoleSelectScreen';
import { ProfileSetupScreen } from './src/screens/auth/ProfileSetupScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { COLORS } from './src/constants/theme';

function MainNavigator() {
  const { user, isLoading, pendingVerification } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoBadge}>
          <Ionicons name="construct" size={32} color={COLORS.white} />
        </View>
        <Text style={styles.loadingTitle}>خدمات</Text>
        <Text style={styles.loadingSubtitle}>Khadamat</Text>
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  // Not logged in: Phone Input or OTP Verification
  if (!user) {
    if (pendingVerification) {
      return <OtpVerifyScreen />;
    }
    return <LoginScreen />;
  }

  // Logged in: Check onboarding stages
  // Stage 1: Role Selection (Client vs Provider)
  if (!user.role) {
    return <RoleSelectScreen />;
  }

  // Stage 2: Profile Setup (Name, City, Categories)
  if (!user.profile || !user.profile.completedAt) {
    return <ProfileSetupScreen />;
  }

  // Stage 3: Main App Dashboard
  return <HomeScreen />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RequestProvider>
          <ArtisanProvider>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <MainNavigator />
          </ArtisanProvider>
        </RequestProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
