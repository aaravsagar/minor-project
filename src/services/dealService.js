import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { messageService } from './messageService';

export const dealService = {
  /**
   * Atomic reverse marketplace Offer Acceptance Flow using Cloud Firestore runTransaction:
   * 
   * Invariants enforced transactionally:
   * 1. Read all transaction-dependent documents before any writes (req, pitch, deterministic deal, sibling pitches)
   * 2. Validate requirement exists, belongs to caller, and is active
   * 3. Validate pitch exists, belongs to requirement, and is pending
   * 4. Enforce deterministic deal ID (deal_${requirementId}) to prevent concurrent acceptance races
   * 5. Atomically update requirement -> fulfilled, pitch -> accepted, sibling pitches -> rejected, and create deal doc
   * 6. Idempotent follow-up for conversation creation with durable retry state
   */
  async acceptOffer({ requirement, pitch, buyer }) {
    if (!requirement?.id || !pitch?.id) {
      throw new Error('Invalid requirement or pitch reference.');
    }

    const reqId = requirement.id;
    const pitchId = pitch.id;
    const deterministicDealId = `deal_${reqId}`;

    const reqRef = doc(db, 'requirements', reqId);
    const pitchRef = doc(db, 'pitches', pitchId);
    const dealRef = doc(db, 'deals', deterministicDealId);

    // Read sibling pitches for this requirement prior to transaction to identify refs
    const pitchesCol = collection(db, 'pitches');
    const siblingQuery = query(
      pitchesCol, 
      where('requirementId', '==', reqId)
    );
    const siblingSnap = await getDocs(siblingQuery);
    const pendingSiblings = siblingSnap.docs.filter(
      d => d.id !== pitchId && d.data()?.status === 'pending'
    );

    // CORE ATOMIC ACCEPTANCE TRANSACTION
    const transactionResult = await runTransaction(db, async (transaction) => {
      // 1. TRANSACTION READS PHASE (Must occur before any transaction writes)
      const reqDoc = await transaction.get(reqRef);
      const pitchDoc = await transaction.get(pitchRef);
      const dealDoc = await transaction.get(dealRef);

      // Read sibling documents within transaction
      const siblingDocsRead = await Promise.all(
        pendingSiblings.map(d => transaction.get(d.ref))
      );

      // 2. VALIDATION INVARIANTS
      if (!reqDoc.exists()) {
        throw new Error('Requirement does not exist. It may have been deleted.');
      }
      const reqData = reqDoc.data();

      // Authorization check: Only requirement owner can accept
      if (buyer?.uid && reqData.buyerId !== buyer.uid) {
        throw new Error('Unauthorized: Only the buyer who posted this requirement can accept an offer.');
      }

      if (!pitchDoc.exists()) {
        throw new Error('Pitch does not exist. It may have been retracted by the seller.');
      }
      const pitchData = pitchDoc.data();

      // Ensure pitch belongs to requirement
      if (pitchData.requirementId !== reqId) {
        throw new Error('Pitch does not belong to the selected requirement.');
      }

      // Check deterministic deal document for duplicate/concurrent acceptances
      if (dealDoc.exists()) {
        const existingDeal = dealDoc.data();
        if (existingDeal.pitchId === pitchId) {
          // Idempotent retry: Deal was already accepted for this exact pitch
          return {
            dealId: deterministicDealId,
            isExisting: true,
            deal: existingDeal
          };
        }
        throw new Error('A deal has already been accepted for this requirement with a different offer.');
      }

      // Requirement eligibility check
      if (reqData.status !== 'active') {
        if (reqData.status === 'fulfilled' && reqData.acceptedPitchId === pitchId) {
          return {
            dealId: deterministicDealId,
            isExisting: true,
            deal: null
          };
        }
        throw new Error(`Requirement is no longer active (current status: "${reqData.status}"). Offers cannot be accepted.`);
      }

      // Pitch eligibility check
      if (pitchData.status !== 'pending') {
        throw new Error(`Pitch is no longer pending (current status: "${pitchData.status}").`);
      }

      // 3. TRANSACTION WRITES PHASE (Atomically committed together)

      // A. Update requirement: mark as fulfilled and record winning pitch & seller
      transaction.update(reqRef, {
        status: 'fulfilled',
        acceptedPitchId: pitchId,
        acceptedSellerId: pitchData.sellerId,
        acceptedSellerName: pitchData.sellerName,
        dealId: deterministicDealId,
        fulfilledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // B. Update chosen pitch: mark as accepted
      transaction.update(pitchRef, {
        status: 'accepted',
        dealId: deterministicDealId,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // C. Update competing sibling pitches: mark as rejected
      pendingSiblings.forEach((sDoc, idx) => {
        const sData = siblingDocsRead[idx]?.data();
        if (sData?.status === 'pending') {
          transaction.update(sDoc.ref, {
            status: 'rejected',
            updatedAt: serverTimestamp()
          });
        }
      });

      // D. Create Deal document atomically
      const conversationId = `conv_${reqId}_${pitchData.sellerId}`;
      const newDealData = {
        id: deterministicDealId,
        requirementId: reqId,
        requirementTitle: reqData.title || requirement.title,
        requirementBudget: reqData.budget || requirement.budget,
        buyerId: buyer.uid,
        buyerName: buyer.displayName || buyer.name || reqData.buyerName || 'Buyer',
        buyerEmail: buyer.email || reqData.buyerEmail || '',
        sellerId: pitchData.sellerId,
        sellerName: pitchData.sellerName,
        sellerEmail: pitchData.sellerEmail || '',
        sellerPhone: pitchData.sellerPhone || '',
        pitchId: pitchId,
        dealPrice: Number(pitchData.offerPrice),
        deliveryTime: pitchData.deliveryTime,
        condition: pitchData.condition || 'Good',
        status: 'active', // 'active' | 'completed' | 'cancelled'
        reviewed: false,
        conversationId,
        conversationStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      transaction.set(dealRef, newDealData);

      return {
        dealId: deterministicDealId,
        isExisting: false,
        deal: newDealData
      };
    });

    const dealId = transactionResult.dealId;
    let conversationId = `conv_${reqId}_${pitch.sellerId}`;

    // 4. POST-TRANSACTION CONVERSATION CREATION
    // Core deal state is already committed atomically. 
    // Conversation is initialized safely with error recovery to ensure failure cannot corrupt deal state.
    try {
      const conversation = await messageService.getOrCreateConversation({
        dealId,
        requirementId: reqId,
        requirementTitle: requirement.title,
        buyerId: buyer.uid,
        buyerName: buyer.displayName || buyer.name || 'Buyer',
        sellerId: pitch.sellerId,
        sellerName: pitch.sellerName
      });
      conversationId = conversation.id;

      // Mark conversationStatus as ready
      try {
        await updateDoc(dealRef, {
          conversationStatus: 'ready',
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        // Non-blocking
      }
    } catch (convErr) {
      console.warn('Post-transaction conversation creation failed, flagged for recovery:', convErr);
      try {
        await updateDoc(dealRef, {
          conversationStatus: 'failed',
          conversationError: convErr.message || 'Initialization error',
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        // Non-blocking
      }
    }

    return {
      dealId,
      conversationId
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
  },

  /**
   * Safe idempotent recovery for deals with pending or failed conversations
   */
  async ensureDealConversation(dealId) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new Error('Deal not found');

    const conversation = await messageService.getOrCreateConversation({
      dealId: deal.id,
      requirementId: deal.requirementId,
      requirementTitle: deal.requirementTitle,
      buyerId: deal.buyerId,
      buyerName: deal.buyerName,
      sellerId: deal.sellerId,
      sellerName: deal.sellerName
    });

    const dealRef = doc(db, 'deals', dealId);
    await updateDoc(dealRef, {
      conversationId: conversation.id,
      conversationStatus: 'ready',
      conversationError: null,
      updatedAt: serverTimestamp()
    });

    return conversation;
  }
};
