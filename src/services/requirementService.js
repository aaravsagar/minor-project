import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const requirementService = {
  /**
   * Buyer posts a new requirement
   */
  async createRequirement(data) {
    const colRef = collection(db, 'requirements');
    const docRef = await addDoc(colRef, {
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail || '',
      title: data.title.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      budget: Number(data.budget),
      location: data.location.trim(),
      urgency: data.urgency,
      imageUrl: data.imageUrl || '',
      status: 'active', // 'active' | 'fulfilled' | 'closed'
      offerCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, ...data, status: 'active', offerCount: 0 };
  },

  /**
   * Fetch single requirement by ID
   */
  async getRequirementById(id) {
    const docSnap = await getDoc(doc(db, 'requirements', id));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  },

  /**
   * Fetch requirements posted by a specific buyer
   */
  async getBuyerRequirements(buyerId) {
    const colRef = collection(db, 'requirements');
    const q = query(
      colRef, 
      where('buyerId', '==', buyerId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort in memory by createdAt descending
    return list.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  },

  /**
   * Browse active requirements for sellers with filters
   */
  async getActiveRequirements({ categoryId, search, location, maxBudget, sortBy = 'newest' } = {}) {
    const colRef = collection(db, 'requirements');
    let q = query(colRef, where('status', '==', 'active'));

    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Apply in-memory search and filters to handle composite queries cleanly
    if (categoryId && categoryId !== 'all') {
      list = list.filter(r => r.categoryId === categoryId);
    }

    if (location && location.trim()) {
      const loc = location.toLowerCase().trim();
      list = list.filter(r => (r.location || '').toLowerCase().includes(loc));
    }

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      list = list.filter(r => 
        (r.title || '').toLowerCase().includes(s) ||
        (r.description || '').toLowerCase().includes(s) ||
        (r.categoryName || '').toLowerCase().includes(s)
      );
    }

    if (maxBudget && Number(maxBudget) > 0) {
      list = list.filter(r => Number(r.budget) <= Number(maxBudget));
    }

    // Sort
    if (sortBy === 'newest') {
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } else if (sortBy === 'budget-high') {
      list.sort((a, b) => (Number(b.budget) || 0) - (Number(a.budget) || 0));
    } else if (sortBy === 'budget-low') {
      list.sort((a, b) => (Number(a.budget) || 0) - (Number(b.budget) || 0));
    } else if (sortBy === 'urgency') {
      const urgencyRank = { 'Immediate': 1, 'Within 1 week': 2, 'Within 2 weeks': 3, 'This month': 4 };
      list.sort((a, b) => (urgencyRank[a.urgency] || 5) - (urgencyRank[b.urgency] || 5));
    }

    return list;
  },

  /**
   * Get all requirements for Admin
   */
  async getAllRequirementsForAdmin() {
    const colRef = collection(db, 'requirements');
    const snap = await getDocs(colRef);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  /**
   * Update status of requirement ('active', 'fulfilled', 'closed')
   */
  async updateRequirementStatus(id, newStatus) {
    const docRef = doc(db, 'requirements', id);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Increment offer counter
   */
  async incrementOfferCount(id, delta = 1) {
    const docRef = doc(db, 'requirements', id);
    await updateDoc(docRef, {
      offerCount: increment(delta),
      updatedAt: serverTimestamp()
    });
  }
};
