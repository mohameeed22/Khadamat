import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, RADIUS } from '../constants/theme';

const MAX_PHOTOS = 4;

/**
 * Lets the client attach up to 4 photos of the problem (camera or gallery).
 * `photos` is an array of image URIs; `onChange` receives the new array.
 */
export const PhotoPicker = ({ photos, onChange }) => {
  const { language, isRTL } = useLanguage();
  const L = (ar, fr, en) => (language === 'ar' ? ar : language === 'fr' ? fr : en);

  const add = (uris) => onChange([...photos, ...uris].slice(0, MAX_PHOTOS));

  const fromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(L('إذن مطلوب', 'Autorisation requise', 'Permission needed'),
        L('نحتاج الوصول للصور', 'Accès aux photos nécessaire', 'Photo library access is required'));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.6,
    });
    if (!res.canceled) add(res.assets.map((a) => a.uri));
  };

  const fromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(L('إذن مطلوب', 'Autorisation requise', 'Permission needed'),
        L('نحتاج الوصول للكاميرا', 'Accès à la caméra nécessaire', 'Camera access is required'));
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled) add(res.assets.map((a) => a.uri));
  };

  const remove = (uri) => onChange(photos.filter((p) => p !== uri));
  const full = photos.length >= MAX_PHOTOS;

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}
      >
        {!full && (
          <>
            <TouchableOpacity style={styles.addBox} onPress={fromCamera} activeOpacity={0.7}>
              <Ionicons name="camera" size={24} color={COLORS.primary} />
              <Text style={styles.addText}>{L('كاميرا', 'Caméra', 'Camera')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBox} onPress={fromGallery} activeOpacity={0.7}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.addText}>{L('معرض', 'Galerie', 'Gallery')}</Text>
            </TouchableOpacity>
          </>
        )}
        {photos.map((uri) => (
          <View key={uri} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => remove(uri)}>
              <Ionicons name="close" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Text style={[styles.hint, isRTL && { textAlign: 'right' }]}>
        {photos.length}/{MAX_PHOTOS} ·{' '}
        {L('صوّر المشكل باش الصنايعي يجيب معاه المعدات', 'Une photo aide l’artisan à venir préparé', 'A photo helps the pro come prepared')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { gap: 10, paddingVertical: 4 },
  addBox: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  thumbWrap: { width: 84, height: 84 },
  thumb: { width: 84, height: 84, borderRadius: RADIUS.md, backgroundColor: COLORS.slate200 },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 11, color: COLORS.slate500, marginTop: 6 },
});
