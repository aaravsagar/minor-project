import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { INITIAL_CATEGORIES } from '../firebase/seedDemoData';

export const categoryService = {
  /**
   * Fetch all active categories (or all for admin)
   */
  async getCategories(all = false) {
    try {
      const catRef = collection(db, 'categories');
      const snap = await getDocs(catRef);
      
      let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Auto-fallback: if database has 0 categories, initialize or return default categories
      if (list.length === 0) {
        try {
          for (const cat of INITIAL_CATEGORIES) {
            await setDoc(doc(db, 'categories', cat.id), {
              ...cat,
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
          const freshSnap = await getDocs(catRef);
          list = freshSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
          // If unauthenticated or offline, use INITIAL_CATEGORIES directly
          list = INITIAL_CATEGORIES.map(c => ({ ...c, isActive: true }));
        }
      }

      if (!all) {
        list = list.filter(c => c.isActive !== false);
      }

      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (err) {
      console.warn('Error fetching categories, falling back to default:', err);
      return INITIAL_CATEGORIES.map(c => ({ ...c, isActive: true }));
    }
  },

  /**
   * Admin: Add new category
   */
  async addCategory(name, description = '') {
    const slug = 'cat_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const catRef = doc(db, 'categories', slug);
    const existing = await getDoc(catRef);
    
    if (existing.exists()) {
      throw new Error(`Category "${name}" already exists.`);
    }

    const newCategory = {
      id: slug,
      name: name.trim(),
      description: description.trim(),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(catRef, newCategory);
    return newCategory;
  },

  /**
   * Admin: Update category
   */
  async updateCategory(id, data) {
    const catRef = doc(db, 'categories', id);
    await updateDoc(catRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Admin: Toggle category active status
   */
  async toggleCategoryStatus(id, currentStatus) {
    const catRef = doc(db, 'categories', id);
    const newStatus = !currentStatus;
    await updateDoc(catRef, {
      isActive: newStatus,
      updatedAt: serverTimestamp()
    });
    return newStatus;
  }
};
