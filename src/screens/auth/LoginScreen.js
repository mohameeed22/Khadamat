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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { Button } from '../../components/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { COUNTRIES } from '../../constants/translations';
import { isFirebaseConfigured } from '../../config/firebase';
import { DEMO_OTP_CODE } from '../../services/firebaseAuth';

const FEATURES = [
  { icon: 'shield-checkmark', ar: 'صنايعية موثوقين', fr: 'Artisans vérifiés', en: 'Verified pros' },
  { icon: 'cash', ar: 'الدفع كاش', fr: 'Paiement cash', en: 'Pay in cash' },
  { icon: 'flash', ar: 'استجابة سريعة', fr: 'Réponse rapide', en: 'Fast response' },
];

export const LoginScreen = () => {
  const { t, isRTL, language } = useLanguage();
  const { sendOtp, isSendingOtp, authError, quickDemoLogin } = useAuth();

  const tr = (ar, fr, en) => (language === 'ar' ? ar : language === 'fr' ? fr : en);

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default +216 Tunisia
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [localError, setLocalError] = useState('');
  const [focused, setFocused] = useState(false);

  const smsLive = isFirebaseConfigured();
  const phoneValid = phoneNumber.length >= 8;

  const onChangePhone = (text) => {
    setPhoneNumber(text.replace(/[^0-9]/g, ''));
    if (localError) setLocalError('');
  };

  const handleSendOtp = async () => {
    if (!phoneValid) {
      setLocalError(
        tr(
          'الرجاء إدخال رقم هاتف صالح (8 أرقام على الأقل)',
          'Veuillez saisir un numéro valide (8 chiffres minimum)',
          'Please enter a valid phone number (min 8 digits)'
        )
      );
      return;
    }
    const res = await sendOtp(`${selectedCountry.code}${phoneNumber}`);
    if (!res.success) {
      setLocalError(res.error?.message || tr('تعذر إرسال الرمز', "Échec de l'envoi du code", 'Could not send code'));
    }
  };

  const errorText = localError || authError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroDecorA} />
            <View style={styles.heroDecorB} />
            <View style={[styles.heroTopRow, isRTL && styles.rowRTL]}>
              <View style={[styles.brandRow, isRTL && styles.rowRTL]}>
                <View style={styles.logoBadge}>
                  <Ionicons name="construct" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.brandName}>خدمات</Text>
              </View>
              <LanguageSelector compact />
            </View>

            <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
              {tr('صنايعي موثوق، في بلاصتك', 'Le bon artisan, près de chez vous', 'The right pro, right near you')}
            </Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
              {tr(
                'سباكة، كهرباء، تكييف وأكثر — احجز في دقائق',
                'Plomberie, électricité, climatisation et plus — réservez en minutes',
                'Plumbing, electrical, A/C and more — book in minutes'
              )}
            </Text>

            <View style={[styles.featureRow, isRTL && styles.rowRTL]}>
              {FEATURES.map((f) => (
                <View key={f.icon} style={styles.featurePill}>
                  <Ionicons name={f.icon} size={13} color={COLORS.white} />
                  <Text style={styles.featureText}>{f[language] || f.en}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sign-in card (overlaps hero) */}
          <View style={[styles.card, SHADOWS.lg]}>
            <Text style={[styles.cardTitle, isRTL && styles.textRTL]}>
              {tr('دخول / إنشاء حساب', 'Connexion / Inscription', 'Sign in / Sign up')}
            </Text>
            <Text style={[styles.cardSub, isRTL && styles.textRTL]}>
              {tr(
                'نبعثولك رمز تأكيد بالـ SMS — بلا كلمة سر',
                'Nous vous envoyons un code par SMS — sans mot de passe',
                "We'll text you a code — no password needed"
              )}
            </Text>

            <Text style={[styles.inputLabel, isRTL && styles.textRTL]}>{t('phoneLabel')}</Text>
            <View
              style={[
                styles.phoneInputRow,
                isRTL && styles.rowRTL,
                focused && styles.phoneInputRowFocused,
                !!errorText && styles.phoneInputRowError,
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowCountryModal(true)}
                activeOpacity={0.7}
                style={styles.countryPickerBtn}
                accessibilityLabel="Select country code"
              >
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.slate500} />
              </TouchableOpacity>
              <TextInput
                value={phoneNumber}
                onChangeText={onChangePhone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={handleSendOtp}
                placeholder={t('phonePlaceholder')}
                placeholderTextColor={COLORS.slate400}
                keyboardType="phone-pad"
                maxLength={10}
                textAlign={isRTL ? 'right' : 'left'}
                style={[styles.phoneTextInput, isRTL && styles.textRTL]}
              />
              {phoneValid && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={{ marginHorizontal: 10 }} />}
            </View>

            {errorText ? (
              <View style={[styles.errorRow, isRTL && styles.rowRTL]}>
                <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
                <Text style={[styles.errorMessage, isRTL && styles.textRTL]}>{errorText}</Text>
              </View>
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

            {!smsLive && (
              <View style={[styles.testNotice, isRTL && styles.rowRTL]}>
                <Ionicons name="information-circle" size={16} color={COLORS.info} />
                <Text style={[styles.testNoticeText, isRTL && styles.textRTL]}>
                  {tr(
                    `الـ SMS الحقيقي غير مفعّل بعد. استعمل الرمز ${DEMO_OTP_CODE} للتأكيد.`,
                    `SMS réel non configuré. Utilisez le code ${DEMO_OTP_CODE} pour valider.`,
                    `Live SMS isn't configured yet. Use code ${DEMO_OTP_CODE} to verify.`
                  )}
                </Text>
              </View>
            )}

            <Text style={[styles.termsNotice, isRTL && styles.textRTL]}>{t('termsNotice')}</Text>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{tr('أو جرّب التطبيق', 'ou essayez', 'or try the app')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo mode */}
          <View style={styles.demoCard}>
            <View style={[styles.demoHeader, isRTL && styles.rowRTL]}>
              <View style={styles.demoIcon}>
                <Ionicons name="flask" size={16} color={COLORS.secondaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.demoTitle, isRTL && styles.textRTL]}>
                  {tr('وضع التجربة', 'Mode démo', 'Demo mode')}
                </Text>
                <Text style={[styles.demoDesc, isRTL && styles.textRTL]}>
                  {tr(
                    'بيانات تجريبية جاهزة. لا تأثير على حسابك الحقيقي.',
                    'Données fictives prêtes à explorer. Sans impact sur votre vrai compte.',
                    'Ready-made sample data. Separate from your real account.'
                  )}
                </Text>
              </View>
            </View>
            <View style={[styles.demoBtnRow, isRTL && styles.rowRTL]}>
              <TouchableOpacity
                onPress={() => quickDemoLogin('client')}
                activeOpacity={0.8}
                style={[styles.demoBtn, { borderColor: COLORS.primary }]}
              >
                <Ionicons name="person" size={16} color={COLORS.primary} />
                <Text style={[styles.demoBtnText, { color: COLORS.primary }]}>
                  {tr('تجربة كحريف', 'Démo Client', 'Demo as Client')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => quickDemoLogin('provider')}
                activeOpacity={0.8}
                style={[styles.demoBtn, { borderColor: COLORS.secondaryDark }]}
              >
                <Ionicons name="hammer" size={16} color={COLORS.secondaryDark} />
                <Text style={[styles.demoBtnText, { color: COLORS.secondaryDark }]}>
                  {tr('تجربة كصنايعي', 'Démo Prestataire', 'Demo as Pro')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Selection Modal */}
      <Modal visible={showCountryModal} animationType="slide" transparent onRequestClose={() => setShowCountryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{tr('اختر المفتاح الدولي', "Sélectionnez l'indicatif", 'Select country code')}</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)} style={styles.modalCloseBtn}>
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
                  style={[styles.countryItem, item.code === selectedCountry.code && styles.countryItemActive]}
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.slate50 },
  scrollContent: { paddingBottom: SPACING.xl },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right' },

  // Hero
  hero: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 64,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroDecorA: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
  heroDecorB: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.18,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: { fontSize: 22, fontWeight: '900', color: COLORS.white },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.primaryMuted,
    lineHeight: 21,
    marginBottom: SPACING.md,
  },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  featureText: { fontSize: 12, fontWeight: '700', color: COLORS.white },

  // Card
  card: {
    marginHorizontal: SPACING.md,
    marginTop: -40,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },
  cardTitle: { fontSize: 19, fontWeight: '800', color: COLORS.slate900 },
  cardSub: { fontSize: 13, color: COLORS.slate500, marginTop: 4, marginBottom: SPACING.md, lineHeight: 19 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.slate700, marginBottom: 8 },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate50,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  phoneInputRowFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  phoneInputRowError: { borderColor: COLORS.danger },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.slate100,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { fontSize: 15, fontWeight: '700', color: COLORS.slate800 },
  phoneTextInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate900,
    letterSpacing: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  errorMessage: { flex: 1, fontSize: 12, color: COLORS.danger, fontWeight: '600' },
  submitBtn: { marginTop: SPACING.xs, marginBottom: SPACING.md },
  testNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: SPACING.sm,
  },
  testNoticeText: { flex: 1, fontSize: 12, color: COLORS.slate700, lineHeight: 17 },
  termsNotice: { fontSize: 11, color: COLORS.slate500, textAlign: 'center', lineHeight: 16 },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.slate200 },
  dividerText: { fontSize: 12, fontWeight: '600', color: COLORS.slate500 },

  // Demo
  demoCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
  },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  demoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoTitle: { fontSize: 14, fontWeight: '800', color: COLORS.secondaryDark },
  demoDesc: { fontSize: 12, color: COLORS.slate700, marginTop: 2, lineHeight: 16 },
  demoBtnRow: { flexDirection: 'row', gap: 10 },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  demoBtnText: { fontSize: 13, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.slate300,
    marginBottom: SPACING.sm,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.slate900 },
  modalCloseBtn: { padding: 4 },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  countryItemActive: { backgroundColor: COLORS.primaryMuted },
  countryItemFlag: { fontSize: 22, marginRight: 12 },
  countryItemName: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.slate800 },
  countryItemCode: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
});
