import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { SERVICE_CATEGORIES } from '../constants/translations';
import { PhotoGallery } from '../components/PhotoGallery';
import { openInMaps, resolveCoords } from '../utils/geo';

/** Star rating + optional comment, shown once a job is completed. */
const ReviewBox = ({ item, onSubmit, isRTL, language }) => {
  const L = (ar, fr, en) => (language === 'ar' ? ar : language === 'fr' ? fr : en);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (item.review) {
    return (
      <View style={styles.reviewBox}>
        <View style={[styles.reviewRow, isRTL && styles.cardActionsRTL]}>
          <Text style={styles.reviewLabel}>{L('تقييمك', 'Votre avis', 'Your review')}</Text>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Ionicons key={n} name={n <= item.review.rating ? 'star' : 'star-outline'} size={20} color={COLORS.secondary} />
            ))}
          </View>
        </View>
        {!!item.review.comment && (
          <Text style={[styles.reviewComment, isRTL && styles.textRTL]}>“{item.review.comment}”</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.reviewBox}>
      <View style={[styles.reviewRow, isRTL && styles.cardActionsRTL]}>
        <Text style={styles.reviewLabel}>{L('قيّم الصنايعي', 'Noter l’artisan', 'Rate the pro')}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {rating > 0 && (
        <>
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            placeholder={L('اكتب رأيك (اختياري)', 'Écrivez votre avis (optionnel)', 'Write a comment (optional)')}
            placeholderTextColor={COLORS.slate400}
            style={[styles.reviewInput, isRTL && styles.textRTL]}
          />
          <TouchableOpacity style={styles.submitReviewBtn} onPress={() => onSubmit(item.id, rating, comment)}>
            <Ionicons name="send" size={14} color={COLORS.white} />
            <Text style={styles.completeBtnText}>{L('إرسال التقييم', 'Envoyer l’avis', 'Submit review')}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export const MyRequestsModal = ({ visible, onClose, onNewRequestPress }) => {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { completeRequest, cancelRequest, reviewRequest, acceptOffer, getRequestsByClient } = useRequests();
  const myRequests = getRequestsByClient(user?.phoneNumber || user?.uid);

  const handleCall = (phone) => {
    if (!phone) return;
    const phoneUrl = `tel:${phone}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert('Téléphone', phone);
    });
  };

  const getCategoryTitle = (catId) => {
    const found = SERVICE_CATEGORIES.find((c) => c.id === catId);
    if (!found) return catId;
    if (language === 'ar') return found.labelAr;
    if (language === 'fr') return found.labelFr;
    return found.labelEn;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return {
          bg: '#FEF3C7',
          color: '#B45309',
          label: t('statusInProgress'),
          icon: 'time',
        };
      case 'completed':
        return {
          bg: '#ECFDF5',
          color: '#047857',
          label: t('statusCompleted'),
          icon: 'checkmark-circle',
        };
      case 'open':
      default:
        return {
          bg: '#EFF6FF',
          color: '#1D4ED8',
          label: t('statusOpen'),
          icon: 'radio-button-on',
        };
    }
  };

  const renderRequestItem = ({ item }) => {
    const badge = getStatusBadge(item.status);
    return (
      <View style={[styles.requestCard, SHADOWS.sm]}>
        <View style={[styles.cardTop, isRTL && styles.cardTopRTL]}>
          <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={14} color={badge.color} />
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
          <Text style={styles.budgetTag}>{item.budget} DT</Text>
        </View>

        <Text style={[styles.requestTitle, isRTL && styles.textRTL]}>{item.title}</Text>

        {item.description ? (
          <Text style={[styles.requestDesc, isRTL && styles.textRTL]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {(item.photos || []).length > 0 && <PhotoGallery photos={item.photos} />}

        {(item.location || item.governorate) && (
          <TouchableOpacity
            style={[styles.mapBtn, isRTL && styles.cardActionsRTL]}
            activeOpacity={0.8}
            onPress={() => openInMaps(resolveCoords(item), item.title)}
          >
            <Ionicons name="map" size={14} color={COLORS.primaryDark} />
            <Text style={styles.mapBtnText} numberOfLines={1}>
              {item.location?.address || (isRTL ? 'عرض على الخريطة' : language === 'fr' ? 'Voir sur la carte' : 'View on map')}
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={12} color={COLORS.slate400} />
            <Text style={styles.metaText}>{getCategoryTitle(item.category)}</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.slate400} />
            <Text style={styles.metaText}>{item.governorate}</Text>
          </View>
        </View>

        {item.schedule && (
          <View style={[styles.metaRow, isRTL && styles.metaRowRTL]}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.slate400} />
            <Text style={styles.metaText}>
              {item.schedule.date} ·{' '}
              {{
                morning: { ar: 'صباح', fr: 'Matin', en: 'Morning' },
                afternoon: { ar: 'بعد الزوال', fr: 'Après-midi', en: 'Afternoon' },
                evening: { ar: 'عشية', fr: 'Soir', en: 'Evening' },
              }[item.schedule.slot]?.[language] || item.schedule.slot}
            </Text>
          </View>
        )}

        {/* Offers from providers */}
        {item.status === 'open' && (item.offers || []).length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.reviewLabel, isRTL && styles.textRTL]}>
              {isRTL ? 'العروض المستلمة' : 'Offres reçues'} ({item.offers.length})
            </Text>
            {[...item.offers]
              .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
              .map((offer) => (
                <View key={offer.id} style={[styles.offerItem, isRTL && styles.cardActionsRTL]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.providerName, isRTL && styles.textRTL]}>{offer.name}</Text>
                    <Text style={[styles.providerSub, isRTL && styles.textRTL]}>{offer.governorate}</Text>
                  </View>
                  <Text style={styles.budgetTag}>{offer.price} DT</Text>
                  <TouchableOpacity onPress={() => acceptOffer(item.id, offer.id)} style={styles.completeBtn}>
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    <Text style={styles.completeBtnText}>{isRTL ? 'قبول' : 'Accepter'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}

        {/* Assigned Provider Information if accepted */}
        {item.assignedProvider && (
          <View style={[styles.assignedBox, isRTL && styles.assignedBoxRTL]}>
            <View style={styles.providerAvatarCircle}>
              <Ionicons name="hammer" size={18} color={COLORS.secondaryDark} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.providerName, isRTL && styles.textRTL]}>
                {item.assignedProvider.name}
              </Text>
              <Text style={[styles.providerSub, isRTL && styles.textRTL]}>
                {item.assignedProvider.governorate}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleCall(item.assignedProvider.phone)}
              style={styles.callSmallBtn}
            >
              <Ionicons name="call" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Review: stars + comment for completed jobs */}
        {item.status === 'completed' && (
          <ReviewBox item={item} onSubmit={reviewRequest} isRTL={isRTL} language={language} />
        )}

        {/* Action Buttons */}
        <View style={[styles.cardActions, isRTL && styles.cardActionsRTL]}>
          {item.status === 'in_progress' && (
            <TouchableOpacity
              onPress={() => completeRequest(item.id)}
              activeOpacity={0.7}
              style={styles.completeBtn}
            >
              <Ionicons name="checkmark-done" size={16} color={COLORS.white} />
              <Text style={styles.completeBtnText}>{t('markCompleted')}</Text>
            </TouchableOpacity>
          )}

          {item.status === 'open' && (
            <TouchableOpacity
              onPress={() => cancelRequest(item.id)}
              activeOpacity={0.7}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top App Bar */}
        <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.slate800} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('myRequestsTitle')}</Text>
          <TouchableOpacity
            onPress={() => {
              onClose();
              if (onNewRequestPress) onNewRequestPress();
            }}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={myRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={54} color={COLORS.slate300} />
              <Text style={styles.emptyTitle}>{t('noRequestsYet')}</Text>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  if (onNewRequestPress) onNewRequestPress();
                }}
                style={styles.emptyCreateBtn}
              >
                <Ionicons name="add-circle" size={18} color={COLORS.white} />
                <Text style={styles.emptyCreateText}>{t('newBookingRequest')}</Text>
              </TouchableOpacity>
            </View>
          }
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
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.slate100,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  addBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
  },
  listContent: {
    padding: SPACING.md,
    gap: 12,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTopRTL: {
    flexDirection: 'row-reverse',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  budgetTag: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 4,
  },
  requestDesc: {
    fontSize: 13,
    color: COLORS.slate600,
    lineHeight: 18,
    marginBottom: 8,
  },
  textRTL: {
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaRowRTL: {
    flexDirection: 'row-reverse',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.slate500,
  },
  dot: {
    fontSize: 10,
    color: COLORS.slate300,
  },
  assignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.md,
    padding: 10,
    marginTop: 12,
  },
  assignedBoxRTL: {
    flexDirection: 'row-reverse',
  },
  providerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  providerSub: {
    fontSize: 11,
    color: COLORS.slate600,
  },
  callSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  cardActionsRTL: {
    flexDirection: 'row-reverse',
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.slate50,
    borderRadius: RADIUS.md,
    padding: 10,
    marginTop: 8,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  reviewComment: {
    marginTop: 8,
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.slate700,
    lineHeight: 18,
  },
  reviewInput: {
    marginTop: 10,
    minHeight: 60,
    padding: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    fontSize: 13,
    color: COLORS.slate900,
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryMuted,
    maxWidth: '100%',
  },
  mapBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark, flexShrink: 1 },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  completeBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.slate100,
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slate500,
    marginTop: 12,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginTop: 16,
    gap: 8,
  },
  emptyCreateText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
