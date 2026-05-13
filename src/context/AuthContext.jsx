import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../config/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUserProfile() {
    try {
      const profile = await api.get('/auth/me');
      setUser({ id: profile.id, email: profile.email });
      setUserProfile({
        uid: profile.id,
        displayName: profile.name,
        email: profile.email,
        rewardPoints: profile.rewardPoints,
        rating: profile.rating,
        tasksCompleted: profile.tasksCompleted,
        projectsCompleted: profile.projectsCompleted,
        createdAt: profile.createdAt
      });
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function signup(email, password, displayName) {
    try {
      const data = await api.post('/auth/signup', { email, password, name: displayName });
      localStorage.setItem('token', data.token);
      setUser({ id: data.user.id, email: data.user.email });
      setUserProfile({
        uid: data.user.id,
        displayName: data.user.name,
        email: data.user.email,
        rewardPoints: 0,
        rating: 0,
        tasksCompleted: 0
      });
      toast.success('Account created successfully!');
      return data.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser({ id: data.user.id, email: data.user.email });
      setUserProfile({
        uid: data.user.id,
        displayName: data.user.name,
        email: data.user.email,
        rewardPoints: data.user.rewardPoints,
        rating: data.user.rating,
        tasksCompleted: data.user.tasksCompleted
      });
      toast.success('Logged in successfully!');
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setUserProfile(null);
    toast.success('Logged out successfully!');
  }

  async function updateUserRewards(points, taskCompleted = false) {
    await fetchUserProfile();
  }

  async function refreshUserProfile() {
    await fetchUserProfile();
  }

  const value = {
    user,
    userProfile,
    signup,
    login,
    logout,
    updateUserRewards,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}