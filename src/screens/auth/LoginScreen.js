import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { COUNTRIES } from '../../constants/translations';

export const LoginScreen = () => {
  const { t, isRTL } = useLanguage();
  const { sendOtp, isSendingOtp, authError, quickDemoLogin } = useAuth();

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default +216 Tunisia
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [localError, setLocalError] = useState('');

  const formatPhoneNumber = (text) => {
    // Keep only digits
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);
    if (localError) setLocalError('');
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      setLocalError(
        isRTL
          ? 'الرجاء إدخال رقم هاتف صالح (8 أرقام على الأقل)'
          : 'Veuillez saisir un numéro de téléphone valide (min 8 chiffres)'
      );
      return;
    }

    const fullPhone = `${selectedCountry.code}${phoneNumber}`;
    const res = await sendOtp(fullPhone);
    if (!res.success) {
      setLocalError(res.error?.message || 'Error sending SMS');
    }
  };

  const handleQuickDemo = (role) => {
    quickDemoLogin(role);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Banner */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="construct" size={36} color={COLORS.primary} />
            </View>
            <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
              {t('loginTitle')}
            </Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
              {t('loginSubtitle')}
            </Text>
          </View>

          {/* Phone Input Card */}
          <View style={[styles.card, SHADOWS.md]}>
            <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>
              {t('phoneLabel')}
            </Text>

            <View style={[styles.phoneInputRow, isRTL && styles.phoneInputRowRTL]}>
              {/* Country Selector Pill */}
              <TouchableOpacity
                onPress={() => setShowCountryModal(true)}
                activeOpacity={0.7}
                style={styles.countryPickerBtn}
              >
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.slate500} />
              </TouchableOpacity>

              {/* Phone text input */}
              <View style={styles.phoneInputWrap}>
                <InputWrapper
                  value={phoneNumber}
                  onChangeText={formatPhoneNumber}
                  placeholder={t('phonePlaceholder')}
                  keyboardType="phone-pad"
                  maxLength={10}
                  isRTL={isRTL}
                />
              </View>
            </View>

            {(localError || authError) ? (
              <Text style={[styles.errorMessage, isRTL && styles.textRTL]}>
                {localError || authError}
              </Text>
            ) : null}

            <Button
              title={t('sendOtpBtn')}
              onPress={handleSendOtp}
              loading={isSendingOtp}
              size="lg"
              icon={isRTL ? 'arrow-back' : 'arrow-forward'}
              iconPosition={isRTL ? 'left' : 'right'}
              style={styles.submitBtn}
            />

            <Text style={[styles.termsNotice, isRTL && styles.textRTL]}>
              {t('termsNotice')}
            </Text>
          </View>

          {/* Quick Demo Section (Instant testing for reviewers) */}
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <Ionicons name="flash" size={18} color={COLORS.secondaryDark} />
              <Text style={styles.demoTitle}>Mode Démo / تجربة فورية</Text>
            </View>
            <Text style={styles.demoDesc}>
              {t('quickDemoHint')}
            </Text>
            <View style={styles.demoBtnRow}>
              <TouchableOpacity
                onPress={() => handleQuickDemo('client')}
                activeOpacity={0.8}
                style={[styles.demoBtn, { borderColor: COLORS.primary }]}
              >
                <Ionicons name="person" size={16} color={COLORS.primary} />
                <Text style={[styles.demoBtnText, { color: COLORS.primary }]}>
                  {isRTL ? 'دخول كـ حريف' : 'Accès Client'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleQuickDemo('provider')}
                activeOpacity={0.8}
                style={[styles.demoBtn, { borderColor: COLORS.secondaryDark }]}
              >
                <Ionicons name="hammer" size={16} color={COLORS.secondaryDark} />
                <Text style={[styles.demoBtnText, { color: COLORS.secondaryDark }]}>
                  {isRTL ? 'دخول كـ صنايعي' : 'Accès Prestataire'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <Modal visible={showCountryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez l'indicatif</Text>
              <TouchableOpacity
                onPress={() => setShowCountryModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={COLORS.slate700} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                  }}
                  style={[
                    styles.countryItem,
                    item.code === selectedCountry.code && styles.countryItemActive,
                  ]}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.name}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Simplified inline TextInput wrapper to keep styling compact
import { TextInput } from 'react-native';
const InputWrapper = ({ value, onChangeText, placeholder, keyboardType, maxLength, isRTL }) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={COLORS.slate400}
    keyboardType={keyboardType}
    maxLength={maxLength}
    textAlign={isRTL ? 'right' : 'left'}
    style={[styles.phoneTextInput, isRTL && styles.textRTL]}
  />
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  heroIconCircle: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.slate600,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  textRTL: {
    textAlign: 'right',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate800,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  phoneInputRowRTL: {
    flexDirection: 'row-reverse',
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.slate100,
    borderRightWidth: 1,
    borderRightColor: COLORS.slate200,
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.slate800,
    marginRight: 4,
  },
  phoneInputWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  phoneTextInput: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.slate900,
    letterSpacing: 1,
    paddingVertical: 10,
  },
  errorMessage: {
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  termsNotice: {
    fontSize: 11,
    color: COLORS.slate500,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Demo Card
  demoCard: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondaryDark,
    marginLeft: 6,
  },
  demoDesc: {
    fontSize: 12,
    color: COLORS.slate700,
    marginBottom: 10,
    lineHeight: 16,
  },
  demoBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  modalCloseBtn: {
    padding: 4,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  countryItemActive: {
    backgroundColor: COLORS.primaryMuted,
  },
  countryItemFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  countryItemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  countryItemCode: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
