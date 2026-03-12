import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithBackend = async (user, additionalData = {}) => {
    try {
      const token = await user.getIdToken();
      const response = await api.post('/users/sync', {
        email: user.email,
        name: user.displayName || additionalData.name || user.email.split('@')[0],
        username: additionalData.username || user.email.split('@')[0],
        dob: additionalData.dob
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserData(response.data.user);
      
      // Initialize real-time connection
      initSocket(token);
      
      return response.data.user;
    } catch (error) {
      console.error("Error syncing user:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch/Sync profile
        await syncUserWithBackend(user);
      } else {
        setUserData(null);
        disconnectSocket();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, additionalData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await syncUserWithBackend(userCredential.user, additionalData);
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    disconnectSocket();
    return signOut(auth);
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await syncUserWithBackend(userCredential.user);
    return userCredential;
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    syncUserWithBackend
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
