import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { isRTL } = useLanguage();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.btnSecondary,
          text: styles.textSecondary,
          spinner: COLORS.slate900,
        };
      case 'outline':
        return {
          container: styles.btnOutline,
          text: styles.textOutline,
          spinner: COLORS.primary,
        };
      case 'danger':
        return {
          container: styles.btnDanger,
          text: styles.textDanger,
          spinner: COLORS.white,
        };
      case 'ghost':
        return {
          container: styles.btnGhost,
          text: styles.textGhost,
          spinner: COLORS.primary,
        };
      case 'primary':
      default:
        return {
          container: styles.btnPrimary,
          text: styles.textPrimary,
          spinner: COLORS.white,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { container: styles.sizeSm, text: styles.textSizeSm };
      case 'lg':
        return { container: styles.sizeLg, text: styles.textSizeLg };
      case 'md':
      default:
        return { container: styles.sizeMd, text: styles.textSizeMd };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        vStyles.container,
        sStyles.container,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.spinner} size="small" />
      ) : (
        <View style={[styles.contentRow, isRTL && styles.contentRowRTL]}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={vStyles.text.color}
              style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
            />
          )}
          <Text
            style={[
              styles.baseText,
              vStyles.text,
              sStyles.text,
              disabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 20}
              color={vStyles.text.color}
              style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRowRTL: {
    flexDirection: 'row-reverse',
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },

  // Variants
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  textPrimary: {
    color: COLORS.white,
  },
  btnSecondary: {
    backgroundColor: COLORS.secondary,
  },
  textSecondary: {
    color: COLORS.slate900,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  textOutline: {
    color: COLORS.primary,
  },
  btnDanger: {
    backgroundColor: COLORS.danger,
  },
  textDanger: {
    color: COLORS.white,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  textGhost: {
    color: COLORS.slate600,
  },

  // Sizes
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  textSizeSm: {
    fontSize: 13,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  textSizeMd: {
    fontSize: 15,
  },
  sizeLg: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  textSizeLg: {
    fontSize: 17,
  },

  // Disabled
  btnDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.8,
  },
});
