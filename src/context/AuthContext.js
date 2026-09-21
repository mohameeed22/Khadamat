import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestPhoneOtp, verifyPhoneOtp } from '../services/firebaseAuth';

const USER_STORAGE_KEY = '@khadamat_auth_user_v1';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  pendingVerification: null,
  authError: null,
  isSendingOtp: false,
  isVerifyingOtp: false,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  clearPendingOtp: () => {},
  selectRole: async () => {},
  saveProfile: async () => {},
  quickDemoLogin: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Restore stored session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.warn('Failed to restore user session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const persistUser = async (updatedUser) => {
    setUser(updatedUser);
    try {
      if (updatedUser) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to persist user to storage:', err);
    }
  };

  const sendOtp = async (fullPhoneNumber, recaptchaVerifier = null) => {
    setIsSendingOtp(true);
    setAuthError(null);
    try {
      const result = await requestPhoneOtp(fullPhoneNumber, recaptchaVerifier);
      setPendingVerification({
        confirmationResult: result.confirmationResult,
        phoneNumber: fullPhoneNumber,
        isMock: result.isMock,
      });
      return { success: true };
    } catch (error) {
      setAuthError(error.message || 'Failed to send verification SMS');
      return { success: false, error };
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async (code) => {
    if (!pendingVerification || !pendingVerification.confirmationResult) {
      setAuthError('No pending verification found');
      return { success: false };
    }

    setIsVerifyingOtp(true);
    setAuthError(null);

    try {
      const { user: firebaseUser } = await verifyPhoneOtp(
        pendingVerification.confirmationResult,
        code
      );

      const newUserObj = {
        uid: firebaseUser.uid,
        phoneNumber: pendingVerification.phoneNumber,
        phoneNumberVerified: true,
        role: null,       // Will be set in RoleSelectScreen
        profile: null,    // Will be set in ProfileSetupScreen
        createdAt: new Date().toISOString(),
      };

      await persistUser(newUserObj);
      setPendingVerification(null);
      return { success: true, user: newUserObj };
    } catch (error) {
      setAuthError(error.message || 'Invalid verification code');
      return { success: false, error };
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const clearPendingOtp = () => {
    setPendingVerification(null);
    setAuthError(null);
  };

  const selectRole = async (role) => {
    if (!user) return;
    const updated = { ...user, role };
    await persistUser(updated);
  };

  const saveProfile = async (profileData) => {
    if (!user) return;
    const updated = {
      ...user,
      profile: {
        ...(user.profile || {}),
        ...profileData,
        completedAt: new Date().toISOString(),
      },
    };
    await persistUser(updated);
  };

  // Quick Demo Login for instant testing without manual typing
  const quickDemoLogin = async (role = 'client') => {
    const demoUser = {
      uid: `demo_user_${Date.now()}`,
      phoneNumber: '+216 20 123 456',
      phoneNumberVerified: true,
      role: role,
      profile: {
        fullName: role === 'client' ? 'أحمد التونسي (Ahmed)' : 'الأسعد النجار (Lassaad)',
        governorate: 'Tunis',
        services: role === 'provider' ? ['plumbing', 'electrical'] : [],
        bio: role === 'provider' ? 'صنايعي كهربائي وسباك ذو خبرة 8 سنوات في تونس الكبرى' : '',
        completedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
    await persistUser(demoUser);
    setPendingVerification(null);
  };

  const logout = async () => {
    await persistUser(null);
    setPendingVerification(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        pendingVerification,
        authError,
        isSendingOtp,
        isVerifyingOtp,
        sendOtp,
        verifyOtp,
        clearPendingOtp,
        selectRole,
        saveProfile,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
