import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

/** Read-only thumbnails of a request's photos; tap to open full-screen viewer. */
export const PhotoGallery = ({ photos = [], size = 64 }) => {
  const [active, setActive] = useState(null);
  if (!photos.length) return null;
  const { width, height } = Dimensions.get('window');

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {photos.map((uri, i) => (
          <TouchableOpacity key={uri + i} onPress={() => setActive(i)} activeOpacity={0.85}>
            <Image source={{ uri }} style={[styles.thumb, { width: size, height: size }]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={active !== null} transparent animationType="fade" onRequestClose={() => setActive(null)}>
        <View style={styles.backdrop}>
          <TouchableOpacity style={styles.close} onPress={() => setActive(null)}>
            <Ionicons name="close" size={26} color={COLORS.white} />
          </TouchableOpacity>
          {active !== null && (
            <ScrollView
              horizontal
              pagingEnabled
              contentOffset={{ x: active * width, y: 0 }}
              showsHorizontalScrollIndicator={false}
            >
              {photos.map((uri, i) => (
                <View key={uri + i} style={{ width, height, justifyContent: 'center' }}>
                  <Image source={{ uri }} style={{ width, height: height * 0.75 }} resizeMode="contain" />
                </View>
              ))}
            </ScrollView>
          )}
          <Text style={styles.counter}>{photos.length > 1 ? `${(active ?? 0) + 1} / ${photos.length}` : ''}</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  thumb: { borderRadius: RADIUS.md, backgroundColor: COLORS.slate200 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' },
  close: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  counter: { position: 'absolute', bottom: 40, alignSelf: 'center', color: COLORS.white, fontWeight: '700' },
});
