import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { SERVICE_CATEGORIES, GOVERNORATES } from '../constants/translations';
import { useArtisans } from '../context/ArtisanContext';
import { ArtisanDetailModal } from './ArtisanDetailModal';

export const ArtisanDirectoryModal = ({
  visible,
  onClose,
  initialCategory = null,
  initialSearchQuery = '',
}) => {
  const { t, isRTL, language } = useLanguage();
  const { artisans: ALL_ARTISANS } = useArtisans();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedGov, setSelectedGov] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeArtisan, setActiveArtisan] = useState(null);

  // Filter artisans
  const filteredArtisans = useMemo(() => {
    return ALL_ARTISANS.filter((artisan) => {
      // Category filter
      if (selectedCategory && artisan.category !== selectedCategory) {
        return false;
      }
      // Governorate filter
      if (selectedGov && artisan.governorate.toLowerCase() !== selectedGov.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = artisan.name.toLowerCase().includes(q);
        const matchCity = (artisan.city || '').toLowerCase().includes(q);
        const matchGov = artisan.governorate.toLowerCase().includes(q);
        const matchSkills = (artisan.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchCity && !matchGov && !matchSkills) {
          return false;
        }
      }
      return true;
    });
  }, [ALL_ARTISANS, selectedCategory, selectedGov, searchQuery]);

  const handleCall = (artisan) => {
    if (!artisan.phone) return;
    const phoneUrl = `tel:${artisan.phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert(isRTL ? 'رقم الهاتف' : 'Téléphone', `${artisan.name}: ${artisan.phone}`);
        }
      })
      .catch(() => {
        Alert.alert(isRTL ? 'رقم الهاتف' : 'Téléphone', `${artisan.name}: ${artisan.phone}`);
      });
  };

  const handleWhatsApp = (artisan) => {
    if (!artisan.whatsapp) return;
    const cleanPhone = artisan.whatsapp.replace(/[^0-9]/g, '');
    const message = isRTL
      ? `سلام، شفت بروفيلك على تطبيق خدمات ونحب نسألك على خدمة...`
      : `Bonjour, j’ai vu votre profil sur Khadamat et je souhaite un renseignement...`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Alert.alert('WhatsApp', `${artisan.name}: ${artisan.whatsapp}`);
        }
      })
      .catch(() => {
        Alert.alert('WhatsApp', `${artisan.name}: ${artisan.whatsapp}`);
      });
  };

  const getCategoryLabel = (cat) => {
    if (language === 'ar') return cat.labelAr;
    if (language === 'fr') return cat.labelFr;
    return cat.labelEn;
  };

  const renderArtisanCard = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setActiveArtisan(item)}
        style={[styles.card, SHADOWS.sm]}
      >
        <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={28} color={COLORS.primary} />
            {item.isVerified && (
              <View style={styles.badgeCheck}>
                <Ionicons name="checkmark-sharp" size={10} color={COLORS.white} />
              </View>
            )}
          </View>

          <View style={styles.infoCol}>
            <View style={[styles.nameRow, isRTL && styles.nameRowRTL]}>
              <Text style={[styles.nameText, isRTL && styles.textRTL]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>

            <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={COLORS.secondary} />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({item.reviewsCount})</Text>
              </View>

              <Text style={styles.dot}>•</Text>

              <View style={[styles.locationBadge, isRTL && styles.metaRowRTL]}>
                <Ionicons name="location-sharp" size={12} color={COLORS.slate500} />
                <Text style={styles.locationText}>{item.city || item.governorate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price & Status Row */}
        <View style={[styles.priceRow, isRTL && styles.priceRowRTL]}>
          <View style={[styles.priceBox, isRTL && styles.priceRowRTL]}>
            <Text style={styles.priceAmount}>{item.priceEstimate}</Text>
            <Text style={styles.priceLabel}>
              {language === 'ar' ? item.priceUnitAr : item.priceUnitFr}
            </Text>
          </View>

          <View
            style={[
              styles.statusChip,
              { backgroundColor: item.isAvailable ? '#ECFDF5' : '#F1F5F9' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isAvailable ? COLORS.success : COLORS.slate400 },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.isAvailable ? COLORS.success : COLORS.slate500 },
              ]}
            >
              {item.isAvailable ? t('availableNow') : t('busyNow')}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionRow, isRTL && styles.actionRowRTL]}>
          <TouchableOpacity
            onPress={() => setActiveArtisan(item)}
            activeOpacity={0.7}
            style={styles.detailsBtn}
          >
            <Text style={styles.detailsBtnText}>{t('viewProfile')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleWhatsApp(item)}
            activeOpacity={0.7}
            style={styles.waBtn}
          >
            <Ionicons name="logo-whatsapp" size={16} color={COLORS.white} />
            <Text style={styles.waBtnText}>{t('whatsappChat')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleCall(item)}
            activeOpacity={0.7}
            style={styles.callBtn}
          >
            <Ionicons name="call" size={16} color={COLORS.white} />
            <Text style={styles.callBtnText}>{t('callNow')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top App Bar */}
        <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.slate800} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('artisanDirectory')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search & Filters Header */}
        <View style={styles.filterSection}>
          {/* Search Bar */}
          <View style={[styles.searchBar, isRTL && styles.searchBarRTL]}>
            <Ionicons name="search" size={18} color={COLORS.slate400} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={COLORS.slate400}
              style={[styles.searchInput, isRTL && styles.textRTL]}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.slate400} />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories Horizontal Scroll */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, labelAr: 'كل الخدمات', labelFr: 'Toutes', labelEn: 'All', icon: 'apps' }, ...SERVICE_CATEGORIES]}
            keyExtractor={(item) => item.id || 'all'}
            contentContainerStyle={[styles.chipsList, isRTL && styles.chipsListRTL]}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.id;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(item.id)}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipActive,
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={14}
                    color={isSelected ? COLORS.white : COLORS.slate600}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                  >
                    {getCategoryLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Governorates Horizontal Filter */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[null, ...GOVERNORATES]}
            keyExtractor={(item) => item || 'all_gov'}
            contentContainerStyle={[styles.chipsList, isRTL && styles.chipsListRTL]}
            renderItem={({ item }) => {
              const isSelected = selectedGov === item;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedGov(item)}
                  style={[
                    styles.govChip,
                    isSelected && styles.govChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.govChipText,
                      isSelected && styles.govChipTextActive,
                    ]}
                  >
                    {item ? item : t('allGovernorates')}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Results Count Banner */}
        <View style={[styles.countRow, isRTL && styles.countRowRTL]}>
          <Text style={styles.countText}>
            {filteredArtisans.length}{' '}
            {language === 'ar'
              ? 'صنايعي متاح'
              : 'artisan(s) disponible(s)'}
          </Text>
          {Boolean(selectedCategory || selectedGov || (searchQuery && searchQuery.trim())) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory(null);
                setSelectedGov(null);
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetText}>{t('resetFilters')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Artisans List */}
        <FlatList
          data={filteredArtisans}
          keyExtractor={(item) => item.id}
          renderItem={renderArtisanCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={COLORS.slate300} />
              <Text style={styles.emptyTitle}>{t('noArtisansFound')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(null);
                  setSelectedGov(null);
                  setSearchQuery('');
                }}
                style={styles.emptyResetBtn}
              >
                <Text style={styles.emptyResetText}>{t('resetFilters')}</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Artisan Detail Modal */}
        <ArtisanDetailModal
          visible={!!activeArtisan}
          artisan={activeArtisan}
          onClose={() => setActiveArtisan(null)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  topBarRTL: {
    flexDirection: 'row-reverse',
  },
  iconBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.slate100,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slate100,
    marginHorizontal: SPACING.md,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  searchBarRTL: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.slate900,
  },
  textRTL: {
    textAlign: 'right',
  },
  chipsList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    gap: 8,
  },
  chipsListRTL: {
    flexDirection: 'row-reverse',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.slate100,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate700,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  govChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  govChipActive: {
    backgroundColor: COLORS.secondaryLight,
    borderColor: COLORS.secondaryDark,
  },
  govChipText: {
    fontSize: 11,
    color: COLORS.slate600,
  },
  govChipTextActive: {
    color: COLORS.secondaryDark,
    fontWeight: '700',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  countRowRTL: {
    flexDirection: 'row-reverse',
  },
  countText: {
    fontSize: 12,
    color: COLORS.slate500,
    fontWeight: '600',
  },
  resetText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.md,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRowRTL: {
    flexDirection: 'row-reverse',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  metaRowRTL: {
    flexDirection: 'row-reverse',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  ratingCount: {
    fontSize: 11,
    color: COLORS.slate400,
  },
  dot: {
    fontSize: 10,
    color: COLORS.slate300,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.slate500,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.md,
  },
  priceRowRTL: {
    flexDirection: 'row-reverse',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.slate500,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionRowRTL: {
    flexDirection: 'row-reverse',
  },
  detailsBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  waBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: '#25D366',
    gap: 4,
  },
  waBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.slate500,
    marginTop: 12,
  },
  emptyResetBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.full,
  },
  emptyResetText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
