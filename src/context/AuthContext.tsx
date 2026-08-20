import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types/finance';

import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string, isRegister?: boolean, displayName?: string) => Promise<void>;
  loginWithCustom: (email: string, name: string) => void;
  logout: () => Promise<void>;
  updateUserCurrency: (currency: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mm_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mm_user_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };


  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const profile: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Google User',
            photoURL: firebaseUser.photoURL || undefined,
            currency: 'THB',
            theme: 'light',
            isDemoUser: false,
          };
          setUser(profile);
          localStorage.setItem('mm_user_session', JSON.stringify(profile));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const profile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Google User',
          photoURL: fbUser.photoURL || undefined,
          currency: 'THB',
          theme: 'light',
          isDemoUser: false,
        };
        setUser(profile);
        localStorage.setItem('mm_user_session', JSON.stringify(profile));
      } else {
        // Fast Mock Google Sign-In Simulation
        await new Promise((res) => setTimeout(res, 600));
        const mockGoogleUser: UserProfile = {
          id: 'google-mock-' + Date.now(),
          email: 'google.account@gmail.com',
          displayName: 'Google Account User',
          photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          currency: 'THB',
          theme: 'light',
          isDemoUser: false,
        };
        setUser(mockGoogleUser);
        localStorage.setItem('mm_user_session', JSON.stringify(mockGoogleUser));
      }
    } finally {
      setIsLoading(false);
    }
  };


  const loginWithEmailPassword = async (
    email: string,
    password: string,
    isRegister: boolean = false,
    displayName: string = ''
  ) => {
    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        if (isRegister) {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          if (displayName.trim()) {
            await updateProfile(userCred.user, { displayName: displayName.trim() });
          }
          const profile: UserProfile = {
            id: userCred.user.uid,
            email: userCred.user.email || '',
            displayName: displayName.trim() || userCred.user.email?.split('@')[0] || 'User',
            currency: 'THB',
            theme: 'light',
            isDemoUser: false,
          };
          setUser(profile);
          localStorage.setItem('mm_user_session', JSON.stringify(profile));
        } else {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          const profile: UserProfile = {
            id: userCred.user.uid,
            email: userCred.user.email || '',
            displayName: userCred.user.displayName || userCred.user.email?.split('@')[0] || 'User',
            photoURL: userCred.user.photoURL || undefined,
            currency: 'THB',
            theme: 'light',
            isDemoUser: false,
          };
          setUser(profile);
          localStorage.setItem('mm_user_session', JSON.stringify(profile));
        }
      } else {
        // Fallback local custom session
        loginWithCustom(email, displayName || email.split('@')[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCustom = (email: string, name: string) => {
    const customUser: UserProfile = {
      id: 'custom-' + Date.now(),
      email,
      displayName: name || email.split('@')[0],
      currency: 'THB',
      theme: 'light',
      isDemoUser: false,
    };
    setUser(customUser);
    localStorage.setItem('mm_user_session', JSON.stringify(customUser));
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem('mm_user_session');
  };

  const updateUserCurrency = (currency: string) => {
    if (!user) return;
    const updated = { ...user, currency };
    setUser(updated);
    localStorage.setItem('mm_user_session', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        theme,
        toggleTheme,
        loginWithGoogle,
        loginWithEmailPassword,
        loginWithCustom,
        logout,
        updateUserCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
