import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export const Header = ({ onBack, title, showLanguage = true }) => {
  const { isRTL, t } = useLanguage();

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={styles.leftGroup}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={24}
              color={COLORS.slate800}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="construct" size={18} color={COLORS.white} />
            </View>
            <View style={styles.brandTextCol}>
              <Text style={styles.brandTitle}>{t('appName')}</Text>
              <Text style={styles.brandSubtitle}>Khadamat</Text>
            </View>
          </View>
        )}
      </View>

      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      <View style={styles.rightGroup}>
        {showLanguage && <LanguageSelector compact />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
    minHeight: 56,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.slate900,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  titleContainer: {
    position: 'absolute',
    left: 70,
    right: 70,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slate900,
  },
});
