import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@uniplexa_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw);
          if (parsed.access_token && parsed.user) {
            setAccessToken(parsed.access_token);
            setUser(parsed.user);
          }
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback(async (payload) => {
    const token = payload.access_token;
    const u = payload.user;
    setAccessToken(token);
    setUser(u);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ access_token: token, user: u })
    );
  }, []);

  const clearSession = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isReady,
      setSession,
      clearSession,
      isAdmin: user?.role === 'admin',
    }),
    [user, accessToken, isReady, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
