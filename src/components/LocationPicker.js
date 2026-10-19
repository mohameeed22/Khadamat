import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, RADIUS } from '../constants/theme';
import { openInMaps, staticMapUrl } from '../utils/geo';

/**
 * "Share my location" control. `value` = { latitude, longitude, address? } | null.
 */
export const LocationPicker = ({ value, onChange }) => {
  const { language, isRTL } = useLanguage();
  const L = (ar, fr, en) => (language === 'ar' ? ar : language === 'fr' ? fr : en);
  const [loading, setLoading] = useState(false);

  const locate = async () => {
    setLoading(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          L('إذن مطلوب', 'Autorisation requise', 'Permission needed'),
          L('فعّل الموقع باش نلقاو عنوانك', 'Activez la localisation pour partager votre adresse', 'Enable location to share your address')
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      let address = '';
      try {
        const [a] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (a) address = [a.street || a.name, a.city || a.subregion, a.region].filter(Boolean).join(', ');
      } catch (e) {
        // reverse geocoding is optional
      }
      onChange({ latitude, longitude, address });
    } catch (e) {
      Alert.alert(L('خطأ', 'Erreur', 'Error'), L('تعذر تحديد موقعك', 'Impossible de vous localiser', 'Could not get your location'));
    } finally {
      setLoading(false);
    }
  };

  if (!value) {
    return (
      <TouchableOpacity style={[styles.btn, isRTL && { flexDirection: 'row-reverse' }]} onPress={locate} activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="navigate-circle" size={22} color={COLORS.primary} />
        )}
        <Text style={styles.btnText}>
          {L('شارك موقعي الحالي', 'Partager ma position actuelle', 'Share my current location')}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: staticMapUrl(value, { height: 200 }) }} style={styles.map} />
      <View style={[styles.footer, isRTL && { flexDirection: 'row-reverse' }]}>
        <Ionicons name="location" size={18} color={COLORS.danger} />
        <Text style={[styles.addr, isRTL && { textAlign: 'right' }]} numberOfLines={2}>
          {value.address || `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`}
        </Text>
        <TouchableOpacity onPress={() => openInMaps(value, value.address)} style={styles.iconBtn}>
          <Ionicons name="open-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onChange(null)} style={styles.iconBtn}>
          <Ionicons name="close" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  btnText: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDark },
  card: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
  },
  map: { width: '100%', height: 130, backgroundColor: COLORS.slate200 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  addr: { flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.slate700 },
  iconBtn: { padding: 6, borderRadius: 14, backgroundColor: COLORS.slate100 },
});
