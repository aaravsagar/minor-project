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
import { messageService } from './messageService';

export const dealService = {
  /**
   * Complete reverse marketplace Offer Acceptance Flow:
   * 1. Pitch status -> accepted
   * 2. Requirement status -> fulfilled
   * 3. Other pending pitches for requirement -> rejected
   * 4. Deal record created
   * 5. Conversation initialized for 1-to-1 chat
   */
  async acceptOffer({ requirement, pitch, buyer }) {
    if (!requirement?.id || !pitch?.id) {
      throw new Error('Invalid requirement or pitch reference.');
    }

    // 1. Update the chosen pitch to 'accepted'
    const pitchRef = doc(db, 'pitches', pitch.id);
    await updateDoc(pitchRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Mark requirement as 'fulfilled'
    const reqRef = doc(db, 'requirements', requirement.id);
    await updateDoc(reqRef, {
      status: 'fulfilled',
      acceptedPitchId: pitch.id,
      acceptedSellerId: pitch.sellerId,
      acceptedSellerName: pitch.sellerName,
      fulfilledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 3. Mark all other pending pitches for this requirement as 'rejected'
    const pitchesCol = collection(db, 'pitches');
    const siblingQuery = query(
      pitchesCol, 
      where('requirementId', '==', requirement.id)
    );
    const siblingSnap = await getDocs(siblingQuery);
    for (const siblingDoc of siblingSnap.docs) {
      if (siblingDoc.id !== pitch.id && siblingDoc.data().status === 'pending') {
        await updateDoc(doc(db, 'pitches', siblingDoc.id), {
          status: 'rejected',
          updatedAt: serverTimestamp()
        });
      }
    }

    // 4. Create Match / Deal document
    const dealsCol = collection(db, 'deals');
    const dealDoc = await addDoc(dealsCol, {
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      requirementBudget: requirement.budget,
      buyerId: buyer.uid,
      buyerName: buyer.displayName || buyer.name || 'Buyer',
      buyerEmail: buyer.email || '',
      sellerId: pitch.sellerId,
      sellerName: pitch.sellerName,
      sellerEmail: pitch.sellerEmail || '',
      pitchId: pitch.id,
      dealPrice: Number(pitch.offerPrice),
      deliveryTime: pitch.deliveryTime,
      condition: pitch.condition,
      status: 'active', // 'active' | 'completed' | 'cancelled'
      reviewed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 5. Initialize Conversation between Buyer and Seller
    const conversation = await messageService.getOrCreateConversation({
      dealId: dealDoc.id,
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      buyerId: buyer.uid,
      buyerName: buyer.displayName || buyer.name || 'Buyer',
      sellerId: pitch.sellerId,
      sellerName: pitch.sellerName
    });

    return {
      dealId: dealDoc.id,
      conversationId: conversation.id
    };
  },

  /**
   * Get all deals for a Buyer
   */
  async getBuyerDeals(buyerId) {
    const colRef = collection(db, 'deals');
    const q = query(colRef, where('buyerId', '==', buyerId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  /**
   * Get all deals for a Seller
   */
  async getSellerDeals(sellerId) {
    const colRef = collection(db, 'deals');
    const q = query(colRef, where('sellerId', '==', sellerId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  /**
   * Mark deal as completed (e.g. goods delivered/handed over)
   */
  async markDealCompleted(dealId) {
    const dealRef = doc(db, 'deals', dealId);
    await updateDoc(dealRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Get deal by ID
   */
  async getDealById(dealId) {
    const docSnap = await getDoc(doc(db, 'deals', dealId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  }
};
