import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
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
      name: extraProfile.name || user.displayName || (initialRole === 'seller' ? 'Demo Seller' : (initialRole === 'admin' ? 'Administrator' : 'User')),
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: initialRole,
      phone: extraProfile.phone || '',
      location: extraProfile.location || 'Ahmedabad',
      status: 'active',
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
   * Admin: Toggle user status (active / suspended)
   */
  async adminToggleStatus(uid, currentStatus) {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return newStatus;
  }
};
