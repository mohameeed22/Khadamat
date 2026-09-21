import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { Button } from '../components/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { SERVICE_CATEGORIES } from '../constants/translations';

export const HomeScreen = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, logout, selectRole } = useAuth();

  const isProvider = user?.role === 'provider';
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleToggle = () => {
    const newRole = isProvider ? 'client' : 'provider';
    selectRole(newRole);
  };

  const getCategoryLabel = (cat) => {
    if (language === 'ar') return cat.labelAr;
    if (language === 'fr') return cat.labelFr;
    return cat.labelEn;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar */}
      <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
        <View style={[styles.userInfo, isRTL && styles.userInfoRTL]}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: isProvider ? COLORS.secondaryLight : COLORS.primaryMuted },
            ]}
          >
            <Ionicons
              name={isProvider ? 'hammer' : 'person'}
              size={20}
              color={isProvider ? COLORS.secondaryDark : COLORS.primary}
            />
          </View>
          <View style={styles.userTextCol}>
            <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.profile?.fullName || (isRTL ? 'مستخدم خدمات' : 'Utilisateur')}
              </Text>
            </View>
            <View style={[styles.subInfoRow, isRTL && styles.subInfoRowRTL]}>
              <Ionicons name="location-sharp" size={12} color={COLORS.primary} />
              <Text style={styles.userGov}>{user?.profile?.governorate || 'Tunisie'}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.phoneVerifiedText}>✓ {t('verifiedBadge')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <LanguageSelector compact />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Role Badge & Quick Switch Banner */}
        <View
          style={[
            styles.roleBanner,
            isProvider ? styles.roleBannerProvider : styles.roleBannerClient,
            isRTL && styles.roleBannerRTL,
          ]}
        >
          <View style={[styles.roleBadgeContent, isRTL && styles.roleBadgeContentRTL]}>
            <Ionicons
              name={isProvider ? 'briefcase' : 'cart'}
              size={18}
              color={isProvider ? COLORS.secondaryDark : COLORS.primaryDark}
            />
            <Text
              style={[
                styles.roleBannerText,
                { color: isProvider ? COLORS.secondaryDark : COLORS.primaryDark },
              ]}
            >
              {isProvider ? t('providerBadge') : t('clientBadge')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRoleToggle}
            activeOpacity={0.7}
            style={styles.switchRoleBtn}
          >
            <Ionicons name="swap-horizontal" size={14} color={COLORS.slate700} />
            <Text style={styles.switchRoleText}>{t('switchRole')}</Text>
          </TouchableOpacity>
        </View>

        {/* ----------------- PROVIDER VIEW ----------------- */}
        {isProvider ? (
          <View style={styles.providerSection}>
            {/* Availability Toggle */}
            <View style={[styles.onlineCard, SHADOWS.sm, isRTL && styles.onlineCardRTL]}>
              <View style={[styles.onlineLeft, isRTL && styles.onlineLeftRTL]}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: isOnline ? COLORS.success : COLORS.slate400 },
                  ]}
                />
                <View>
                  <Text style={[styles.onlineTitle, isRTL && styles.textRTL]}>
                    {isOnline ? t('providerStatusOnline') : t('providerStatusOffline')}
                  </Text>
                  <Text style={[styles.onlineSubtitle, isRTL && styles.textRTL]}>
                    {isOnline
                      ? (isRTL ? 'الحرفاء في منطقتك يشوفوا فيك الآن' : 'Visibilité activée sur la carte')
                      : (isRTL ? 'لن تتلقى إشعارات طلبات جديدة' : 'Vous ne recevrez pas de demandes')}
                  </Text>
                </View>
              </View>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: COLORS.slate300, true: COLORS.primaryLight }}
                thumbColor={isOnline ? COLORS.primary : COLORS.white}
              />
            </View>

            {/* Provider Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, SHADOWS.sm]}>
                <Text style={styles.statNumber}>85 DT</Text>
                <Text style={styles.statLabel}>{t('providerEarnings')}</Text>
              </View>
              <View style={[styles.statCard, SHADOWS.sm]}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>{t('completedJobs')}</Text>
              </View>
              <View style={[styles.statCard, SHADOWS.sm]}>
                <View style={styles.ratingRow}>
                  <Text style={styles.statNumber}>4.9</Text>
                  <Ionicons name="star" size={16} color={COLORS.secondary} />
                </View>
                <Text style={styles.statLabel}>18 avis</Text>
              </View>
            </View>

            {/* Sample Incoming Request */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {isRTL ? 'طلبات خدمة جديدة قريبة منك' : 'Demandes récentes à proximité'}
            </Text>
            <View style={[styles.requestCard, SHADOWS.sm]}>
              <View style={[styles.requestHeader, isRTL && styles.requestHeaderRTL]}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>
                    {isRTL ? 'سباكة' : 'Plomberie'}
                  </Text>
                </View>
                <Text style={styles.timeAgo}>
                  {isRTL ? 'منذ 10 دقائق' : 'Il y a 10 min'}
                </Text>
              </View>
              <Text style={[styles.requestTitle, isRTL && styles.textRTL]}>
                {isRTL
                  ? 'تسريح وتصليح حنفية المطبخ (Ariana)'
                  : 'Réparation fuite sous évier (Ariana Ville)'}
              </Text>
              <View style={[styles.requestMeta, isRTL && styles.requestMetaRTL]}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={14} color={COLORS.slate500} />
                  <Text style={styles.metaText}>Ariana Ville (3.2 km)</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={14} color={COLORS.primary} />
                  <Text style={[styles.metaText, { color: COLORS.primaryDark, fontWeight: '700' }]}>
                    40 DT (Cash)
                  </Text>
                </View>
              </View>
              <View style={styles.requestActionRow}>
                <TouchableOpacity
                  onPress={() => Alert.alert(isRTL ? 'تم قبول الطلب بنجاح' : 'Mission acceptée !')}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>
                    {isRTL ? 'قبول والاتصال بالحريف' : 'Accepter & Contacter'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* ----------------- CLIENT VIEW ----------------- */
          <View style={styles.clientSection}>
            {/* Search Input Bar */}
            <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
              <Ionicons name="search" size={20} color={COLORS.slate400} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={COLORS.slate400}
                style={[styles.searchInput, isRTL && styles.textRTL]}
              />
            </View>

            {/* Cash on Delivery Guarantee Banner */}
            <View style={[styles.cashBanner, isRTL && styles.cashBannerRTL]}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primaryDark} />
              <Text style={[styles.cashBannerText, isRTL && styles.textRTL]}>
                {t('cashPaymentNotice')}
              </Text>
            </View>

            {/* Popular Service Categories */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('popularCategories')}
            </Text>
            <View style={styles.categoriesGrid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  style={[styles.categoryCard, SHADOWS.sm]}
                  onPress={() =>
                    Alert.alert(
                      getCategoryLabel(cat),
                      isRTL
                        ? 'سيتم عرض قائمة الصنايعية المتاحين في ولايتك قريباً في المرحلة 2'
                        : 'Liste des artisans disponibles bientôt dans la phase 2'
                    )
                  }
                >
                  <View style={styles.categoryIconCircle}>
                    <Ionicons name={cat.icon} size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.categoryTitle} numberOfLines={2}>
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Post a custom request CTA */}
            <View style={[styles.postRequestCard, SHADOWS.md]}>
              <View style={styles.postRequestIcon}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.postRequestTextCol}>
                <Text style={[styles.postRequestTitle, isRTL && styles.textRTL]}>
                  {t('newBookingRequest')}
                </Text>
                <Text style={[styles.postRequestSub, isRTL && styles.textRTL]}>
                  {isRTL
                    ? 'اوصف حاجتك وخلّي الصنايعية يقدّموا عروضهم'
                    : 'Publiez votre besoin et recevez des devis'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity onPress={logout} activeOpacity={0.7} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  topBarRTL: {
    flexDirection: 'row-reverse',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfoRTL: {
    flexDirection: 'row-reverse',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRowRTL: {
    flexDirection: 'row-reverse',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subInfoRowRTL: {
    flexDirection: 'row-reverse',
  },
  userGov: {
    fontSize: 12,
    color: COLORS.slate600,
    fontWeight: '600',
  },
  dot: {
    fontSize: 10,
    color: COLORS.slate400,
  },
  phoneVerifiedText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },
  topBarRight: {
    marginLeft: 8,
  },
  scrollContent: {
    padding: SPACING.md,
  },

  // Role Banner
  roleBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  roleBannerRTL: {
    flexDirection: 'row-reverse',
  },
  roleBannerClient: {
    backgroundColor: COLORS.primaryMuted,
  },
  roleBannerProvider: {
    backgroundColor: COLORS.warningLight,
  },
  roleBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadgeContentRTL: {
    flexDirection: 'row-reverse',
  },
  roleBannerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  switchRoleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.slate700,
  },

  // Provider
  providerSection: {
    marginBottom: SPACING.lg,
  },
  onlineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  onlineCardRTL: {
    flexDirection: 'row-reverse',
  },
  onlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  onlineLeftRTL: {
    flexDirection: 'row-reverse',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.full,
  },
  onlineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  onlineSubtitle: {
    fontSize: 11,
    color: COLORS.slate500,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.slate500,
    marginTop: 4,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Request Card
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginTop: SPACING.xs,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  categoryTag: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.slate400,
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  requestMetaRTL: {
    flexDirection: 'row-reverse',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.slate600,
  },
  requestActionRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    paddingTop: 10,
  },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Client View
  clientSection: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    marginBottom: SPACING.md,
    gap: 10,
  },
  searchBarRTL: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.slate900,
  },
  cashBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.md,
    padding: 10,
    gap: 8,
    marginBottom: SPACING.lg,
  },
  cashBannerRTL: {
    flexDirection: 'row-reverse',
  },
  cashBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: SPACING.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate800,
    textAlign: 'center',
    lineHeight: 14,
  },

  postRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    gap: 12,
  },
  postRequestIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postRequestTextCol: {
    flex: 1,
  },
  postRequestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 2,
  },
  postRequestSub: {
    fontSize: 12,
    color: COLORS.slate600,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
    gap: 6,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  textRTL: {
    textAlign: 'right',
  },
});
