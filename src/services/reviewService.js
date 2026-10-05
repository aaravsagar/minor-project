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

export const reviewService = {
  /**
   * Buyer submits a rating and review for a completed deal
   */
  async submitReview({ sellerId, buyerId, buyerName, requirementId, dealId, rating, comment }) {
    // 1. Check for duplicate review on same deal
    const reviewsCol = collection(db, 'reviews');
    const dupQuery = query(
      reviewsCol, 
      where('dealId', '==', dealId),
      where('buyerId', '==', buyerId)
    );
    const dupSnap = await getDocs(dupQuery);
    if (!dupSnap.empty) {
      throw new Error('A review has already been submitted for this deal.');
    }

    // 2. Validate rating
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new Error('Rating must be an integer between 1 and 5 stars.');
    }

    // 3. Add review document
    const docRef = await addDoc(reviewsCol, {
      sellerId,
      buyerId,
      buyerName: buyerName || 'Buyer',
      requirementId,
      dealId,
      rating: numRating,
      comment: (comment || '').trim(),
      createdAt: serverTimestamp()
    });

    // 4. Update deal record to mark reviewed
    if (dealId) {
      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, {
        reviewed: true,
        updatedAt: serverTimestamp()
      });
    }

    // 5. Recalculate seller trust score and update seller profile in Firestore
    await this.recalculateAndUpdateSellerTrustScore(sellerId);

    return { id: docRef.id, rating: numRating, comment };
  },

  /**
   * Get all reviews received by a seller
   */
  async getSellerReviews(sellerId) {
    const reviewsCol = collection(db, 'reviews');
    const q = query(reviewsCol, where('sellerId', '==', sellerId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  /**
   * Calculate Trust Score and stats dynamically from actual Firestore reviews
   */
  async getSellerTrustScore(sellerId) {
    const reviews = await this.getSellerReviews(sellerId);
    if (reviews.length === 0) {
      return {
        trustScore: 5.0,
        averageRating: 5.0,
        reviewCount: 0,
        isNewSeller: true
      };
    }

    const totalStars = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    const avg = Number((totalStars / reviews.length).toFixed(1));

    return {
      trustScore: avg,
      averageRating: avg,
      reviewCount: reviews.length,
      isNewSeller: false
    };
  },

  /**
   * Recalculates and persists trustScore & totalReviews on the seller user profile
   */
  async recalculateAndUpdateSellerTrustScore(sellerId) {
    try {
      const stats = await this.getSellerTrustScore(sellerId);
      const userRef = doc(db, 'users', sellerId);
      await updateDoc(userRef, {
        trustScore: stats.trustScore,
        totalReviews: stats.reviewCount,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not update seller profile trust score:', err);
    }
  }
};
