import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { Button } from '../components/Button';

export const ArtisanDetailModal = ({ visible, artisan, onClose, onBookDirect }) => {
  const { t, isRTL, language } = useLanguage();

  if (!artisan) return null;

  const handleCall = () => {
    if (!artisan.phone) return;
    const phoneUrl = `tel:${artisan.phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert(
            isRTL ? 'رقم الهاتف' : 'Numéro de téléphone',
            `${artisan.name}: ${artisan.phone}`
          );
        }
      })
      .catch(() => {
        Alert.alert(
          isRTL ? 'رقم الهاتف' : 'Numéro de téléphone',
          `${artisan.name}: ${artisan.phone}`
        );
      });
  };

  const handleWhatsApp = () => {
    if (!artisan.whatsapp) return;
    const cleanPhone = artisan.whatsapp.replace(/[^0-9]/g, '');
    const message = isRTL
      ? `سلام، شفت بروفيلك على تطبيق خدمات ونحب نسألك على خدمة...`
      : `Bonjour, j’ai vu votre profil sur l’application Khadamat et je souhaite me renseigner...`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Alert.alert(
            'WhatsApp',
            `${artisan.name}: ${artisan.whatsapp}`
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'WhatsApp',
          `${artisan.name}: ${artisan.whatsapp}`
        );
      });
  };

  const getBio = () => {
    if (language === 'ar') return artisan.bioAr || artisan.bioFr;
    if (language === 'fr') return artisan.bioFr || artisan.bioAr;
    return artisan.bioEn || artisan.bioFr;
  };

  const getRoleTitle = () => {
    if (language === 'ar') return artisan.roleTitleAr;
    if (language === 'fr') return artisan.roleTitleFr;
    return artisan.roleTitleEn;
  };

  const getPriceUnit = () => {
    if (language === 'ar') return artisan.priceUnitAr;
    if (language === 'fr') return artisan.priceUnitFr;
    return artisan.priceUnitEn;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={COLORS.slate800} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('aboutArtisan')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={[styles.profileCard, SHADOWS.sm]}>
            <View style={[styles.avatarSection, isRTL && styles.avatarSectionRTL]}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={40} color={COLORS.primary} />
              </View>
              <View style={styles.avatarDetails}>
                <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
                  <Text style={[styles.artisanName, isRTL && styles.textRTL]}>{artisan.name}</Text>
                  {artisan.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                      <Text style={styles.verifiedText}>{t('verifiedPro')}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.roleTitle, isRTL && styles.textRTL]}>{getRoleTitle()}</Text>
                <View style={[styles.locationRow, isRTL && styles.locationRowRTL]}>
                  <Ionicons name="location-sharp" size={14} color={COLORS.slate500} />
                  <Text style={styles.locationText}>{artisan.city || artisan.governorate}</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color={COLORS.secondary} />
                  <Text style={styles.statValue}>{artisan.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.statLabel}>{artisan.reviewsCount} {t('reviews')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{artisan.completedJobs}</Text>
                <Text style={styles.statLabel}>{t('jobsDone')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <View style={styles.statusDotRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: artisan.isAvailable ? COLORS.success : COLORS.slate400 },
                    ]}
                  />
                  <Text style={[styles.statValue, { fontSize: 13 }]}>
                    {artisan.isAvailable ? t('availableNow') : t('busyNow')}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Statut</Text>
              </View>
            </View>
          </View>

          {/* Pricing Estimation Card */}
          <View style={[styles.pricingCard, SHADOWS.sm]}>
            <View style={[styles.pricingHeader, isRTL && styles.pricingHeaderRTL]}>
              <Ionicons name="cash" size={24} color={COLORS.primary} />
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={[styles.pricingTitle, isRTL && styles.textRTL]}>
                  {artisan.priceEstimate}
                </Text>
                <Text style={[styles.pricingSub, isRTL && styles.textRTL]}>{getPriceUnit()}</Text>
              </View>
            </View>
            <Text style={[styles.pricingNotice, isRTL && styles.textRTL]}>
              {t('cashPaymentNotice')}
            </Text>
          </View>

          {/* Bio Section */}
          <View style={[styles.sectionBox, SHADOWS.sm]}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('aboutArtisan')}</Text>
            <Text style={[styles.bioText, isRTL && styles.textRTL]}>{getBio()}</Text>
          </View>

          {/* Specialties / Skills */}
          {artisan.skills && artisan.skills.length > 0 && (
            <View style={[styles.sectionBox, SHADOWS.sm]}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {t('servicesSpecialties')}
              </Text>
              <View style={[styles.skillsRow, isRTL && styles.skillsRowRTL]}>
                {artisan.skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillChip}>
                    <Ionicons name="checkmark" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={[styles.bottomBar, SHADOWS.lg]}>
          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.waBtn]}
          >
            <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
            <Text style={styles.waBtnText}>{t('whatsappChat')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.callBtn]}
          >
            <Ionicons name="call" size={20} color={COLORS.white} />
            <Text style={styles.callBtnText}>{t('callNow')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.slate100,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSectionRTL: {
    flexDirection: 'row-reverse',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginLeft: 0,
  },
  avatarDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  nameRowRTL: {
    flexDirection: 'row-reverse',
  },
  artisanName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roleTitle: {
    fontSize: 13,
    color: COLORS.slate600,
    fontWeight: '600',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationRowRTL: {
    flexDirection: 'row-reverse',
  },
  locationText: {
    fontSize: 13,
    color: COLORS.slate500,
  },
  textRTL: {
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.slate200,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.slate500,
    marginTop: 2,
  },
  pricingCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricingHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  pricingSub: {
    fontSize: 12,
    color: COLORS.slate600,
    fontWeight: '600',
    marginTop: 2,
  },
  pricingNotice: {
    fontSize: 11,
    color: COLORS.slate500,
    marginTop: 8,
    lineHeight: 16,
  },
  sectionBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.slate700,
    lineHeight: 20,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  skillsRowRTL: {
    flexDirection: 'row-reverse',
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  waBtn: {
    backgroundColor: '#25D366', // WhatsApp Green
  },
  waBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  callBtn: {
    backgroundColor: COLORS.primary,
  },
  callBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
