import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { DEMO_OTP_CODE } from '../../services/firebaseAuth';

export const OtpVerifyScreen = () => {
  const { t, isRTL } = useLanguage();
  const {
    pendingVerification,
    verifyOtp,
    isVerifyingOtp,
    sendOtp,
    clearPendingOtp,
    authError,
  } = useAuth();

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(45);
  const [resendActive, setResendActive] = useState(false);
  const [localError, setLocalError] = useState('');
  const [resendSuccessMsg, setResendSuccessMsg] = useState(false);

  const inputRef = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setResendActive(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Focus input automatically on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleCodeChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(cleaned);
    if (localError) setLocalError('');

    // Auto verify when 6 digits are typed
    if (cleaned.length === 6) {
      handleVerify(cleaned);
    }
  };

  const handleVerify = async (codeToVerify = code) => {
    if (codeToVerify.length !== 6) {
      setLocalError(t('invalidOtpError'));
      return;
    }

    const res = await verifyOtp(codeToVerify);
    if (!res.success) {
      setLocalError(res.error?.message || t('invalidOtpError'));
    }
  };

  const handleResend = async () => {
    if (!resendActive || !pendingVerification?.phoneNumber) return;
    setResendSuccessMsg(false);
    setLocalError('');
    const res = await sendOtp(pendingVerification.phoneNumber);
    if (res.success) {
      setTimer(45);
      setResendActive(false);
      setResendSuccessMsg(true);
      setTimeout(() => setResendSuccessMsg(false), 4000);
    }
  };

  // Helper to render the 6 digit boxes
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = code[i] || '';
      const isCurrent = i === code.length;
      boxes.push(
        <View
          key={i}
          style={[
            styles.otpBox,
            isCurrent && styles.otpBoxActive,
            char && styles.otpBoxFilled,
          ]}
        >
          <Text style={styles.otpBoxText}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onBack={clearPendingOtp} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={36} color={COLORS.primary} />
          </View>

          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('otpTitle')}
          </Text>

          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {t('otpSubtitle')}
          </Text>

          <View style={styles.phoneBadge}>
            <Text style={styles.phoneBadgeText}>
              {pendingVerification?.phoneNumber || '+216 -- --- ---'}
            </Text>
            <TouchableOpacity onPress={clearPendingOtp} style={styles.changePhoneBtn}>
              <Text style={styles.changePhoneText}>{t('phoneChangeLink')}</Text>
            </TouchableOpacity>
          </View>

          {/* Hidden Input with visible custom boxes */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.otpContainer}
          >
            <View style={[styles.boxesRow, isRTL && styles.boxesRowRTL]}>
              {renderOtpBoxes()}
            </View>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.hiddenInput}
              autoFocus
            />
          </TouchableOpacity>

          {/* Test Hint if in mock mode */}
          {pendingVerification?.isMock && (
            <View style={styles.hintBanner}>
              <Ionicons name="information-circle" size={16} color={COLORS.primaryDark} />
              <Text style={styles.hintText}>
                Code démo pré-rempli : <Text style={styles.hintBold}>{DEMO_OTP_CODE}</Text>
              </Text>
              <TouchableOpacity
                onPress={() => handleCodeChange(DEMO_OTP_CODE)}
                style={styles.hintFillBtn}
              >
                <Text style={styles.hintFillText}>Remplir</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error and Success Feedback */}
          {(localError || authError) ? (
            <Text style={[styles.errorText, isRTL && styles.textRTL]}>
              {localError || authError}
            </Text>
          ) : null}

          {resendSuccessMsg ? (
            <Text style={styles.successText}>{t('codeSentSuccess')}</Text>
          ) : null}

          {/* Verify Button */}
          <Button
            title={t('verifyBtn')}
            onPress={() => handleVerify()}
            loading={isVerifyingOtp}
            size="lg"
            disabled={code.length !== 6}
            style={styles.verifyBtn}
          />

          {/* Resend Timer / Action */}
          <View style={styles.resendRow}>
            {resendActive ? (
              <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
                <Ionicons name="refresh" size={16} color={COLORS.primary} />
                <Text style={styles.resendBtnText}>{t('resendBtn')}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                {t('resendIn')} <Text style={styles.timerBold}>{timer}s</Text>
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.slate600,
    textAlign: 'center',
    marginBottom: 10,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: SPACING.xl,
    gap: 8,
  },
  phoneBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  changePhoneBtn: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.slate300,
    paddingLeft: 8,
  },
  changePhoneText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
  },

  // OTP Boxes
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  boxesRowRTL: {
    flexDirection: 'row-reverse',
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  otpBoxFilled: {
    borderColor: COLORS.primaryDark,
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  // Hint
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  hintBold: {
    fontWeight: '800',
  },
  hintFillBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  hintFillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // Messages
  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  successText: {
    fontSize: 13,
    color: COLORS.success,
    marginBottom: SPACING.sm,
    fontWeight: '600',
    textAlign: 'center',
  },

  verifyBtn: {
    width: '100%',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  resendRow: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 13,
    color: COLORS.slate500,
  },
  timerBold: {
    fontWeight: '700',
    color: COLORS.slate800,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
