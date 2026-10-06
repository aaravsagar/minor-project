import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const statsService = {
  /**
   * Calculates platform-wide real statistics directly from Firestore collections
   */
  async getAdminPlatformStats() {
    try {
      const [usersSnap, reqsSnap, pitchesSnap, dealsSnap, reportsSnap, catsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'requirements')),
        getDocs(collection(db, 'pitches')),
        getDocs(collection(db, 'deals')),
        getDocs(collection(db, 'reports')),
        getDocs(collection(db, 'categories')).catch(() => ({ docs: [] }))
      ]);

      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const reqs = reqsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const pitches = pitchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const deals = dealsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const reports = reportsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const categories = catsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // User Breakdown
      const totalUsers = users.length;
      const totalBuyers = users.filter(u => u.role === 'buyer').length;
      const totalSellers = users.filter(u => u.role === 'seller').length;
      const totalAdmins = users.filter(u => u.role === 'admin').length;
      const suspendedUsers = users.filter(u => u.status === 'suspended' || u.accessRevoked).length;
      const activeUsers = users.filter(u => u.status !== 'suspended' && !u.accessRevoked).length;
      const verifiedUsers = users.filter(u => u.isVerified).length;

      // Requirements Breakdown
      const totalRequirements = reqs.length;
      const activeRequirements = reqs.filter(r => r.status === 'active').length;
      const fulfilledRequirements = reqs.filter(r => r.status === 'fulfilled').length;
      const closedRequirements = reqs.filter(r => r.status === 'closed').length;
      const reqsWithOffers = reqs.filter(r => (r.offerCount || 0) > 0).length;

      // Budget & Volume Calculations
      let totalRequirementBudget = 0;
      const budgetRanges = {
        under10k: 0,
        from10kTo50k: 0,
        from50kTo100k: 0,
        above100k: 0
      };

      reqs.forEach(r => {
        const budget = Number(r.budget) || 0;
        totalRequirementBudget += budget;
        if (budget < 10000) budgetRanges.under10k++;
        else if (budget <= 50000) budgetRanges.from10kTo50k++;
        else if (budget <= 100000) budgetRanges.from50kTo100k++;
        else budgetRanges.above100k++;
      });

      const avgRequirementBudget = totalRequirements > 0 ? Math.round(totalRequirementBudget / totalRequirements) : 0;

      // Pitches / Proposals Breakdown
      const totalPitches = pitches.length;
      const acceptedPitches = pitches.filter(p => p.status === 'accepted').length;
      const pendingPitches = pitches.filter(p => p.status === 'pending').length;
      const rejectedPitches = pitches.filter(p => p.status === 'rejected').length;
      const pitchAcceptanceRate = totalPitches > 0 ? Math.round((acceptedPitches / totalPitches) * 100) : 0;

      // Deals & Transaction Volume Breakdown
      const totalDeals = deals.length;
      const activeDeals = deals.filter(d => d.status === 'active' || d.status === 'in_progress').length;
      const completedDeals = deals.filter(d => d.status === 'completed' || d.status === 'delivered').length;
      const cancelledDeals = deals.filter(d => d.status === 'cancelled' || d.status === 'disputed').length;

      let totalGrossVolume = 0;
      deals.forEach(d => {
        const price = Number(d.agreedPrice || d.price || d.budget) || 0;
        totalGrossVolume += price;
      });

      // If deals volume is 0 but accepted pitches exist, sum accepted pitches
      if (totalGrossVolume === 0 && acceptedPitches > 0) {
        pitches.filter(p => p.status === 'accepted').forEach(p => {
          totalGrossVolume += Number(p.offeredPrice || p.price) || 0;
        });
      }

      const avgDealValue = totalDeals > 0 ? Math.round(totalGrossVolume / totalDeals) : (acceptedPitches > 0 ? Math.round(totalGrossVolume / acceptedPitches) : 0);

      // Category Distribution
      const catCountMap = {};
      reqs.forEach(r => {
        const cat = r.categoryName || r.categoryId || 'General';
        catCountMap[cat] = (catCountMap[cat] || 0) + 1;
      });

      const categoryDistribution = Object.entries(catCountMap)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalRequirements > 0 ? Math.round((count / totalRequirements) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Moderation & Reports
      const totalReports = reports.length;
      const openReports = reports.filter(r => r.status === 'open').length;
      const reviewedReports = reports.filter(r => r.status === 'reviewed').length;
      const resolvedReports = reports.filter(r => r.status === 'resolved').length;
      const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 100;

      // Build Recent Activity Feed
      const activityFeed = [];
      
      users.slice(0, 5).forEach(u => {
        activityFeed.push({
          type: 'user',
          title: `New user joined: ${u.name || u.email}`,
          subtitle: `Role: ${(u.role || 'buyer').toUpperCase()} • Location: ${u.location || 'Ahmedabad'}`,
          timestamp: u.createdAt,
          badge: u.role || 'user'
        });
      });

      reqs.slice(0, 6).forEach(r => {
        activityFeed.push({
          type: 'requirement',
          title: `Requirement posted: "${r.title}"`,
          subtitle: `Budget: ₹${Number(r.budget || 0).toLocaleString('en-IN')} by ${r.buyerName || 'Buyer'}`,
          timestamp: r.createdAt,
          badge: 'demand'
        });
      });

      pitches.slice(0, 5).forEach(p => {
        activityFeed.push({
          type: 'pitch',
          title: `Offer submitted: ₹${Number(p.offeredPrice || 0).toLocaleString('en-IN')}`,
          subtitle: `By ${p.sellerName || 'Seller'} • Status: ${p.status}`,
          timestamp: p.createdAt,
          badge: p.status === 'accepted' ? 'accepted' : 'offer'
        });
      });

      deals.slice(0, 4).forEach(d => {
        activityFeed.push({
          type: 'deal',
          title: `Contract established: ${d.requirementTitle || 'Deal'}`,
          subtitle: `Value: ₹${Number(d.agreedPrice || 0).toLocaleString('en-IN')} • Status: ${d.status}`,
          timestamp: d.createdAt,
          badge: 'deal'
        });
      });

      return {
        // User metrics
        totalUsers,
        totalBuyers,
        totalSellers,
        totalAdmins,
        suspendedUsers,
        activeUsers,
        verifiedUsers,

        // Requirements metrics
        totalRequirements,
        activeRequirements,
        fulfilledRequirements,
        closedRequirements,
        reqsWithOffers,
        totalRequirementBudget,
        avgRequirementBudget,
        budgetRanges,

        // Pitch metrics
        totalPitches,
        acceptedPitches,
        pendingPitches,
        rejectedPitches,
        pitchAcceptanceRate,

        // Deals & Financials
        totalDeals,
        activeDeals,
        completedDeals,
        cancelledDeals,
        totalGrossVolume,
        avgDealValue,

        // Category & Moderation
        categoryDistribution,
        categoriesCount: categories.length,
        totalReports,
        openReports,
        reviewedReports,
        resolvedReports,
        resolutionRate,

        // Activity stream
        activityFeed: activityFeed.slice(0, 10)
      };
    } catch (err) {
      console.error('Error computing platform stats:', err);
      return {
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        suspendedUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        totalRequirements: 0,
        activeRequirements: 0,
        fulfilledRequirements: 0,
        closedRequirements: 0,
        reqsWithOffers: 0,
        totalRequirementBudget: 0,
        avgRequirementBudget: 0,
        budgetRanges: { under10k: 0, from10kTo50k: 0, from50kTo100k: 0, above100k: 0 },
        totalPitches: 0,
        acceptedPitches: 0,
        pendingPitches: 0,
        rejectedPitches: 0,
        pitchAcceptanceRate: 0,
        totalDeals: 0,
        activeDeals: 0,
        completedDeals: 0,
        cancelledDeals: 0,
        totalGrossVolume: 0,
        avgDealValue: 0,
        categoryDistribution: [],
        categoriesCount: 0,
        totalReports: 0,
        openReports: 0,
        reviewedReports: 0,
        resolvedReports: 0,
        resolutionRate: 100,
        activityFeed: []
      };
    }
  }
};
