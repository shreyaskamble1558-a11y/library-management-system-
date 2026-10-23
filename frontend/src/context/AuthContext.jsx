import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('library_token') || '');
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem('library_admin');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  const fetchCurrentAdmin = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setAdmin(response.data.admin);
      localStorage.setItem('library_admin', JSON.stringify(response.data.admin));
    } catch (error) {
      localStorage.removeItem('library_token');
      localStorage.removeItem('library_admin');
      setToken('');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAdmin();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const nextToken = response.data.token;
    const nextAdmin = response.data.admin;

    localStorage.setItem('library_token', nextToken);
    localStorage.setItem('library_admin', JSON.stringify(nextAdmin));
    setToken(nextToken);
    setAdmin(nextAdmin);
    setLoading(false);

    return response;
  };

  const logout = () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_admin');
    setToken('');
    setAdmin(null);
    window.location.href = '/login';
  };

  const value = useMemo(
    () => ({ token, admin, loading, setToken, setAdmin, login, logout }),
    [token, admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
