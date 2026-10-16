import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { SERVICE_CATEGORIES, GOVERNORATES } from '../constants/translations';
import { Button } from '../components/Button';

const TIME_SLOTS = [
  { id: 'morning', icon: 'sunny', ar: 'صباح', fr: 'Matin', en: 'Morning' },
  { id: 'afternoon', icon: 'partly-sunny', ar: 'بعد الزوال', fr: 'Après-midi', en: 'Afternoon' },
  { id: 'evening', icon: 'moon', ar: 'عشية', fr: 'Soir', en: 'Evening' },
];

export const PostRequestModal = ({ visible, onClose, onSuccess }) => {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { createRequest } = useRequests();

  const [category, setCategory] = useState(SERVICE_CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [governorate, setGovernorate] = useState(user?.profile?.governorate || GOVERNORATES[0]);
  const [urgency, setUrgency] = useState('today'); // 'immediate' | 'today' | 'week'
  const [day, setDay] = useState(0); // days from today
  const [slot, setSlot] = useState('morning');
  const [budget, setBudget] = useState('40');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDayDate = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  };

  const formatDay = (offset) => {
    if (offset === 0) return language === 'ar' ? 'اليوم' : language === 'fr' ? "Aujourd'hui" : 'Today';
    if (offset === 1) return language === 'ar' ? 'غدوة' : language === 'fr' ? 'Demain' : 'Tomorrow';
    const loc = language === 'ar' ? 'ar-TN' : language === 'fr' ? 'fr-TN' : 'en-GB';
    return getDayDate(offset).toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getCategoryLabel = (cat) => {
    if (language === 'ar') return cat.labelAr;
    if (language === 'fr') return cat.labelFr;
    return cat.labelEn;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(
        isRTL ? 'تنبيه' : 'Attention',
        isRTL ? 'يرجى إدخال عنوان المشكل أو الخدمة' : 'Veuillez saisir le titre de la demande'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        title: title.trim(),
        category,
        governorate,
        description: description.trim(),
        urgency,
        schedule: { date: getDayDate(day).toISOString().slice(0, 10), slot },
        budget: budget.trim() || '30',
        clientName: user?.profile?.fullName || (isRTL ? 'حريف خدمات' : 'Client Khadamat'),
        clientPhone: user?.phoneNumber || user?.uid || '',
      });

      Alert.alert(
        isRTL ? 'نجاح' : 'Succès',
        t('requestPostedSuccess'),
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setDescription('');
              if (onSuccess) onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'حدث خطأ أثناء نشر الطلب' : 'Erreur lors de la publication'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.topBar, isRTL && styles.topBarRTL]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={COLORS.slate800} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{t('postRequestTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Subtitle / Notice */}
          <View style={[styles.infoBanner, isRTL && styles.infoBannerRTL]}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={[styles.infoBannerText, isRTL && styles.textRTL]}>
              {t('postRequestSubtitle')}
            </Text>
          </View>

          {/* 1. Category Selection */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('requestCategory')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoryChips, isRTL && styles.categoryChipsRTL]}
          >
            {SERVICE_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.7}
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={isSelected ? COLORS.white : COLORS.slate600}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 2. Job Title Input */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('requestJobTitle')}</Text>
          <View style={[styles.inputBox, isRTL && styles.inputBoxRTL]}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('requestJobTitlePlaceholder')}
              placeholderTextColor={COLORS.slate400}
              style={[styles.inputField, isRTL && styles.textRTL]}
            />
          </View>

          {/* 3. Governorate Selector */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('requestGov')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoryChips, isRTL && styles.categoryChipsRTL]}
          >
            {GOVERNORATES.map((gov) => {
              const isSelected = governorate === gov;
              return (
                <TouchableOpacity
                  key={gov}
                  onPress={() => setGovernorate(gov)}
                  activeOpacity={0.7}
                  style={[styles.govChip, isSelected && styles.govChipActive]}
                >
                  <Text style={[styles.govChipText, isSelected && styles.govChipTextActive]}>
                    {gov}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 4. Urgency Selector */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('requestUrgency')}</Text>
          <View style={[styles.urgencyRow, isRTL && styles.urgencyRowRTL]}>
            <TouchableOpacity
              onPress={() => setUrgency('immediate')}
              activeOpacity={0.7}
              style={[styles.urgencyBtn, urgency === 'immediate' && styles.urgencyBtnActiveDanger]}
            >
              <Ionicons
                name="flame"
                size={16}
                color={urgency === 'immediate' ? COLORS.white : COLORS.danger}
              />
              <Text
                style={[
                  styles.urgencyText,
                  urgency === 'immediate' && styles.urgencyTextActive,
                ]}
              >
                {t('urgencyImmediate')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUrgency('today')}
              activeOpacity={0.7}
              style={[styles.urgencyBtn, urgency === 'today' && styles.urgencyBtnActivePrimary]}
            >
              <Ionicons
                name="today"
                size={16}
                color={urgency === 'today' ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.urgencyText,
                  urgency === 'today' && styles.urgencyTextActive,
                ]}
              >
                {t('urgencyToday')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUrgency('week')}
              activeOpacity={0.7}
              style={[styles.urgencyBtn, urgency === 'week' && styles.urgencyBtnActiveSecondary]}
            >
              <Ionicons
                name="calendar"
                size={16}
                color={urgency === 'week' ? COLORS.white : COLORS.slate700}
              />
              <Text
                style={[
                  styles.urgencyText,
                  urgency === 'week' && styles.urgencyTextActive,
                ]}
              >
                {t('urgencyWeek')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scheduling: day + time slot */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>
            {language === 'ar' ? 'موعد التدخل' : language === 'fr' ? 'Date et créneau souhaités' : 'Preferred date & time'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoryChips, isRTL && styles.categoryChipsRTL]}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDay(d)}
                activeOpacity={0.7}
                style={[styles.govChip, day === d && styles.govChipActive]}
              >
                <Text style={[styles.govChipText, day === d && styles.govChipTextActive]}>
                  {formatDay(d)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={[styles.urgencyRow, isRTL && styles.urgencyRowRTL, { marginTop: 8 }]}>
            {TIME_SLOTS.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSlot(s.id)}
                activeOpacity={0.7}
                style={[styles.urgencyBtn, slot === s.id && styles.urgencyBtnActivePrimary]}
              >
                <Ionicons name={s.icon} size={16} color={slot === s.id ? COLORS.white : COLORS.primary} />
                <Text style={[styles.urgencyText, slot === s.id && styles.urgencyTextActive]}>
                  {s[language] || s.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 5. Budget Input */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('requestBudget')}</Text>
          <View style={[styles.inputBox, styles.budgetInputBox, isRTL && styles.inputBoxRTL]}>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder={t('requestBudgetPlaceholder')}
              placeholderTextColor={COLORS.slate400}
              style={[styles.inputField, { fontWeight: '700' }, isRTL && styles.textRTL]}
            />
            <Text style={styles.dtBadge}>DT</Text>
          </View>

          {/* 6. Description Input */}
          <Text style={[styles.fieldLabel, isRTL && styles.textRTL]}>{t('requestDesc')}</Text>
          <View style={[styles.inputBox, styles.textAreaBox, isRTL && styles.inputBoxRTL]}>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('requestDescPlaceholder')}
              placeholderTextColor={COLORS.slate400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.inputField, styles.textAreaField, isRTL && styles.textRTL]}
            />
          </View>

          {/* Submit Button */}
          <Button
            title={t('submitRequestBtn')}
            onPress={handleSubmit}
            loading={isSubmitting}
            size="lg"
            icon="send"
            style={{ marginTop: 24 }}
          />
        </ScrollView>
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  infoBannerRTL: {
    flexDirection: 'row-reverse',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDark,
    lineHeight: 18,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slate900,
    marginTop: 14,
    marginBottom: 8,
  },
  textRTL: {
    textAlign: 'right',
  },
  categoryChips: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChipsRTL: {
    flexDirection: 'row-reverse',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate700,
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  govChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  govChipActive: {
    backgroundColor: COLORS.secondaryLight,
    borderColor: COLORS.secondaryDark,
  },
  govChipText: {
    fontSize: 12,
    color: COLORS.slate700,
  },
  govChipTextActive: {
    color: COLORS.secondaryDark,
    fontWeight: '700',
  },
  inputBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputBoxRTL: {
    flexDirection: 'row-reverse',
  },
  inputField: {
    fontSize: 14,
    color: COLORS.slate900,
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyRowRTL: {
    flexDirection: 'row-reverse',
  },
  urgencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  urgencyBtnActiveDanger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  urgencyBtnActivePrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  urgencyBtnActiveSecondary: {
    backgroundColor: COLORS.slate800,
    borderColor: COLORS.slate800,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  urgencyTextActive: {
    color: COLORS.white,
  },
  budgetInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dtBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  textAreaBox: {
    minHeight: 90,
  },
  textAreaField: {
    minHeight: 80,
  },
});
