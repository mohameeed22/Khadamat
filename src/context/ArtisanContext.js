import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { MOCK_ARTISANS } from '../constants/mockArtisans';

const REAL_ARTISANS_KEY = '@khadamat_artisans_real_v1';

const ArtisanContext = createContext({ artisans: [], isDemo: false });

/**
 * Demo mode  -> the curated MOCK_ARTISANS list.
 * Real mode  -> only providers who actually registered (completed profile setup).
 * A provider is added/updated automatically once their profile is complete.
 */
export const ArtisanProvider = ({ children }) => {
  const { user } = useAuth();
  const isDemo = !!user?.isDemo;
  const [realArtisans, setRealArtisans] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(REAL_ARTISANS_KEY)
      .then((raw) => raw && setRealArtisans(JSON.parse(raw)))
      .catch((e) => console.warn('Failed to load artisans:', e));
  }, []);

  // Register the logged-in real provider in the directory
  useEffect(() => {
    if (!user || isDemo || user.role !== 'provider' || !user.profile?.completedAt) return;
    const p = user.profile;
    const cat = (p.services && p.services[0]) || 'other';
    const entry = {
      id: `real_${user.uid}`,
      uid: user.uid,
      name: p.fullName || user.phoneNumber,
      roleTitleAr: p.fullName,
      roleTitleFr: 'Prestataire de services',
      roleTitleEn: 'Service provider',
      category: cat,
      services: p.services || [],
      governorate: p.governorate || 'Tunis',
      city: p.city || p.governorate || '',
      phone: user.phoneNumber,
      whatsapp: user.phoneNumber,
      rating: 0,
      reviewsCount: 0,
      completedJobs: 0,
      priceEstimate: '—',
      priceUnitAr: 'حسب الاتفاق',
      priceUnitFr: 'Selon accord',
      priceUnitEn: 'By agreement',
      isVerified: false,
      isAvailable: true,
      bioAr: p.bio || '',
      bioFr: p.bio || '',
      bioEn: p.bio || '',
      skills: [],
    };
    setRealArtisans((prev) => {
      const next = [...prev.filter((a) => a.uid !== user.uid), entry];
      AsyncStorage.setItem(REAL_ARTISANS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [user, isDemo]);

  const artisans = useMemo(() => (isDemo ? MOCK_ARTISANS : realArtisans), [isDemo, realArtisans]);

  return <ArtisanContext.Provider value={{ artisans, isDemo }}>{children}</ArtisanContext.Provider>;
};

export const useArtisans = () => useContext(ArtisanContext);
