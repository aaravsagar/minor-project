import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Safe extractor for pitch-level offer price.
 * Standard field: offerPrice
 * Documented backward compatibility fallback: offeredPrice, price
 */
export const extractOfferPrice = (pitch) => {
  if (!pitch || typeof pitch !== 'object') return 0;
  if (pitch.offerPrice !== undefined && pitch.offerPrice !== null && pitch.offerPrice !== '') {
    const num = Number(pitch.offerPrice);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  const legacy = pitch.offeredPrice ?? pitch.price;
  if (legacy !== undefined && legacy !== null && legacy !== '') {
    const num = Number(legacy);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  return 0;
};

/**
 * Safe extractor for deal-level agreed price.
 * Standard field: dealPrice
 * Documented backward compatibility fallback: agreedPrice, price
 */
export const extractDealPrice = (deal) => {
  if (!deal || typeof deal !== 'object') return 0;
  if (deal.dealPrice !== undefined && deal.dealPrice !== null && deal.dealPrice !== '') {
    const num = Number(deal.dealPrice);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  const legacy = deal.agreedPrice ?? deal.price;
  if (legacy !== undefined && legacy !== null && legacy !== '') {
    const num = Number(legacy);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  return 0;
};

export const statsService = {
  extractOfferPrice,
  extractDealPrice,

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
        const budget = Number(r.budget);
        const validBudget = (Number.isFinite(budget) && budget > 0) ? budget : 0;
        totalRequirementBudget += validBudget;
        if (validBudget < 10000) budgetRanges.under10k++;
        else if (validBudget <= 50000) budgetRanges.from10kTo50k++;
        else if (validBudget <= 100000) budgetRanges.from50kTo100k++;
        else budgetRanges.above100k++;
      });

      const avgRequirementBudget = totalRequirements > 0 ? Math.round(totalRequirementBudget / totalRequirements) : 0;

      // Pitches / Proposals Breakdown & Monetary Standardization on `offerPrice`
      const totalPitches = pitches.length;
      const acceptedPitches = pitches.filter(p => p.status === 'accepted').length;
      const pendingPitches = pitches.filter(p => p.status === 'pending').length;
      const rejectedPitches = pitches.filter(p => p.status === 'rejected').length;
      const pitchAcceptanceRate = totalPitches > 0 ? Math.round((acceptedPitches / totalPitches) * 100) : 0;

      let totalOfferValue = 0;
      let totalAcceptedOfferValue = 0;
      pitches.forEach(p => {
        const val = extractOfferPrice(p);
        totalOfferValue += val;
        if (p.status === 'accepted') {
          totalAcceptedOfferValue += val;
        }
      });
      const avgOfferValue = totalPitches > 0 ? Math.round(totalOfferValue / totalPitches) : 0;

      // Deals & Gross Merchandise Volume (GMV) Standardization on `dealPrice`
      const totalDeals = deals.length;
      const activeDeals = deals.filter(d => d.status === 'active' || d.status === 'in_progress').length;
      const completedDeals = deals.filter(d => d.status === 'completed' || d.status === 'delivered').length;
      const cancelledDeals = deals.filter(d => d.status === 'cancelled' || d.status === 'disputed').length;

      // Only count active or completed deals towards GMV (exclude cancelled/disputed)
      const eligibleDeals = deals.filter(d => 
        ['active', 'in_progress', 'completed', 'delivered'].includes(d.status) || !d.status
      );

      let totalGrossVolume = 0;
      eligibleDeals.forEach(d => {
        const price = extractDealPrice(d);
        totalGrossVolume += price;
      });

      // Backward compatibility: If 0 deals in collection but accepted pitches exist, fallback to accepted offer values
      if (totalGrossVolume === 0 && acceptedPitches > 0) {
        totalGrossVolume = totalAcceptedOfferValue;
      }

      const eligibleCount = eligibleDeals.length > 0 ? eligibleDeals.length : acceptedPitches;
      const avgDealValue = eligibleCount > 0 ? Math.round(totalGrossVolume / eligibleCount) : 0;

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

      // Build Recent Activity Feed with Standardized Monetary Displays
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
        const budgetNum = Number(r.budget) || 0;
        activityFeed.push({
          type: 'requirement',
          title: `Requirement posted: "${r.title}"`,
          subtitle: `Budget: ₹${budgetNum.toLocaleString('en-IN')} by ${r.buyerName || 'Buyer'}`,
          timestamp: r.createdAt,
          badge: 'demand'
        });
      });

      pitches.slice(0, 5).forEach(p => {
        const priceNum = extractOfferPrice(p);
        activityFeed.push({
          type: 'pitch',
          title: `Offer submitted: ₹${priceNum.toLocaleString('en-IN')}`,
          subtitle: `By ${p.sellerName || 'Seller'} • Status: ${p.status}`,
          timestamp: p.createdAt,
          badge: p.status === 'accepted' ? 'accepted' : 'offer'
        });
      });

      deals.slice(0, 4).forEach(d => {
        const dealVal = extractDealPrice(d);
        activityFeed.push({
          type: 'deal',
          title: `Contract established: ${d.requirementTitle || 'Deal'}`,
          subtitle: `Value: ₹${dealVal.toLocaleString('en-IN')} • Status: ${d.status}`,
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
        totalOfferValue,
        avgOfferValue,
        totalAcceptedOfferValue,

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
        totalOfferValue: 0,
        avgOfferValue: 0,
        totalAcceptedOfferValue: 0,
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
