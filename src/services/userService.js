import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as authSignOut } from 'firebase/auth';
import { db, firebaseConfig } from '../firebase/config';
import { isAdminEmail } from '../firebase/adminConfig';

export const userService = {
  /**
   * Fetch a user profile by UID
   */
  async getUserProfile(uid) {
    if (!uid) return null;
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() };
    }
    return null;
  },

  /**
   * Initialize or update user profile upon authentication
   */
  async syncAuthUser(user, defaultRole = null, extraProfile = {}) {
    if (!user) return null;
    const userRef = doc(db, 'users', user.uid);
    const existingDoc = await getDoc(userRef);

    const isAdmin = isAdminEmail(user.email);

    if (existingDoc.exists()) {
      const data = existingDoc.data();
      if (isAdmin && data.role !== 'admin') {
        await updateDoc(userRef, {
          role: 'admin',
          updatedAt: serverTimestamp()
        });
        return { ...data, uid: user.uid, role: 'admin' };
      }
      return { uid: user.uid, ...data };
    }

    // New profile initialization
    const initialRole = isAdmin ? 'admin' : (defaultRole || null);

    const initialProfile = {
      uid: user.uid,
      name: extraProfile.name || user.displayName || (initialRole === 'seller' ? 'Seller' : (initialRole === 'admin' ? 'Administrator' : 'Buyer')),
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: initialRole,
      phone: extraProfile.phone || '',
      location: extraProfile.location || 'Ahmedabad',
      company: extraProfile.company || '',
      status: 'active',
      accessRevoked: false,
      isVerified: isAdmin,
      trustScore: initialRole === 'seller' ? 4.9 : 5.0,
      totalDeals: initialRole === 'seller' ? 10 : 0,
      categories: initialRole === 'seller' ? ['cat_mobiles', 'cat_electronics', 'cat_laptops', 'cat_furniture'] : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, initialProfile);
    return initialProfile;
  },

  /**
   * Sets role for user (buyer or seller)
   */
  async setUserRole(uid, role, extraData = {}) {
    const userRef = doc(db, 'users', uid);
    const updateData = {
      role,
      ...extraData,
      updatedAt: serverTimestamp()
    };
    await updateDoc(userRef, updateData);
    const updated = await getDoc(userRef);
    return { uid: updated.id, ...updated.data() };
  },

  /**
   * Update general profile fields (location, phone, bio, categories)
   */
  async updateProfile(uid, profileData) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    const updated = await getDoc(userRef);
    return { uid: updated.id, ...updated.data() };
  },

  /**
   * List all users for Admin
   */
  async getAllUsers() {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  },

  /**
   * Admin: Create a new user (Buyer, Seller, or Admin) with credentials
   * Uses a secondary Firebase App instance so the active admin session is preserved
   */
  async createUserByAdmin({ name, email, password, role = 'buyer', phone = '', location = 'Ahmedabad', company = '', notes = '', status = 'active', isVerified = false }) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const secondaryAppName = `adminSecondary_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let secondaryApp = null;
    let createdUid = null;

    try {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, normalizedEmail, password);
      createdUid = userCredential.user.uid;
      await authSignOut(secondaryAuth);
    } catch (authErr) {
      console.warn('Firebase Auth creation notice (offline/existing/mock fallback):', authErr.message);
      // Fallback unique UID for local / Firestore storage
      createdUid = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch {}
      }
    }

    const userRef = doc(db, 'users', createdUid);
    const newProfile = {
      uid: createdUid,
      name: (name || 'New Buyer').trim(),
      email: normalizedEmail,
      role: role || 'buyer',
      phone: (phone || '').trim(),
      location: (location || 'Ahmedabad').trim(),
      company: (company || '').trim(),
      status: status || 'active',
      accessRevoked: status === 'suspended',
      isVerified: !!isVerified,
      trustScore: role === 'seller' ? 4.9 : 5.0,
      totalDeals: 0,
      notes: (notes || '').trim(),
      createdByAdmin: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, newProfile);
    return { ...newProfile, password };
  },

  /**
   * Admin: Change user role
   */
  async adminChangeRole(uid, newRole) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Admin: Suspend user account with reason
   */
  async adminSuspendUser(uid, reason = 'Administrative suspension') {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status: 'suspended',
      accessRevoked: true,
      suspendedAt: serverTimestamp(),
      suspendedReason: reason,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Admin: Unsuspend / Reactivate user account
   */
  async adminUnsuspendUser(uid) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status: 'active',
      accessRevoked: false,
      suspendedAt: null,
      suspendedReason: null,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Admin: Revoke user access immediately
   */
  async adminRevokeAccess(uid, reason = 'Access revoked by Administrator') {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status: 'suspended',
      accessRevoked: true,
      revokedAt: serverTimestamp(),
      revokeReason: reason,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Admin: Restore revoked user access
   */
  async adminRestoreAccess(uid) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status: 'active',
      accessRevoked: false,
      revokedAt: null,
      revokeReason: null,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Admin: Toggle user status (active / suspended)
   */
  async adminToggleStatus(uid, currentStatus) {
    const userRef = doc(db, 'users', uid);
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const isSuspended = newStatus === 'suspended';
    await updateDoc(userRef, {
      status: newStatus,
      accessRevoked: isSuspended,
      suspendedAt: isSuspended ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    return newStatus;
  },

  /**
   * Admin: Toggle verified badge
   */
  async adminToggleVerification(uid, currentVerified) {
    const userRef = doc(db, 'users', uid);
    const newStatus = !currentVerified;
    await updateDoc(userRef, {
      isVerified: newStatus,
      updatedAt: serverTimestamp()
    });
    return newStatus;
  },

  /**
   * Admin: Update entire user profile
   */
  async adminUpdateUserProfile(uid, updateData) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    const updated = await getDoc(userRef);
    return { uid: updated.id, ...updated.data() };
  },

  /**
   * Admin: Delete user from Firestore
   */
  async adminDeleteUser(uid) {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  }
};
