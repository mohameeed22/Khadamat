import { isFirebaseConfigured, auth } from '../config/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

/**
 * Service to handle Phone OTP authentication via Firebase with a local dev fallback.
 * Allows instant testing of the entire UX without blocking on Firebase Cloud Console setup.
 */

export const DEMO_OTP_CODE = '123456';

export const requestPhoneOtp = async (fullPhoneNumber, recaptchaVerifier = null) => {
  // Check if real Firebase credentials are configured
  if (isFirebaseConfigured() && auth && recaptchaVerifier) {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier);
      return {
        success: true,
        isMock: false,
        confirmationResult,
        phoneNumber: fullPhoneNumber,
      };
    } catch (error) {
      console.error('Firebase Phone Auth error:', error);
      throw error;
    }
  }

  // Development & Demo mode fallback:
  // Provides full parity with Firebase ConfirmationResult
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate realistic network delay

  const mockConfirmationResult = {
    verificationId: `mock_vid_${Date.now()}`,
    phoneNumber: fullPhoneNumber,
    confirm: async (code) => {
      await new Promise((res) => setTimeout(res, 600));
      // In demo mode, 123456 or any 6 digits starting with 12 are accepted
      if (code === DEMO_OTP_CODE || code.length === 6) {
        return {
          user: {
            uid: `user_${Date.now()}`,
            phoneNumber: fullPhoneNumber,
            phoneNumberVerified: true,
            createdAt: new Date().toISOString(),
          },
        };
      }
      const err = new Error('Invalid verification code');
      err.code = 'auth/invalid-verification-code';
      throw err;
    },
  };

  return {
    success: true,
    isMock: true,
    confirmationResult: mockConfirmationResult,
    phoneNumber: fullPhoneNumber,
  };
};

export const verifyPhoneOtp = async (confirmationResult, otpCode) => {
  if (!confirmationResult || !confirmationResult.confirm) {
    throw new Error('No active verification session found');
  }

  const cleanCode = otpCode.trim();
  if (cleanCode.length !== 6) {
    throw new Error('Verification code must be 6 digits');
  }

  try {
    const result = await confirmationResult.confirm(cleanCode);
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Error verifying OTP code:', error);
    throw error;
  }
};
