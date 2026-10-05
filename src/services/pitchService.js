import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { requirementService } from './requirementService';
import { reviewService } from './reviewService';

export const pitchService = {
  /**
   * Seller submits a competitive offer/pitch on a requirement
   */
  async submitPitch(data) {
    const colRef = collection(db, 'pitches');
    
    // Check if this seller has already submitted a pitch for this requirement
    const duplicateQuery = query(
      colRef,
      where('requirementId', '==', data.requirementId),
      where('sellerId', '==', data.sellerId)
    );
    const dupSnap = await getDocs(duplicateQuery);
    if (!dupSnap.empty) {
      throw new Error('You have already submitted an offer for this requirement. Multiple duplicate pitches are prevented.');
    }

    const docRef = await addDoc(colRef, {
      requirementId: data.requirementId,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      sellerName: data.sellerName,
      sellerEmail: data.sellerEmail || '',
      sellerPhone: data.sellerPhone || '',
      sellerLocation: data.sellerLocation || '',
      offerPrice: Number(data.offerPrice),
      description: data.description.trim(),
      condition: data.condition || 'Good',
      deliveryTime: data.deliveryTime.trim(),
      sellerNote: (data.sellerNote || '').trim(),
      status: 'pending', // 'pending' | 'accepted' | 'rejected'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Increment requirement offer count
    await requirementService.incrementOfferCount(data.requirementId, 1);

    return { id: docRef.id, ...data, status: 'pending' };
  },

  /**
   * Fetch all pitches received for a specific requirement (Buyer View)
   * Also enriches each pitch with the seller's trust score and review rating from Firestore!
   */
  async getPitchesByRequirement(requirementId) {
    const colRef = collection(db, 'pitches');
    const q = query(colRef, where('requirementId', '==', requirementId));
    const snap = await getDocs(q);
    
    const pitches = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Enrich each seller's trust score and review summary dynamically from Firestore reviews
    const enriched = await Promise.all(pitches.map(async (pitch) => {
      try {
        const stats = await reviewService.getSellerTrustScore(pitch.sellerId);
        return {
          ...pitch,
          sellerTrustScore: stats.trustScore,
          sellerReviewCount: stats.reviewCount,
          sellerAverageRating: stats.averageRating
        };
      } catch {
        return {
          ...pitch,
          sellerTrustScore: 5.0,
          sellerReviewCount: 0,
          sellerAverageRating: 5.0
        };
      }
    }));

    // Sort by offerPrice ascending (best deal first)
    return enriched.sort((a, b) => Number(a.offerPrice) - Number(b.offerPrice));
  },

  /**
   * Fetch all pitches submitted by a seller (Seller View)
   */
  async getSellerPitches(sellerId) {
    const colRef = collection(db, 'pitches');
    const q = query(colRef, where('sellerId', '==', sellerId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Sort descending by createdAt
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  /**
   * Fetch all pitches across the platform for Admin
   */
  async getAllPitchesForAdmin() {
    const colRef = collection(db, 'pitches');
    const snap = await getDocs(colRef);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  /**
   * Update a pitch status
   */
  async updatePitchStatus(pitchId, newStatus) {
    const docRef = doc(db, 'pitches', pitchId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  }
};
