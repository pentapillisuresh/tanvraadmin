import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');
    
    if (token && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
      verifyToken();
    }
    setLoading(false);
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify');
      if (!response.data.admin) {
        logout();
      }
    } catch (error) {
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, admin } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      setAdmin(admin);
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};