import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  prefix,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  ...props
}) => {
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, isRTL && styles.textRTL]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          isRTL && styles.inputWrapperRTL,
          error && styles.inputWrapperError,
          multiline && styles.inputWrapperMultiline,
        ]}
      >
        {prefix && <View style={styles.prefixContainer}>{prefix}</View>}

        {icon && !prefix && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? COLORS.danger : COLORS.slate400}
            style={[styles.icon, isRTL && styles.iconRTL]}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.slate400}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlign={isRTL ? 'right' : 'left'}
          style={[
            styles.input,
            isRTL && styles.textRTL,
            multiline && styles.inputMultilineText,
            inputStyle,
          ]}
          {...props}
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, isRTL && styles.textRTL]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate700,
    marginBottom: 6,
  },
  textRTL: {
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
  },
  inputWrapperRTL: {
    flexDirection: 'row-reverse',
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    minHeight: 100,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  prefixContainer: {
    marginRight: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  iconRTL: {
    marginRight: 0,
    marginLeft: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.slate900,
    paddingVertical: 12,
  },
  inputMultilineText: {
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '500',
  },
});
