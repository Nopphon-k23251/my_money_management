import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDzCkfpVumte994Yv9GpalDAp9eXeT7SdM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nopphonapp-d0c5b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nopphonapp-d0c5b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'nopphonapp-d0c5b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1046779447829',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1046779447829:web:b50a4468ca4c65b3465c1c',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-DHQLF38KLW',
};

export const isFirebaseConfigured = true;

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };



