import { describe, it, expect } from 'vitest';
import { 
  calculateMCDMScores, 
  validateWeights, 
  validateCandidateOffer, 
  parseDeliveryTimeToDays,
  DEFAULT_MCDM_WEIGHTS 
} from '../src/services/mcdmScoringService.js';

describe('Multi-Criteria Decision-Making (MCDM) Scoring Engine', () => {

  describe('Weight Constraints & Validation', () => {
    it('accepts valid default weights summing to 1.0', () => {
      expect(validateWeights(DEFAULT_MCDM_WEIGHTS)).toBe(true);
    });

    it('accepts valid custom weights summing to 1.0', () => {
      const customWeights = { rating: 0.4, price: 0.4, deliveryTime: 0.2 };
      expect(validateWeights(customWeights)).toBe(true);
    });

    it('rejects weights that do not sum to 1.0', () => {
      expect(() => validateWeights({ rating: 0.5, price: 0.5, deliveryTime: 0.2 })).toThrow(/must sum to 1\.0/);
      expect(() => validateWeights({ rating: 0.2, price: 0.2, deliveryTime: 0.2 })).toThrow(/must sum to 1\.0/);
    });

    it('rejects negative or non-finite weights', () => {
      expect(() => validateWeights({ rating: -0.1, price: 0.6, deliveryTime: 0.5 })).toThrow(/non-negative/);
      expect(() => validateWeights({ rating: NaN, price: 0.5, deliveryTime: 0.5 })).toThrow(/non-negative/);
      expect(() => validateWeights({ rating: Infinity, price: 0.5, deliveryTime: 0.5 })).toThrow(/non-negative/);
    });
  });

  describe('Delivery Time Parsing', () => {
    it('correctly parses standard delivery timeline options into days', () => {
      expect(parseDeliveryTimeToDays('Immediate / Same day')).toBe(0.5);
      expect(parseDeliveryTimeToDays('Same day handover')).toBe(0.5);
      expect(parseDeliveryTimeToDays('1 day')).toBe(1);
      expect(parseDeliveryTimeToDays('2 days')).toBe(2);
      expect(parseDeliveryTimeToDays('3-5 days')).toBe(4);
      expect(parseDeliveryTimeToDays('Within 1 week')).toBe(7);
      expect(parseDeliveryTimeToDays('Within 2 weeks')).toBe(14);
      expect(parseDeliveryTimeToDays('This month')).toBe(30);
    });

    it('parses numeric values and throws for invalid delivery input', () => {
      expect(parseDeliveryTimeToDays(3)).toBe(3);
      expect(() => parseDeliveryTimeToDays('')).toThrow(/Invalid or missing/);
      expect(() => parseDeliveryTimeToDays(-2)).toThrow(/Invalid numeric/);
      expect(() => parseDeliveryTimeToDays('unknown time')).toThrow(/Unable to parse/);
    });
  });

  describe('Directionality Tests', () => {
    it('higher rating improves the score, all else equal', () => {
      const offerLowRating = { id: 'p1', offerPrice: 10000, sellerTrustScore: 3.5, deliveryTime: '2 days' };
      const offerHighRating = { id: 'p2', offerPrice: 10000, sellerTrustScore: 4.9, deliveryTime: '2 days' };

      const scored = calculateMCDMScores([offerLowRating, offerHighRating]);
      const resLow = scored.find(p => p.id === 'p1');
      const resHigh = scored.find(p => p.id === 'p2');

      expect(resHigh.mcdm.score).toBeGreaterThan(resLow.mcdm.score);
      expect(resHigh.mcdm.rank).toBe(1);
      expect(resLow.mcdm.rank).toBe(2);
    });

    it('lower price improves the score, all else equal', () => {
      const offerExpensive = { id: 'p1', offerPrice: 15000, sellerTrustScore: 4.8, deliveryTime: '2 days' };
      const offerCheap = { id: 'p2', offerPrice: 8000, sellerTrustScore: 4.8, deliveryTime: '2 days' };

      const scored = calculateMCDMScores([offerExpensive, offerCheap]);
      const resCheap = scored.find(p => p.id === 'p2');
      const resExpensive = scored.find(p => p.id === 'p1');

      expect(resCheap.mcdm.score).toBeGreaterThan(resExpensive.mcdm.score);
      expect(resCheap.mcdm.rank).toBe(1);
      expect(resExpensive.mcdm.rank).toBe(2);
    });

    it('shorter delivery time improves the score, all else equal', () => {
      const offerSlow = { id: 'p1', offerPrice: 10000, sellerTrustScore: 4.8, deliveryTime: 'Within 2 weeks' };
      const offerFast = { id: 'p2', offerPrice: 10000, sellerTrustScore: 4.8, deliveryTime: '1 day' };

      const scored = calculateMCDMScores([offerSlow, offerFast]);
      const resFast = scored.find(p => p.id === 'p2');
      const resSlow = scored.find(p => p.id === 'p1');

      expect(resFast.mcdm.score).toBeGreaterThan(resSlow.mcdm.score);
      expect(resFast.mcdm.rank).toBe(1);
      expect(resSlow.mcdm.rank).toBe(2);
    });
  });

  describe('Boundary and Edge Case Handling', () => {
    it('handles identical attribute values without division by zero or NaN (neutral 0.5 value)', () => {
      const identicalOffers = [
        { id: 'p1', offerPrice: 10000, sellerTrustScore: 4.5, deliveryTime: '2 days' },
        { id: 'p2', offerPrice: 10000, sellerTrustScore: 4.5, deliveryTime: '2 days' }
      ];

      const scored = calculateMCDMScores(identicalOffers);

      expect(Number.isFinite(scored[0].mcdm.score)).toBe(true);
      expect(isNaN(scored[0].mcdm.score)).toBe(false);
      expect(scored[0].mcdm.score).toBe(0.5);
      expect(scored[0].mcdm.normalized.rating).toBe(0.5);
      expect(scored[0].mcdm.normalized.price).toBe(0.5);
      expect(scored[0].mcdm.normalized.deliveryTime).toBe(0.5);
    });

    it('handles single candidate offer gracefully', () => {
      const single = [{ id: 'p1', offerPrice: 5000, sellerTrustScore: 4.5, deliveryTime: '1 day' }];
      const scored = calculateMCDMScores(single);

      expect(scored.length).toBe(1);
      expect(scored[0].mcdm.score).toBe(0.5);
      expect(scored[0].mcdm.rank).toBe(1);
      expect(scored[0].mcdm.isTopRecommendation).toBe(true);
    });

    it('returns empty array when candidate offers are empty', () => {
      expect(calculateMCDMScores([])).toEqual([]);
    });

    it('ensures all normalized attribute values fall strictly within [0, 1]', () => {
      const diverseOffers = [
        { id: 'p1', offerPrice: 5000, sellerTrustScore: 4.9, deliveryTime: '1 day' },
        { id: 'p2', offerPrice: 20000, sellerTrustScore: 3.2, deliveryTime: '14 days' },
        { id: 'p3', offerPrice: 12000, sellerTrustScore: 4.0, deliveryTime: '3 days' }
      ];

      const scored = calculateMCDMScores(diverseOffers);
      scored.forEach(offer => {
        expect(offer.mcdm.normalized.rating).toBeGreaterThanOrEqual(0);
        expect(offer.mcdm.normalized.rating).toBeLessThanOrEqual(1);
        expect(offer.mcdm.normalized.price).toBeGreaterThanOrEqual(0);
        expect(offer.mcdm.normalized.price).toBeLessThanOrEqual(1);
        expect(offer.mcdm.normalized.deliveryTime).toBeGreaterThanOrEqual(0);
        expect(offer.mcdm.normalized.deliveryTime).toBeLessThanOrEqual(1);
        expect(offer.mcdm.score).toBeGreaterThanOrEqual(0);
        expect(offer.mcdm.score).toBeLessThanOrEqual(1);
      });
    });

    it('rejects candidate offers with invalid or non-finite data explicitly', () => {
      expect(() => calculateMCDMScores([{ id: 'p1', offerPrice: -500, sellerTrustScore: 4.5, deliveryTime: '1 day' }])).toThrow(/positive number/);
      expect(() => calculateMCDMScores([{ id: 'p1', offerPrice: 'invalid', sellerTrustScore: 4.5, deliveryTime: '1 day' }])).toThrow(/positive number/);
      expect(() => calculateMCDMScores([{ id: 'p1', offerPrice: 1000, sellerTrustScore: 9.9, deliveryTime: '1 day' }])).toThrow(/between 0\.0 and 5\.0/);
    });
  });
});
