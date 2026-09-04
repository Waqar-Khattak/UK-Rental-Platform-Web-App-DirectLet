// Authentication Context
// Phase 1: Manages user authentication state across the application

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: false,
  login: () => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('directlet_user');
    const storedToken = localStorage.getItem('directlet_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const authUser = { ...userData, token };
    setUser(authUser);
    localStorage.setItem('directlet_user', JSON.stringify(authUser));
    localStorage.setItem('directlet_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('directlet_user');
    localStorage.removeItem('directlet_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;
