import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export const LanguageSelector = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  const options = [
    { code: 'ar', label: 'عربي', flag: '🇹🇳' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = language === opt.code;
        return (
          <TouchableOpacity
            key={opt.code}
            onPress={() => setLanguage(opt.code)}
            activeOpacity={0.7}
            style={[
              styles.pill,
              isActive && styles.pillActive,
              compact && styles.pillCompact,
            ]}
          >
            <Text style={styles.flag}>{opt.flag}</Text>
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                compact && styles.labelCompact,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate100,
    borderRadius: RADIUS.full,
    padding: 3,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
  },
  pillCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pillActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  flag: {
    fontSize: 12,
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  labelActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  labelCompact: {
    fontSize: 11,
  },
});
