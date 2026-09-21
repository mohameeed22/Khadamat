import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS } from '../constants/translations';

const LANGUAGE_STORAGE_KEY = '@khadamat_language_v1';

const LanguageContext = createContext({
  language: 'ar',
  setLanguage: () => {},
  t: (key) => key,
  isRTL: true,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ar');

  useEffect(() => {
    // Load stored language preference
    const loadStoredLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang && (savedLang === 'ar' || savedLang === 'fr' || savedLang === 'en')) {
          setLanguageState(savedLang);
        }
      } catch (e) {
        console.warn('Failed to load language preference', e);
      }
    };
    loadStoredLanguage();
  }, []);

  const setLanguage = async (newLang) => {
    if (newLang === language) return;
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to persist language preference', e);
    }
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.fr;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
