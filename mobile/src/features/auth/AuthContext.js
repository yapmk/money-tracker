import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await authService.getToken();
        if (stored) setToken(stored);
      } catch {
        // no-op
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
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}