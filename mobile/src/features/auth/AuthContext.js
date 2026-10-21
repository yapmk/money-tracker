import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);     // blocks navigation (token read)
  const [isUserLoading, setIsUserLoading] = useState(false); // profile fetch in progress

  useEffect(() => {
    (async () => {
      try {
        const stored = await authService.getToken();
        if (stored) {
          setToken(stored);

          // Background-hydrate the profile. Don't block app start —
          // a slow / offline network should never freeze the app on cold boot.
          setIsUserLoading(true);
          authService
            .getMe()
            .then((me) => setUser(me))
            .catch(async (err) => {
              if (err?.response?.status === 401) {
                // Token is no longer valid (user deleted, secret rotated, etc.)
                await authService.clearToken();
                setToken(null);
                setUser(null);
              }
              // Any other error (network, timeout): leave user null.
              // Profile screen exposes a retry button that calls refreshUser().
            })
            .finally(() => setIsUserLoading(false));
        }
      } catch {
        // SecureStore read failed — treat as no token
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (email, password) => {
    const data = await authService.login(email, password);
    await authService.saveToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signUp = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    await authService.saveToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (patch) => {
    const updated = await authService.updateMe(patch);
    setUser(updated);
    return updated;
  };

  const refreshUser = async () => {
    setIsUserLoading(true);
    try {
      const me = await authService.getMe();
      setUser(me);
      return me;
    } catch (err) {
      if (err?.response?.status === 401) {
        await authService.clearToken();
        setToken(null);
        setUser(null);
      }
      throw err;
    } finally {
      setIsUserLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.clearToken();
    } catch {
      // no-op
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isUserLoading,
        signIn,
        signUp,
        updateProfile,
        refreshUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}