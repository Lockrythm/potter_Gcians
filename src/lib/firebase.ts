import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.appId
);

if (!isFirebaseConfigured) {
  console.error('Firebase configuration is missing. Please check your environment variables:',
    '\n- VITE_FIREBASE_API_KEY:', firebaseConfig.apiKey ? '✓' : '✗ missing',
    '\n- VITE_FIREBASE_PROJECT_ID:', firebaseConfig.projectId ? '✓' : '✗ missing',
    '\n- VITE_FIREBASE_APP_ID:', firebaseConfig.appId ? '✓' : '✗ missing'
  );
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { isFirebaseConfigured };
