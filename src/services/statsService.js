import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const statsService = {
  /**
   * Calculates platform-wide real statistics directly from Firestore collections
   */
  async getAdminPlatformStats() {
    try {
      const [usersSnap, reqsSnap, pitchesSnap, dealsSnap, reportsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'requirements')),
        getDocs(collection(db, 'pitches')),
        getDocs(collection(db, 'deals')),
        getDocs(collection(db, 'reports'))
      ]);

      const users = usersSnap.docs.map(d => d.data());
      const reqs = reqsSnap.docs.map(d => d.data());
      const pitches = pitchesSnap.docs.map(d => d.data());
      const deals = dealsSnap.docs.map(d => d.data());
      const reports = reportsSnap.docs.map(d => d.data());

      const totalUsers = users.length;
      const totalBuyers = users.filter(u => u.role === 'buyer').length;
      const totalSellers = users.filter(u => u.role === 'seller').length;
      const totalAdmins = users.filter(u => u.role === 'admin').length;

      const totalRequirements = reqs.length;
      const activeRequirements = reqs.filter(r => r.status === 'active').length;
      const fulfilledRequirements = reqs.filter(r => r.status === 'fulfilled').length;
      const closedRequirements = reqs.filter(r => r.status === 'closed').length;

      const totalPitches = pitches.length;
      const acceptedPitches = pitches.filter(p => p.status === 'accepted').length;
      const pendingPitches = pitches.filter(p => p.status === 'pending').length;

      const totalDeals = deals.length;
      const completedDeals = deals.filter(d => d.status === 'completed' || d.status === 'active').length;

      const openReports = reports.filter(r => r.status === 'open').length;

      return {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalAdmins,
        totalRequirements,
        activeRequirements,
        fulfilledRequirements,
        closedRequirements,
        totalPitches,
        acceptedPitches,
        pendingPitches,
        totalDeals,
        completedDeals,
        openReports
      };
    } catch (err) {
      console.error('Error computing platform stats:', err);
      return {
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        totalRequirements: 0,
        activeRequirements: 0,
        fulfilledRequirements: 0,
        closedRequirements: 0,
        totalPitches: 0,
        acceptedPitches: 0,
        pendingPitches: 0,
        totalDeals: 0,
        completedDeals: 0,
        openReports: 0
      };
    }
  }
};
