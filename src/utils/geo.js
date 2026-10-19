import { Linking, Platform } from 'react-native';

/** Approximate centre of every Tunisian governorate (used as a fallback when no GPS pin exists). */
export const GOVERNORATE_COORDS = {
  Tunis: { latitude: 36.8065, longitude: 10.1815 },
  Ariana: { latitude: 36.8625, longitude: 10.1956 },
  'Ben Arous': { latitude: 36.7533, longitude: 10.2282 },
  Manouba: { latitude: 36.8101, longitude: 10.0863 },
  Nabeul: { latitude: 36.4561, longitude: 10.7376 },
  Zaghouan: { latitude: 36.4029, longitude: 10.1429 },
  Bizerte: { latitude: 37.2744, longitude: 9.8739 },
  Béja: { latitude: 36.7256, longitude: 9.1817 },
  Beja: { latitude: 36.7256, longitude: 9.1817 },
  Jendouba: { latitude: 36.5011, longitude: 8.7802 },
  Kef: { latitude: 36.1675, longitude: 8.7049 },
  'Le Kef': { latitude: 36.1675, longitude: 8.7049 },
  Siliana: { latitude: 36.0849, longitude: 9.3708 },
  Sousse: { latitude: 35.8256, longitude: 10.6084 },
  Monastir: { latitude: 35.7643, longitude: 10.8113 },
  Mahdia: { latitude: 35.5047, longitude: 11.0622 },
  Sfax: { latitude: 34.7406, longitude: 10.7603 },
  Kairouan: { latitude: 35.6781, longitude: 10.0963 },
  Kasserine: { latitude: 35.1676, longitude: 8.8365 },
  'Sidi Bouzid': { latitude: 35.0382, longitude: 9.4849 },
  Gabès: { latitude: 33.8815, longitude: 10.0982 },
  Gabes: { latitude: 33.8815, longitude: 10.0982 },
  Medenine: { latitude: 33.3549, longitude: 10.5055 },
  Médenine: { latitude: 33.3549, longitude: 10.5055 },
  Tataouine: { latitude: 32.9297, longitude: 10.4518 },
  Gafsa: { latitude: 34.425, longitude: 8.7842 },
  Tozeur: { latitude: 33.9197, longitude: 8.1335 },
  Kebili: { latitude: 33.7044, longitude: 8.969 },
  Kébili: { latitude: 33.7044, longitude: 8.969 },
};

/** Best-effort lookup of a governorate centre (case/accents tolerant). */
export const getGovernorateCoords = (name) => {
  if (!name) return null;
  if (GOVERNORATE_COORDS[name]) return GOVERNORATE_COORDS[name];
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const key = Object.keys(GOVERNORATE_COORDS).find((k) => norm(k) === norm(name));
  return key ? GOVERNORATE_COORDS[key] : null;
};

/** Coordinates of a request/artisan: exact pin if present, otherwise the governorate centre. */
export const resolveCoords = (item) => {
  if (item?.location?.latitude != null && item?.location?.longitude != null) {
    return { ...item.location, approximate: false };
  }
  const c = getGovernorateCoords(item?.governorate);
  return c ? { ...c, approximate: true } : null;
};

/** Haversine distance in kilometres. */
export const distanceKm = (a, b) => {
  if (!a || !b) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const formatDistance = (km) => {
  if (km == null || Number.isNaN(km)) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
};

/** Opens the native maps app (or Google Maps on web) at a pin. */
export const openInMaps = (coords, label = '') => {
  if (!coords) return Promise.resolve();
  const { latitude, longitude } = coords;
  const q = encodeURIComponent(label || `${latitude},${longitude}`);
  const url = Platform.select({
    ios: `http://maps.apple.com/?ll=${latitude},${longitude}&q=${q}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${q})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  });
  return Linking.openURL(url).catch(() =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`)
  );
};

/** Opens turn-by-turn directions to a pin. */
export const openDirections = (coords) => {
  if (!coords) return Promise.resolve();
  return Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`
  );
};

/**
 * Free OpenStreetMap static preview (no API key needed). Used as a map thumbnail image.
 */
export const staticMapUrl = (coords, { width = 600, height = 260, zoom = 14 } = {}) =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.latitude},${coords.longitude}` +
  `&zoom=${zoom}&size=${width}x${height}&markers=${coords.latitude},${coords.longitude},red-pushpin`;
