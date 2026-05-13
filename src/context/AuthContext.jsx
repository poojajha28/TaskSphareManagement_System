import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  async function signup(email, password, displayName) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        rewardPoints: 0,
        rating: 0,
        tasksCompleted: 0,
        projectsCompleted: 0,
        createdAt: new Date(),
        avatar: null
      });
      
      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function updateUserRewards(points, taskCompleted = false) {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const updates = {
        rewardPoints: increment(points)
      };
      
      if (taskCompleted) {
        updates.tasksCompleted = increment(1);
        // Calculate new rating based on tasks completed
        const newTasksCompleted = (userProfile?.tasksCompleted || 0) + 1;
        const newRating = Math.min(5, Math.floor(newTasksCompleted / 10) + 1);
        updates.rating = newRating;
      }
      
      await updateDoc(userRef, updates);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        rewardPoints: (prev?.rewardPoints || 0) + points,
        tasksCompleted: taskCompleted ? (prev?.tasksCompleted || 0) + 1 : prev?.tasksCompleted,
        rating: taskCompleted ? Math.min(5, Math.floor(((prev?.tasksCompleted || 0) + 1) / 10) + 1) : prev?.rating
      }));
      
      toast.success(`+${points} reward points earned!`);
    } catch (error) {
      console.error('Error updating rewards:', error);
      toast.error('Failed to update rewards');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    signup,
    login,
    logout,
    updateUserRewards
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}