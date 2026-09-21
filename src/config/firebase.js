import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Firebase Configuration for Khadamat App
 * 
 * To connect to your real Firebase project:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create or select your project (e.g. "khadamat-tn")
 * 3. Enable Authentication -> Sign-in method -> Phone provider (Free tier: 10,000 verifications/month)
 * 4. Add a Web App in Project Settings to get these credentials
 * 5. Paste the values below:
 */
export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'khadamat-app.firebaseapp.com',
  projectId: 'khadamat-app',
  storageBucket: 'khadamat-app.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890',
};

// Check if developer has replaced placeholders
export const isFirebaseConfigured = () => {
  return (
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    FIREBASE_CONFIG.projectId !== 'khadamat-app'
  );
};

let app;
let auth;

if (isFirebaseConfigured()) {
  try {
    app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export { app, auth };
