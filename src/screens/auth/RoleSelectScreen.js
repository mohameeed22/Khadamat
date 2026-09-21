import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export const RoleSelectScreen = () => {
  const { t, isRTL } = useLanguage();
  const { selectRole, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState('client'); // default to client

  const handleConfirmRole = async () => {
    await selectRole(selectedRole);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onBack={logout} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.headerBlock}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('roleTitle')}
          </Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {t('roleSubtitle')}
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {/* Client Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedRole('client')}
            style={[
              styles.roleCard,
              selectedRole === 'client' && styles.roleCardActive,
              SHADOWS.md,
            ]}
          >
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <View
                style={[
                  styles.roleIconWrap,
                  { backgroundColor: COLORS.primaryMuted },
                ]}
              >
                <Ionicons name="person" size={26} color={COLORS.primary} />
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedRole === 'client' && styles.radioOuterActive,
                ]}
              >
                {selectedRole === 'client' && <View style={styles.radioInner} />}
              </View>
            </View>

            <Text style={[styles.roleCardTitle, isRTL && styles.textRTL]}>
              {t('clientRoleTitle')}
            </Text>
            <Text style={[styles.roleCardDesc, isRTL && styles.textRTL]}>
              {t('clientRoleDesc')}
            </Text>

            <View style={styles.perksList}>
              <View style={[styles.perkItem, isRTL && styles.perkItemRTL]}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.perkText}>
                  {isRTL ? 'بحث سريع عن صنايعي قريب ليك' : 'Recherche rapide d’artisan vérifié'}
                </Text>
              </View>
              <View style={[styles.perkItem, isRTL && styles.perkItemRTL]}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.perkText}>
                  {isRTL ? 'الدفع نقداً بعد المعاينة والخدمة' : 'Paiement en espèces après service'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Provider Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedRole('provider')}
            style={[
              styles.roleCard,
              selectedRole === 'provider' && styles.roleCardProviderActive,
              SHADOWS.md,
            ]}
          >
            <View style={[styles.cardHeader, isRTL && styles.cardHeaderRTL]}>
              <View
                style={[
                  styles.roleIconWrap,
                  { backgroundColor: COLORS.warningLight },
                ]}
              >
                <Ionicons name="hammer" size={26} color={COLORS.secondaryDark} />
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedRole === 'provider' && styles.radioOuterProviderActive,
                ]}
              >
                {selectedRole === 'provider' && (
                  <View
                    style={[styles.radioInner, { backgroundColor: COLORS.secondaryDark }]}
                  />
                )}
              </View>
            </View>

            <Text style={[styles.roleCardTitle, isRTL && styles.textRTL]}>
              {t('providerRoleTitle')}
            </Text>
            <Text style={[styles.roleCardDesc, isRTL && styles.textRTL]}>
              {t('providerRoleDesc')}
            </Text>

            <View style={styles.perksList}>
              <View style={[styles.perkItem, isRTL && styles.perkItemRTL]}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondaryDark} />
                <Text style={styles.perkText}>
                  {isRTL ? 'استقبال طلبات خدمة في منطقتك' : 'Recevez des demandes de clients locaux'}
                </Text>
              </View>
              <View style={[styles.perkItem, isRTL && styles.perkItemRTL]}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondaryDark} />
                <Text style={styles.perkText}>
                  {isRTL ? 'عرض أعمالك وبناء سمعتك وتقييماتك' : 'Profil pro, avis et portfolio visibles'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button
          title={t('chooseRoleBtn')}
          onPress={handleConfirmRole}
          size="lg"
          icon={isRTL ? 'arrow-back' : 'arrow-forward'}
          iconPosition={isRTL ? 'left' : 'right'}
          style={styles.continueBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  headerBlock: {
    marginBottom: SPACING.lg,
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
  },
  textRTL: {
    textAlign: 'right',
  },
  cardsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.slate200,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  roleCardProviderActive: {
    borderColor: COLORS.secondaryDark,
    backgroundColor: '#FFFBEB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  roleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.slate300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioOuterProviderActive: {
    borderColor: COLORS.secondaryDark,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  roleCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 6,
  },
  roleCardDesc: {
    fontSize: 13,
    color: COLORS.slate600,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  perksList: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkItemRTL: {
    flexDirection: 'row-reverse',
  },
  perkText: {
    fontSize: 12,
    color: COLORS.slate700,
    fontWeight: '500',
  },
  continueBtn: {
    width: '100%',
  },
});
