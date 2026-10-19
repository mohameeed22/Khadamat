import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { MOCK_ARTISANS } from '../constants/mockArtisans';
import { useRequests } from './RequestContext';

// Sample reviews shown for demo artisans only
const DEMO_REVIEWS = [
  { rating: 5, author: 'Anis C.', comment: 'Travail propre et rapide, très ponctuel. Je recommande !', daysAgo: 3 },
  { rating: 5, author: 'مريم ت.', comment: 'صنايعي محترف وسعره معقول، جا في الوقت المحدد.', daysAgo: 9 },
  { rating: 4, author: 'Tarek B.', comment: 'Bon service, un peu de retard mais résultat impeccable.', daysAgo: 21 },
];

const REAL_ARTISANS_KEY = '@khadamat_artisans_real_v1';

const ArtisanContext = createContext({ artisans: [], isDemo: false });

/**
 * Demo mode  -> the curated MOCK_ARTISANS list.
 * Real mode  -> only providers who actually registered (completed profile setup).
 * A provider is added/updated automatically once their profile is complete.
 */
export const ArtisanProvider = ({ children }) => {
  const { user } = useAuth();
  const { requests } = useRequests();
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

  const artisans = useMemo(() => {
    const base = isDemo ? MOCK_ARTISANS : realArtisans;
    return base.map((a) => {
      const key = a.uid || a.id;
      const real = requests
        .filter((r) => r.review && r.assignedProvider?.id === key)
        .map((r) => ({
          id: r.id,
          rating: r.review.rating,
          comment: r.review.comment,
          author: r.review.author || r.clientName || '',
          createdAt: r.review.createdAt,
          jobTitle: r.title,
          photos: r.photos || [],
        }))
        .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
      const seeded = isDemo
        ? DEMO_REVIEWS.map((d, i) => ({
            id: `demo_${a.id}_${i}`,
            rating: d.rating,
            comment: d.comment,
            author: d.author,
            createdAt: new Date(Date.now() - d.daysAgo * 86400000).toISOString(),
          }))
        : [];
      const reviews = [...real, ...seeded];
      const baseCount = a.reviewsCount || 0;
      const sum = real.reduce((s, r) => s + r.rating, 0);
      const count = baseCount + real.length;
      const rating = count ? ((a.rating || 0) * baseCount + sum) / count : 0;
      return { ...a, reviews, rating, reviewsCount: count, completedJobs: (a.completedJobs || 0) + real.length };
    });
  }, [isDemo, realArtisans, requests]);

  return <ArtisanContext.Provider value={{ artisans, isDemo }}>{children}</ArtisanContext.Provider>;
};

export const useArtisans = () => useContext(ArtisanContext);
