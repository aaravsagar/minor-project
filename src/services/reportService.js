import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const reportService = {
  /**
   * Submit a new report / flag
   */
  async submitReport({ reporterId, reporterName, targetId, targetType, targetTitleOrName, reason, description }) {
    const colRef = collection(db, 'reports');
    const docRef = await addDoc(colRef, {
      reporterId: reporterId || 'anonymous',
      reporterName: reporterName || 'User',
      targetId,
      targetType, // 'requirement' | 'pitch' | 'seller' | 'buyer'
      targetTitleOrName: targetTitleOrName || 'Target Item',
      reason,
      description: (description || '').trim(),
      status: 'open', // 'open' | 'reviewed' | 'resolved'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, status: 'open' };
  },

  /**
   * Admin: List all reports
   */
  async getAllReports() {
    const colRef = collection(db, 'reports');
    const snap = await getDocs(colRef);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  /**
   * Admin: Update report status
   */
  async updateReportStatus(reportId, newStatus) {
    const docRef = doc(db, 'reports', reportId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  }
};
