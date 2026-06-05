import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cactus_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // 1. Verify token validity on backend
        await api.auth.verify();

        // 2. Fetch logged-in user profile
        const profile = await api.users.getMe();
        setUser(profile);
      } catch (err) {
        console.error('Session validation failed:', err);
        // Clear expired/invalid session
        localStorage.removeItem('cactus_token');
        localStorage.removeItem('cactus_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('cactus_token', newToken);
    localStorage.setItem('cactus_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('cactus_token');
    localStorage.removeItem('cactus_user');
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
