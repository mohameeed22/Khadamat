import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { GOVERNORATES, SERVICE_CATEGORIES } from '../../constants/translations';

export const ProfileSetupScreen = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, saveProfile, selectRole } = useAuth();

  const isProvider = user?.role === 'provider';

  const [fullName, setFullName] = useState('');
  const [selectedGov, setSelectedGov] = useState('Tunis');
  const [showGovModal, setShowGovModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState(isProvider ? ['plumbing'] : []);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== id));
      }
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError(
        isRTL
          ? 'الرجاء إدخال الاسم واللقب للمتابعة'
          : 'Veuillez saisir votre nom complet'
      );
      return;
    }

    if (isProvider && selectedServices.length === 0) {
      setError(
        isRTL
          ? 'يرجى اختيار خدمة واحدة على الأقل'
          : 'Sélectionnez au moins un service'
      );
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile({
        fullName: fullName.trim(),
        governorate: selectedGov,
        services: isProvider ? selectedServices : [],
        bio: isProvider ? bio.trim() : '',
      });
    } catch (err) {
      setError('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const getServiceLabel = (cat) => {
    if (language === 'ar') return cat.labelAr;
    if (language === 'fr') return cat.labelFr;
    return cat.labelEn;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onBack={() => selectRole(null)} // allows backing out to change role
        title={t('profileTitle')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Subtitle */}
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {t('profileSubtitle')}
        </Text>

        {/* Verified Phone Chip */}
        <View style={[styles.phoneChip, isRTL && styles.phoneChipRTL]}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          <Text style={styles.phoneChipText}>{user?.phoneNumber}</Text>
          <View style={styles.badgeRole}>
            <Text style={styles.badgeRoleText}>
              {isProvider ? (isRTL ? 'صنايعي' : 'Prestataire') : (isRTL ? 'حريف' : 'Client')}
            </Text>
          </View>
        </View>

        {/* Full Name */}
        <Input
          label={t('fullNameLabel')}
          value={fullName}
          onChangeText={(txt) => {
            setFullName(txt);
            if (error) setError('');
          }}
          placeholder={t('fullNamePlaceholder')}
          icon="person-outline"
        />

        {/* Governorate Selector */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>
            {t('governorateLabel')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowGovModal(true)}
            activeOpacity={0.8}
            style={[styles.dropdownBtn, isRTL && styles.dropdownBtnRTL]}
          >
            <View style={styles.dropdownLeft}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dropdownText}>{selectedGov}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={COLORS.slate500} />
          </TouchableOpacity>
        </View>

        {/* If Provider: Services Checklist */}
        {isProvider && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('servicesLabel')}
            </Text>
            <View style={styles.chipsWrap}>
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedServices.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => toggleService(cat.id)}
                    activeOpacity={0.7}
                    style={[
                      styles.serviceChip,
                      isSelected && styles.serviceChipSelected,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={isSelected ? COLORS.white : COLORS.slate700}
                    />
                    <Text
                      style={[
                        styles.serviceChipText,
                        isSelected && styles.serviceChipTextSelected,
                      ]}
                    >
                      {getServiceLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* If Provider: Bio */}
        {isProvider && (
          <Input
            label={t('bioLabel')}
            value={bio}
            onChangeText={setBio}
            placeholder={t('bioPlaceholder')}
            multiline
            numberOfLines={3}
          />
        )}

        {/* Error Feedback */}
        {error ? (
          <Text style={[styles.errorText, isRTL && styles.textRTL]}>
            {error}
          </Text>
        ) : null}

        {/* Save & Finish */}
        <Button
          title={t('finishBtn')}
          onPress={handleSave}
          loading={isSaving}
          size="lg"
          icon="checkmark-done"
          iconPosition="right"
          style={styles.finishBtn}
        />
      </ScrollView>

      {/* Governorate Selector Modal */}
      <Modal visible={showGovModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectGovernorate')}</Text>
              <TouchableOpacity
                onPress={() => setShowGovModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={COLORS.slate700} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={GOVERNORATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedGov(item);
                    setShowGovModal(false);
                  }}
                  style={[
                    styles.govItem,
                    item === selectedGov && styles.govItemActive,
                  ]}
                >
                  <Ionicons
                    name="location-sharp"
                    size={18}
                    color={item === selectedGov ? COLORS.primary : COLORS.slate400}
                  />
                  <Text
                    style={[
                      styles.govItemText,
                      item === selectedGov && styles.govItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === selectedGov && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.slate600,
    marginBottom: SPACING.md,
  },
  textRTL: {
    textAlign: 'right',
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: SPACING.lg,
    gap: 8,
  },
  phoneChipRTL: {
    flexDirection: 'row-reverse',
  },
  phoneChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate800,
    flex: 1,
  },
  badgeRole: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  badgeRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate700,
    marginBottom: 6,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  dropdownBtnRTL: {
    flexDirection: 'row-reverse',
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.slate900,
  },

  // Service Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  serviceChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  serviceChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.slate700,
  },
  serviceChipTextSelected: {
    color: COLORS.white,
  },

  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  finishBtn: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
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
    maxHeight: '75%',
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
  govItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    gap: 12,
  },
  govItemActive: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.sm,
  },
  govItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.slate800,
    fontWeight: '500',
  },
  govItemTextActive: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
