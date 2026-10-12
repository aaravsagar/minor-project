import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firestore from 'firebase/firestore';
import { statsService, extractOfferPrice, extractDealPrice } from '../src/services/statsService.js';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn((db, name) => ({ path: name })),
    getDocs: vi.fn()
  };
});

describe('Standardized Monetary Metrics in statsService.js', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Extractors & Legacy Fallback Policies', () => {
    it('extractOfferPrice standardizes on offerPrice and supports legacy fallback', () => {
      // Standard schema field
      expect(extractOfferPrice({ offerPrice: 25000 })).toBe(25000);
      expect(extractOfferPrice({ offerPrice: '25000' })).toBe(25000);

      // Legacy fallback: offeredPrice
      expect(extractOfferPrice({ offeredPrice: 18000 })).toBe(18000);

      // Legacy fallback: price
      expect(extractOfferPrice({ price: 12000 })).toBe(12000);

      // Priority: offerPrice takes precedence over legacy
      expect(extractOfferPrice({ offerPrice: 30000, offeredPrice: 20000 })).toBe(30000);

      // Invalid / Missing
      expect(extractOfferPrice(null)).toBe(0);
      expect(extractOfferPrice({})).toBe(0);
      expect(extractOfferPrice({ offerPrice: 'invalid' })).toBe(0);
      expect(extractOfferPrice({ offerPrice: -500 })).toBe(0);
    });

    it('extractDealPrice standardizes on dealPrice and supports legacy fallback', () => {
      // Standard schema field
      expect(extractDealPrice({ dealPrice: 45000 })).toBe(45000);
      expect(extractDealPrice({ dealPrice: '45000' })).toBe(45000);

      // Legacy fallback: agreedPrice
      expect(extractDealPrice({ agreedPrice: 35000 })).toBe(35000);

      // Legacy fallback: price
      expect(extractDealPrice({ price: 28000 })).toBe(28000);

      // Priority: dealPrice takes precedence over legacy
      expect(extractDealPrice({ dealPrice: 50000, agreedPrice: 40000 })).toBe(50000);

      // Invalid / Missing
      expect(extractDealPrice(null)).toBe(0);
      expect(extractDealPrice({})).toBe(0);
      expect(extractDealPrice({ dealPrice: NaN })).toBe(0);
      expect(extractDealPrice({ dealPrice: -100 })).toBe(0);
    });
  });

  describe('Platform Stats Financial Aggregations', () => {
    it('calculates GMV and average deal value correctly from dealPrice and excludes cancelled deals', async () => {
      const mockDeals = [
        { id: 'd1', dealPrice: 30000, status: 'completed' },
        { id: 'd2', dealPrice: 20000, status: 'active' },
        { id: 'd3', dealPrice: 50000, status: 'cancelled' }, // Should be excluded from GMV
        { id: 'd4', agreedPrice: 10000, status: 'delivered' } // Legacy fallback
      ];

      const mockPitches = [
        { id: 'p1', offerPrice: 30000, status: 'accepted' },
        { id: 'p2', offerPrice: 20000, status: 'accepted' },
        { id: 'p3', offerPrice: 25000, status: 'pending' },
        { id: 'p4', offeredPrice: 15000, status: 'rejected' } // Legacy pitch fallback
      ];

      firestore.getDocs.mockImplementation((col) => {
        return Promise.resolve({
          docs: (
            col?.path === 'deals' ? mockDeals :
            col?.path === 'pitches' ? mockPitches :
            []
          ).map(data => ({ id: data.id, data: () => data }))
        });
      });

      // Call getAdminPlatformStats
      const stats = await statsService.getAdminPlatformStats();

      // Expected eligible deals: d1 (30000) + d2 (20000) + d4 (10000) = 60,000 (d3 cancelled excluded)
      expect(stats.totalGrossVolume).toBe(60000);
      expect(stats.completedDeals).toBe(2); // completed + delivered
      expect(stats.cancelledDeals).toBe(1);
      expect(stats.avgDealValue).toBe(20000); // 60000 / 3 eligible deals

      // Pitch monetary values
      // totalOfferValue = 30000 + 20000 + 25000 + 15000 = 90,000
      expect(stats.totalOfferValue).toBe(90000);
      expect(stats.avgOfferValue).toBe(22500); // 90000 / 4
      expect(stats.totalAcceptedOfferValue).toBe(50000); // 30000 + 20000
    });

    it('handles legacy scenario where 0 deals exist but accepted pitches exist as fallback', async () => {
      const mockPitches = [
        { id: 'p1', offerPrice: 15000, status: 'accepted' },
        { id: 'p2', offeredPrice: 25000, status: 'accepted' }
      ];

      firestore.getDocs.mockImplementation((col) => {
        return Promise.resolve({
          docs: (
            col?.path === 'deals' ? [] :
            col?.path === 'pitches' ? mockPitches :
            []
          ).map(data => ({ id: data.id, data: () => data }))
        });
      });

      const stats = await statsService.getAdminPlatformStats();

      expect(stats.totalDeals).toBe(0);
      expect(stats.acceptedPitches).toBe(2);
      expect(stats.totalGrossVolume).toBe(40000); // Sum of accepted pitches (15000 + 25000)
      expect(stats.avgDealValue).toBe(20000);
    });

    it('safely handles missing, null, or malformed data without crashing or returning NaN', async () => {
      const malformedDeals = [
        { id: 'd1', dealPrice: 'invalid_string', status: 'completed' },
        { id: 'd2', status: 'active' }, // missing dealPrice
        { id: 'd3', dealPrice: -5000, status: 'active' }
      ];

      firestore.getDocs.mockImplementation(() => Promise.resolve({
        docs: malformedDeals.map(d => ({ id: d.id, data: () => d }))
      }));

      const stats = await statsService.getAdminPlatformStats();

      expect(Number.isFinite(stats.totalGrossVolume)).toBe(true);
      expect(isNaN(stats.totalGrossVolume)).toBe(false);
      expect(stats.totalGrossVolume).toBe(0);
      expect(stats.avgDealValue).toBe(0);
    });
  });
});
