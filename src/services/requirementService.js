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
import { getCategoryLimits } from '../config/categoryPriceLimits';
import { API_BASE_URL } from '../config/apiConfig';

export const requirementService = {
  /**
   * Buyer posts a new requirement.
   * Dispatches request to the Express backend (Render) for express-validator processing
   * and Firestore persistence.
   */
  async createRequirement(data) {
    if (!data.title || !data.title.trim()) {
      throw new Error('Requirement title is required');
    }
    if (!data.categoryId) {
      throw new Error('Category is required');
    }

    const budgetNum = Number(data.budget);
    if (isNaN(budgetNum) || !Number.isFinite(budgetNum) || budgetNum <= 0) {
      throw new Error('Budget must be a finite positive number greater than zero');
    }

    const limits = getCategoryLimits(data.categoryId);
    if (budgetNum < limits.min) {
      throw new Error(`Budget is below the permitted minimum for this category (minimum: ₹${limits.min.toLocaleString('en-IN')} for ${limits.name})`);
    }
    if (budgetNum > limits.max) {
      throw new Error(`Budget exceeds the permitted maximum for this category (maximum: ₹${limits.max.toLocaleString('en-IN')} for ${limits.name})`);
    }

    if (data.quantity !== undefined && data.quantity !== null && data.quantity !== '') {
      const qty = Number(data.quantity);
      if (isNaN(qty) || !Number.isInteger(qty) || qty < 1 || qty > 10000) {
        throw new Error('Quantity must be a positive integer between 1 and 10,000');
      }
    }

    // 1. Post to Express Backend on Render
    try {
      const response = await fetch(`${API_BASE_URL}/api/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.buyerId}`,
          'x-user-id': data.buyerId
        },
        body: JSON.stringify({
          ...data,
          budget: budgetNum,
          quantity: data.quantity ? Number(data.quantity) : 1
        })
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok) {
        if (resJson?.errors && Array.isArray(resJson.errors) && resJson.errors.length > 0) {
          const detailedMsg = resJson.errors.map(e => e.message).join('. ');
          throw new Error(detailedMsg || resJson.message || 'Validation failed on server');
        }
        throw new Error(resJson?.message || `Server responded with status ${response.status}`);
      }

      if (resJson?.data) {
        return resJson.data;
      }
    } catch (apiErr) {
      // Re-throw validation errors directly
      if (
        apiErr.message.includes('Budget is below') || 
        apiErr.message.includes('Validation failed') ||
        apiErr.message.includes('permitted minimum') ||
        apiErr.message.includes('Quantity must be') ||
        apiErr.message.includes('required')
      ) {
        throw apiErr;
      }
      
      console.warn('Backend API call failed, falling back to direct Firestore SDK:', apiErr.message);
    }

    // 2. Fallback direct Firestore write if backend is unreachable
    const colRef = collection(db, 'requirements');
    const docRef = await addDoc(colRef, {
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail || '',
      title: data.title.trim(),
      description: (data.description || '').trim(),
      categoryId: data.categoryId,
      categoryName: data.categoryName || limits.name || 'General',
      budget: budgetNum,
      quantity: data.quantity ? Number(data.quantity) : 1,
      location: (data.location || '').trim(),
      urgency: data.urgency,
      imageUrl: data.imageUrl || '',
      status: 'active', // 'active' | 'fulfilled' | 'closed'
      offerCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { 
      id: docRef.id, 
      ...data, 
      budget: budgetNum, 
      quantity: data.quantity ? Number(data.quantity) : 1,
      status: 'active', 
      offerCount: 0 
    };
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
   * Browse active requirements for sellers with server-side Firestore filtering.
   * Query constraints status == 'active' and categoryId are pushed directly to Firestore
   * to eliminate unnecessary document reads and reduce Firestore costs.
   */
  async getActiveRequirements({ categoryId, category, search, location, minBudget, maxBudget, sortBy = 'newest' } = {}) {
    const colRef = collection(db, 'requirements');
    const constraints = [where('status', '==', 'active')];

    // Support either categoryId or category property from caller
    const targetCategory = categoryId || category;
    if (targetCategory && targetCategory !== 'all') {
      constraints.push(where('categoryId', '==', targetCategory));
    }

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    // Map documents safely, guarding against missing/optional fields
    let list = snap.docs.map(d => {
      const data = d.data() || {};
      return {
        id: d.id,
        ...data,
        categoryId: data.categoryId || '',
        categoryName: data.categoryName || 'General',
        budget: typeof data.budget === 'number' ? data.budget : (Number(data.budget) || 0),
        status: data.status || 'active'
      };
    });

    // Secondary client-side filters for un-indexed text substring matches and bounds
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

    if (minBudget && Number(minBudget) > 0) {
      list = list.filter(r => Number(r.budget) >= Number(minBudget));
    }

    if (maxBudget && Number(maxBudget) > 0) {
      list = list.filter(r => Number(r.budget) <= Number(maxBudget));
    }

    // Sort order
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
