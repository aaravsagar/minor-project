import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const messageService = {
  /**
   * Find existing conversation or create a new one for accepted deal
   */
  async getOrCreateConversation({ dealId, requirementId, requirementTitle, buyerId, buyerName, sellerId, sellerName }) {
    // Generate deterministic conversation ID to prevent duplicate threads
    const conversationId = `conv_${requirementId}_${sellerId}`;
    const convRef = doc(db, 'conversations', conversationId);
    const existing = await getDoc(convRef);

    if (existing.exists()) {
      return { id: existing.id, ...existing.data() };
    }

    const convData = {
      dealId: dealId || '',
      requirementId,
      requirementTitle: requirementTitle || 'Requirement',
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      participants: [buyerId, sellerId],
      lastMessage: 'Deal accepted! You can now coordinate delivery and pickup details.',
      lastMessageSenderId: 'system',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    await setDoc(convRef, convData);
    return { id: conversationId, ...convData };
  },

  /**
   * Get all conversations where the current user is either buyer or seller
   * Realtime listener
   */
  subscribeToUserConversations(userId, onUpdate) {
    if (!userId) return () => {};
    const colRef = collection(db, 'conversations');
    const q = query(
      colRef, 
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      convs.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      onUpdate(convs);
    }, (error) => {
      console.error('Error listening to conversations:', error);
    });
  },

  /**
   * Subscribe to messages inside a conversation in real time
   */
  subscribeToMessages(conversationId, onUpdate) {
    if (!conversationId) return () => {};
    const msgsCol = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsCol, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      onUpdate(messages);
    }, (error) => {
      console.error('Error listening to messages:', error);
    });
  },

  /**
   * Send a 1-to-1 message
   */
  async sendMessage({ conversationId, senderId, senderName, receiverId, text }) {
    if (!text || !text.trim() || !conversationId) return;

    const msgsCol = collection(db, 'conversations', conversationId, 'messages');
    const convRef = doc(db, 'conversations', conversationId);

    const messageData = {
      conversationId,
      senderId,
      senderName,
      receiverId,
      text: text.trim(),
      read: false,
      createdAt: serverTimestamp()
    };

    // Add message
    await addDoc(msgsCol, messageData);

    // Update conversation lastMessage
    await updateDoc(convRef, {
      lastMessage: text.trim(),
      lastMessageSenderId: senderId,
      updatedAt: serverTimestamp()
    });
  }
};
