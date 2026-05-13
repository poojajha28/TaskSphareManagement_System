import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  async function signup(email, password, name) {
    try {
      setLoading(true);
      const response = await authService.signup({ email, password, name });
      
      const { user: userData, token } = response;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      toast.success('Account created successfully!');
      return userData;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      
      const { user: userData, token } = response;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      toast.success('Logged in successfully!');
      return userData;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  }

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}