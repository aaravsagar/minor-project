import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { userService } from '../services/userService';
import { isAdminEmail } from '../firebase/adminConfig';

const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('needconnect_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = sessionStorage.getItem('needconnect_session_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          sessionStorage.setItem('needconnect_session_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }));
          const profile = await userService.syncAuthUser(user);
          setUserProfile(profile);
          if (profile) {
            sessionStorage.setItem('needconnect_session_profile', JSON.stringify(profile));
          }
        } else {
          // If no firebase session and not a local session
          const savedProfile = sessionStorage.getItem('needconnect_session_profile');
          if (!savedProfile) {
            setCurrentUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.warn('Auth state sync notice:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Normalize email input (supports shortcuts like 'admin' or 'seller')
   */
  const normalizeEmail = (input) => {
    const raw = (input || '').trim().toLowerCase();
    if (raw === 'admin') return 'admin@needconnect.demo';
    if (raw === 'seller') return 'seller@needconnect.demo';
    if (raw === 'buyer') return 'buyer@needconnect.demo';
    return raw;
  };

  /**
   * Google Popup Sign-in
   */
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await userService.syncAuthUser(result.user);
      setUserProfile(profile);
      setCurrentUser(result.user);
      sessionStorage.setItem('needconnect_session_user', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }));
      sessionStorage.setItem('needconnect_session_profile', JSON.stringify(profile));
      return { user: result.user, profile };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email/Password Sign-In with Demo Access support
   */
  const loginWithEmail = async (emailOrUsername, password) => {
    const email = normalizeEmail(emailOrUsername);
    setLoading(true);
    setAuthError(null);

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (loginErr) {
        // Automatically initialize default demo accounts on first attempt
        if (
          (email === 'admin@needconnect.demo' || email === 'seller@needconnect.demo' || email === 'buyer@needconnect.demo') &&
          (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential')
        ) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const defaultRole = email === 'admin@needconnect.demo' ? 'admin' : (email === 'seller@needconnect.demo' ? 'seller' : 'buyer');
            const defaultName = email === 'admin@needconnect.demo' ? 'Platform Administrator' : (email === 'seller@needconnect.demo' ? 'Patel Electronics' : 'Rohit Sharma');
            const profile = await userService.syncAuthUser(userCredential.user, defaultRole, { name: defaultName });

            setCurrentUser(userCredential.user);
            setUserProfile(profile);
            sessionStorage.setItem('needconnect_session_user', JSON.stringify({
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              displayName: defaultName
            }));
            sessionStorage.setItem('needconnect_session_profile', JSON.stringify(profile));
            return { user: userCredential.user, profile };
          } catch (createErr) {
            throw loginErr;
          }
        }
        throw loginErr;
      }

      const profile = await userService.syncAuthUser(userCredential.user);

      setCurrentUser(userCredential.user);
      setUserProfile(profile);
      sessionStorage.setItem('needconnect_session_user', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      }));
      sessionStorage.setItem('needconnect_session_profile', JSON.stringify(profile));
      return { user: userCredential.user, profile };
    } catch (error) {
      console.error('Email Login Error:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * New User Registration via Email/Password
   */
  const registerWithEmail = async ({ email, password, name, role = 'buyer', phone = '', location = 'Ahmedabad' }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const profile = await userService.syncAuthUser(userCredential.user, role, {
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim()
      });

      setUserProfile(profile);
      setCurrentUser(userCredential.user);
      sessionStorage.setItem('needconnect_session_user', JSON.stringify(userCredential.user));
      sessionStorage.setItem('needconnect_session_profile', JSON.stringify(profile));
      return { user: userCredential.user, profile };
    } catch (error) {
      console.error('Registration Error:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Password Reset
   */
  const resetPassword = async (email) => {
    const normalized = normalizeEmail(email);
    try {
      return await sendPasswordResetEmail(auth, normalized);
    } catch (err) {
      console.warn('Password reset notice:', err);
      return true;
    }
  };

  /**
   * Sign Out
   */
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth).catch(() => {});
      sessionStorage.removeItem('needconnect_session_user');
      sessionStorage.removeItem('needconnect_session_profile');
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set user role during onboarding (buyer or seller)
   */
  const setRole = async (role, extraData = {}) => {
    if (!currentUser) return null;
    setLoading(true);
    try {
      let updated = null;
      try {
        updated = await userService.setUserRole(currentUser.uid, role, extraData);
      } catch {
        updated = { ...(userProfile || {}), role, ...extraData };
      }
      setUserProfile(updated);
      sessionStorage.setItem('needconnect_session_profile', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manually reload / refresh user profile from Firestore
   */
  const refreshProfile = async () => {
    if (!currentUser) return null;
    try {
      const profile = await userService.getUserProfile(currentUser.uid);
      if (profile) {
        setUserProfile(profile);
        sessionStorage.setItem('needconnect_session_profile', JSON.stringify(profile));
      }
      return profile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    authError,
    isAuthenticated: !!currentUser,
    isAdmin: userProfile?.role === 'admin' || (currentUser?.email && isAdminEmail(currentUser.email)),
    isBuyer: userProfile?.role === 'buyer',
    isSeller: userProfile?.role === 'seller',
    hasSelectedRole: !!userProfile?.role,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    setRole,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
