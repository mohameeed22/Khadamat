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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { Button } from '../components/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { SERVICE_CATEGORIES } from '../constants/translations';
import { ArtisanDirectoryModal } from './ArtisanDirectoryModal';
import { PostRequestModal } from './PostRequestModal';
import { MyRequestsModal } from './MyRequestsModal';
import { PhotoGallery } from '../components/PhotoGallery';
import { openDirections, openInMaps, resolveCoords, getGovernorateCoords, distanceKm, formatDistance } from '../utils/geo';

export const HomeScreen = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, logout, selectRole } = useAuth();
  const { requests, acceptRequest, completeRequest, getRequestsForProvider, addOffer, getRequestsByClient } = useRequests();
  const [offerInputs, setOfferInputs] = useState({});

  const slotLabel = (slot) =>
    ({
      morning: { ar: 'صباح', fr: 'Matin', en: 'Morning' },
      afternoon: { ar: 'بعد الزوال', fr: 'Après-midi', en: 'Afternoon' },
      evening: { ar: 'عشية', fr: 'Soir', en: 'Evening' },
    }[slot]?.[language] || slot);

  const handleSendOffer = async (req) => {
    const price = parseFloat(offerInputs[req.id]);
    if (!price || price <= 0) {
      Alert.alert(isRTL ? 'تنبيه' : 'Attention', isRTL ? 'أدخل سعر صحيح' : 'Entrez un prix valide');
      return;
    }
    await addOffer(req.id, user, price);
    setOfferInputs((p) => ({ ...p, [req.id]: '' }));
    Alert.alert(isRTL ? 'تم إرسال عرضك' : 'Offre envoyée', `${price} DT`);
  };

  const isProvider = user?.role === 'provider';

  // Distance from the provider's governorate centre to a request (approximate)
  const requestDistance = (req) => {
    const km = distanceKm(getGovernorateCoords(user?.profile?.governorate), resolveCoords(req));
    return km == null ? '' : `~${formatDistance(km)}`;
  };
  const mapLabel = isRTL ? 'الموقع' : language === 'fr' ? 'Itinéraire' : 'Directions';
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [directoryVisible, setDirectoryVisible] = useState(false);
  const [directoryCategory, setDirectoryCategory] = useState(null);
  const [postRequestVisible, setPostRequestVisible] = useState(false);
  const [myRequestsVisible, setMyRequestsVisible] = useState(false);

  const handleRoleToggle = () => {
    const newRole = isProvider ? 'client' : 'provider';
    selectRole(newRole);
  };

  const getCategoryLabel = (cat) => {
    if (language === 'ar') return cat.labelAr;
    if (language === 'fr') return cat.labelFr;
    return cat.labelEn;
  };

  const openDirectory = (catId = null) => {
    setDirectoryCategory(catId);
    setDirectoryVisible(true);
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) return;
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert(isRTL ? 'رقم الهاتف' : 'Téléphone', phoneNumber);
        }
      })
      .catch(() => {
        Alert.alert(isRTL ? 'رقم الهاتف' : 'Téléphone', phoneNumber);
      });
  };

  const handleAcceptRequest = (req) => {
    Alert.alert(
      isRTL ? 'تأكيد قبول المهمة' : 'Accepter la mission',
      isRTL
        ? `هل تريد قبول طلب: "${req.title}" بميزانية ${req.budget} د.ت؟ سيتم تزويدك برقم هاتف الحريف للتنسيق معه.`
        : `Voulez-vous accepter la mission "${req.title}" (${req.budget} DT) ? Vous pourrez contacter directement le client.`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: isRTL ? 'قبول والاتصال' : 'Accepter & Appeler',
          onPress: async () => {
            await acceptRequest(req.id, user);
            Alert.alert(
              isRTL ? 'تم قبول المهمة بنجاح!' : 'Mission acceptée !',
              `${isRTL ? 'رقم هاتف الحريف' : 'Téléphone du client'}: ${req.clientPhone}`,
              [
                { text: t('close'), style: 'cancel' },
                {
                  text: t('callNow'),
                  onPress: () => handleCall(req.clientPhone),
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Open requests available to accept
  const availableRequests = getRequestsForProvider(
    user?.profile?.services,
    user?.profile?.governorate
  );
  // Missions accepted by this provider
  const myAcceptedMissions = requests.filter(
    (r) => r.status === 'in_progress' && r.assignedProvider?.id === (user?.uid || 'provider_local')
  );

  const isDemo = !!user?.isDemo;
  const myRequestCount = getRequestsByClient(user?.phoneNumber || user?.uid).length;
  const myUid = user?.uid || 'provider_local';
  const myCompleted = requests.filter(
    (r) => r.status === 'completed' && r.assignedProvider?.id === myUid
  );
  const myReviews = myCompleted.filter((r) => r.review).map((r) => r.review.rating);
  const stats = isDemo
    ? { earnings: 85, jobs: 12, rating: 4.9, reviews: 18 }
    : {
        earnings: myCompleted.reduce((sum, r) => sum + (parseFloat(r.budget) || 0), 0),
        jobs: myCompleted.length,
        rating: myReviews.length ? myReviews.reduce((a, b) => a + b, 0) / myReviews.length : 0,
        reviews: myReviews.length,
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
              {user?.isDemo ? (
                <Text style={styles.phoneVerifiedText}>DEMO</Text>
              ) : (
                <Text style={styles.phoneVerifiedText}>✓ {t('verifiedBadge')}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.topBarRight, isRTL && styles.topBarRightRTL]}>
          {/* My Requests quick button for Clients */}
          {!isProvider && (
            <TouchableOpacity
              onPress={() => setMyRequestsVisible(true)}
              style={styles.myRequestsBadgeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="clipboard-outline" size={18} color={COLORS.primary} />
              {myRequestCount > 0 && (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>{myRequestCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          <LanguageSelector compact />
        </View>
      </View>

      {isDemo && (
        <View style={[styles.demoStrip, isRTL && styles.topBarRTL]}>
          <Ionicons name="flask" size={14} color={COLORS.secondaryDark} />
          <Text style={styles.demoStripText} numberOfLines={1}>
            {isRTL ? 'وضع التجربة: بيانات تجريبية' : 'Mode démo : données fictives'}
          </Text>
          <TouchableOpacity onPress={logout} activeOpacity={0.7}>
            <Text style={styles.demoStripExit}>{isRTL ? 'خروج من التجربة' : 'Quitter la démo'}</Text>
          </TouchableOpacity>
        </View>
      )}

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
                <Text style={styles.statNumber}>{stats.earnings} DT</Text>
                <Text style={styles.statLabel}>{t('providerEarnings')}</Text>
              </View>
              <View style={[styles.statCard, SHADOWS.sm]}>
                <Text style={styles.statNumber}>{stats.jobs}</Text>
                <Text style={styles.statLabel}>{t('completedJobs')}</Text>
              </View>
              <View style={[styles.statCard, SHADOWS.sm]}>
                <View style={styles.ratingRow}>
                  <Text style={styles.statNumber}>{stats.reviews ? stats.rating.toFixed(1) : '—'}</Text>
                  <Ionicons name="star" size={16} color={COLORS.secondary} />
                </View>
                <Text style={styles.statLabel}>{stats.reviews} {t('reviews')}</Text>
              </View>
            </View>

            {/* In-Progress Missions (if any) */}
            {myAcceptedMissions.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                  {isRTL ? 'مهام جارية قيد الإنجاز' : 'Missions en cours'}
                </Text>
                {myAcceptedMissions.map((mission) => (
                  <View key={mission.id} style={[styles.inProgressCard, SHADOWS.sm]}>
                    <View style={[styles.requestHeader, isRTL && styles.requestHeaderRTL]}>
                      <View style={styles.inProgressTag}>
                        <Ionicons name="time" size={12} color="#B45309" />
                        <Text style={styles.inProgressTagText}>{t('statusInProgress')}</Text>
                      </View>
                      <Text style={styles.budgetAmount}>{mission.budget} DT</Text>
                    </View>
                    <Text style={[styles.requestTitle, isRTL && styles.textRTL]}>{mission.title}</Text>
                    <View style={[styles.clientInfoRow, isRTL && styles.clientInfoRowRTL]}>
                      <Ionicons name="person-outline" size={14} color={COLORS.slate500} />
                      <Text style={styles.clientNameText}>{mission.clientName}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.metaText}>{mission.governorate}</Text>
                    </View>
                    {(mission.photos || []).length > 0 && <PhotoGallery photos={mission.photos} />}
                    {!!mission.description && (
                      <Text style={[styles.requestDesc, isRTL && styles.textRTL]} numberOfLines={3}>
                        {mission.description}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => openDirections(resolveCoords(mission))}
                      style={[styles.mapChip, isRTL && styles.requestMetaRTL]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="navigate" size={14} color={COLORS.primaryDark} />
                      <Text style={styles.mapChipText} numberOfLines={1}>
                        {mission.location?.address || mapLabel}
                      </Text>
                    </TouchableOpacity>
                    <View style={[styles.missionActionRow, isRTL && styles.missionActionRowRTL]}>
                      <TouchableOpacity
                        onPress={() => handleCall(mission.clientPhone)}
                        style={styles.callClientBtn}
                      >
                        <Ionicons name="call" size={15} color={COLORS.white} />
                        <Text style={styles.callClientText}>{t('callNow')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => completeRequest(mission.id)}
                        style={styles.doneBtn}
                      >
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
                        <Text style={styles.doneBtnText}>{t('markCompleted')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Available Requests Feed */}
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {isRTL ? 'طلبات خدمة جديدة قريبة منك' : 'Demandes récentes à proximité'}
            </Text>

            {availableRequests.length === 0 ? (
              <View style={styles.emptyRequestsBox}>
                <Ionicons name="checkmark-done-circle-outline" size={40} color={COLORS.slate300} />
                <Text style={styles.emptyRequestsText}>
                  {isRTL ? 'لا توجد طلبات جديدة في منطقتك حالياً' : 'Aucune nouvelle demande pour le moment'}
                </Text>
              </View>
            ) : (
              availableRequests.map((req) => (
                <View key={req.id} style={[styles.requestCard, SHADOWS.sm]}>
                  <View style={[styles.requestHeader, isRTL && styles.requestHeaderRTL]}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{req.category}</Text>
                    </View>
                    <Text style={styles.timeAgo}>
                      {isRTL ? 'طلب جديد' : 'Nouveau'}
                    </Text>
                  </View>

                  <Text style={[styles.requestTitle, isRTL && styles.textRTL]}>
                    {req.title}
                  </Text>

                  {req.description ? (
                    <Text style={[styles.requestDesc, isRTL && styles.textRTL]} numberOfLines={2}>
                      {req.description}
                    </Text>
                  ) : null}

                  {(req.photos || []).length > 0 && <PhotoGallery photos={req.photos} size={72} />}

                  <TouchableOpacity
                    onPress={() => openInMaps(resolveCoords(req), req.title)}
                    style={[styles.mapChip, isRTL && styles.requestMetaRTL]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="map" size={14} color={COLORS.primaryDark} />
                    <Text style={styles.mapChipText} numberOfLines={1}>
                      {req.location?.address || (isRTL ? 'عرض على الخريطة' : language === 'fr' ? 'Voir sur la carte' : 'View on map')}
                      {requestDistance(req) ? `  ·  ${requestDistance(req)}` : ''}
                    </Text>
                    {!req.location && (
                      <Text style={styles.approxText}>{isRTL ? 'تقريبي' : language === 'fr' ? 'approx.' : 'approx.'}</Text>
                    )}
                  </TouchableOpacity>

                  <View style={[styles.requestMeta, isRTL && styles.requestMetaRTL]}>
                    <View style={styles.metaItem}>
                      <Ionicons name="location" size={14} color={COLORS.slate500} />
                      <Text style={styles.metaText}>{req.governorate} {req.city ? `(${req.city})` : ''}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="cash-outline" size={14} color={COLORS.primary} />
                      <Text style={[styles.metaText, { color: COLORS.primaryDark, fontWeight: '700' }]}>
                        {req.budget} DT (Cash)
                      </Text>
                    </View>
                  </View>

                  {req.schedule && (
                    <View style={[styles.metaItem, { marginTop: 6 }, isRTL && styles.requestMetaRTL]}>
                      <Ionicons name="calendar-outline" size={14} color={COLORS.slate500} />
                      <Text style={styles.metaText}>
                        {req.schedule.date} · {slotLabel(req.schedule.slot)}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.offerRow, isRTL && styles.requestMetaRTL]}>
                    <TextInput
                      value={offerInputs[req.id] || ''}
                      onChangeText={(v) => setOfferInputs((p) => ({ ...p, [req.id]: v }))}
                      keyboardType="numeric"
                      placeholder={isRTL ? 'سعرك (د.ت)' : 'Votre prix (DT)'}
                      placeholderTextColor={COLORS.slate400}
                      style={styles.offerInput}
                    />
                    <TouchableOpacity onPress={() => handleSendOffer(req)} style={styles.offerBtn}>
                      <Ionicons name="pricetag" size={14} color={COLORS.white} />
                      <Text style={styles.acceptBtnText}>{isRTL ? 'أرسل عرض' : 'Faire une offre'}</Text>
                    </TouchableOpacity>
                  </View>
                  {(req.offers || []).length > 0 && (
                    <Text style={[styles.metaText, { marginTop: 6 }]}>
                      {(req.offers || []).length} {isRTL ? 'عرض' : 'offre(s)'}
                    </Text>
                  )}

                  <View style={styles.requestActionRow}>
                    <TouchableOpacity
                      onPress={() => handleAcceptRequest(req)}
                      style={styles.acceptBtn}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="flash" size={16} color={COLORS.white} />
                      <Text style={styles.acceptBtnText}>{t('acceptAndContact')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* ----------------- CLIENT VIEW ----------------- */
          <View style={styles.clientSection}>
            {/* Search Input Bar */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => openDirectory()}
              style={[styles.searchBar, isRTL && styles.searchBarRTL]}
            >
              <Ionicons name="search" size={20} color={COLORS.slate400} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => openDirectory()}
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={COLORS.slate400}
                style={[styles.searchInput, isRTL && styles.textRTL]}
              />
              <TouchableOpacity onPress={() => openDirectory()} style={styles.searchSubmitBtn}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Cash on Delivery Guarantee Banner */}
            <View style={[styles.cashBanner, isRTL && styles.cashBannerRTL]}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primaryDark} />
              <Text style={[styles.cashBannerText, isRTL && styles.textRTL]}>
                {t('cashPaymentNotice')}
              </Text>
            </View>

            {/* Popular Service Categories */}
            <View style={[styles.sectionHeaderRow, isRTL && styles.sectionHeaderRowRTL]}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {t('popularCategories')}
              </Text>
              <TouchableOpacity onPress={() => openDirectory()} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>
                  {isRTL ? 'عرض الكل' : 'Voir tout'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoriesGrid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  style={[styles.categoryCard, SHADOWS.sm]}
                  onPress={() => openDirectory(cat.id)}
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
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPostRequestVisible(true)}
              style={[styles.postRequestCard, SHADOWS.md]}
            >
              <View style={styles.postRequestIcon}>
                <Ionicons name="add-circle" size={36} color={COLORS.primary} />
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
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={20}
                color={COLORS.slate400}
              />
            </TouchableOpacity>

            {/* Directory Shortcut Banner */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => openDirectory()}
              style={[styles.directoryBanner, SHADOWS.sm]}
            >
              <View style={styles.directoryBannerIcon}>
                <Ionicons name="people" size={24} color={COLORS.secondaryDark} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={[styles.directoryBannerTitle, isRTL && styles.textRTL]}>
                  {t('artisanDirectory')}
                </Text>
                <Text style={[styles.directoryBannerSub, isRTL && styles.textRTL]}>
                  {isRTL ? 'تصفح قائمة الحرفيين حسب الولاية واتصل مباشرة' : 'Consultez les artisans par gouvernorat'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity onPress={logout} activeOpacity={0.7} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Artisan Directory Modal */}
      <ArtisanDirectoryModal
        visible={directoryVisible}
        initialCategory={directoryCategory}
        initialSearchQuery={searchQuery}
        onClose={() => setDirectoryVisible(false)}
      />

      {/* Post Service Request Modal */}
      <PostRequestModal
        visible={postRequestVisible}
        onClose={() => setPostRequestVisible(false)}
        onSuccess={() => setMyRequestsVisible(true)}
      />

      {/* My Requests Modal */}
      <MyRequestsModal
        visible={myRequestsVisible}
        onClose={() => setMyRequestsVisible(false)}
        onNewRequestPress={() => setPostRequestVisible(true)}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  topBarRightRTL: {
    flexDirection: 'row-reverse',
    marginRight: 8,
    marginLeft: 0,
  },
  myRequestsBadgeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  counterBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
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

  // In-Progress Missions Card
  inProgressCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  inProgressTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  inProgressTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  budgetAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  clientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },
  clientInfoRowRTL: {
    flexDirection: 'row-reverse',
  },
  clientNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  missionActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingTop: 10,
  },
  missionActionRowRTL: {
    flexDirection: 'row-reverse',
  },
  callClientBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  callClientText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // Request Card
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginTop: SPACING.xs,
    marginBottom: 10,
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
    marginBottom: 6,
  },
  requestDesc: {
    fontSize: 12,
    color: COLORS.slate600,
    lineHeight: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  acceptBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyRequestsBox: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  emptyRequestsText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.slate500,
    fontWeight: '600',
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
  searchSubmitBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionHeaderRowRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
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
    marginBottom: 12,
  },
  postRequestIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postRequestTextCol: {
    flex: 1,
  },
  postRequestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 2,
  },
  postRequestSub: {
    fontSize: 12,
    color: COLORS.slate500,
  },
  directoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  directoryBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directoryBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#78350F',
  },
  directoryBannerSub: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },

  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  offerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.slate900,
    backgroundColor: COLORS.slate50,
  },
  offerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondaryDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  demoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondaryLight,
  },
  demoStripText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryDark,
  },
  demoStripExit: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.danger,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    marginTop: 10,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  textRTL: {
    textAlign: 'right',
  },
  mapChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
  },
  mapChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    flexShrink: 1,
  },
  approxText: {
    fontSize: 10,
    color: COLORS.slate500,
    fontWeight: '600',
  },
});
