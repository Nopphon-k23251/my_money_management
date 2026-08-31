import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth';
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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (isFirebaseConfigured) {
  try {
    const isNewApp = getApps().length === 0;
    app = isNewApp ? initializeApp(firebaseConfig) : getApps()[0];

    // Use browserLocalPersistence to prevent IndexedDB "Database is closing/hidden" visibilitychange bug
    try {
      auth = isNewApp
        ? initializeAuth(app, {
            persistence: [
              browserLocalPersistence,
              browserSessionPersistence,
              indexedDBLocalPersistence,
              inMemoryPersistence,
            ],
          })
        : getAuth(app);
    } catch {
      auth = getAuth(app);
    }

    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  } catch (err) {
    console.warn('Firebase initialization skipped or failed:', err);
  }
}

export { app, auth, db, googleProvider };


