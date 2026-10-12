/**
 * Multi-Criteria Decision-Making (MCDM) Scoring Engine
 * 
 * Uses Min-Max Normalization to score and rank seller offers objectively across:
 * 1. Seller Trust Rating (R) - Benefit attribute (Higher is better)
 * 2. Quoted Offer Price (P)   - Cost attribute (Lower is better)
 * 3. Delivery Timeline (T)    - Cost attribute (Shorter is better)
 * 
 * Mathematical Formulation:
 * S = w1 * Rn + w2 * Pn + w3 * Tn
 * 
 * Where:
 * Rn = (R - Rmin) / (Rmax - Rmin)
 * Pn = (Pmax - P) / (Pmax - Pmin)
 * Tn = (Tmax - T) / (Tmax - Tmin)
 * 
 * Weight constraint:
 * w1 + w2 + w3 = 1.0 (all weights >= 0 and finite)
 */

export const DEFAULT_MCDM_WEIGHTS = {
  rating: 0.35,     // w1: Seller reputation and verified trust score
  price: 0.45,      // w2: Cost competitiveness relative to other pitches
  deliveryTime: 0.20 // w3: Speed of fulfillment / delivery
};

const FLOAT_TOLERANCE = 1e-5;
const NEUTRAL_NORMALIZED_VALUE = 0.5;

/**
 * Parses delivery time representation into a numeric day duration.
 * Supports numbers, strings like "1 day", "2 days", "3-5 days", "Within 1 week", "Same day".
 */
export function parseDeliveryTimeToDays(deliveryTime) {
  if (typeof deliveryTime === 'number') {
    if (!Number.isFinite(deliveryTime) || deliveryTime <= 0) {
      throw new Error(`Invalid numeric delivery time: ${deliveryTime}`);
    }
    return deliveryTime;
  }

  if (typeof deliveryTime !== 'string' || !deliveryTime.trim()) {
    throw new Error(`Invalid or missing delivery time: "${deliveryTime}"`);
  }

  const clean = deliveryTime.toLowerCase().trim();

  if (clean.includes('same day') || clean.includes('immediate')) {
    return 0.5;
  }
  if (clean.includes('1 day')) {
    return 1;
  }
  if (clean.includes('2 days') || clean.includes('2 day')) {
    return 2;
  }
  if (clean.includes('3-5') || clean.includes('3 to 5') || clean.includes('3 - 5')) {
    return 4;
  }
  if (clean.includes('1 week') || clean.includes('within 1 week')) {
    return 7;
  }
  if (clean.includes('2 weeks') || clean.includes('within 2 weeks')) {
    return 14;
  }
  if (clean.includes('month') || clean.includes('this month')) {
    return 30;
  }

  // Attempt regex match for explicit number of days/hours
  const match = clean.match(/(\d+(\.\d+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (Number.isFinite(val) && val > 0) {
      if (clean.includes('hour') || clean.includes('hr')) {
        return Math.max(0.1, val / 24);
      }
      if (clean.includes('week')) {
        return val * 7;
      }
      if (clean.includes('month')) {
        return val * 30;
      }
      return val;
    }
  }

  throw new Error(`Unable to parse delivery timeline "${deliveryTime}" into numeric days`);
}

/**
 * Validates weights configuration:
 * - Must contain rating, price, and deliveryTime
 * - All weights must be non-negative and finite
 * - Sum must equal 1.0 within floating point tolerance
 */
export function validateWeights(weights = DEFAULT_MCDM_WEIGHTS) {
  if (!weights || typeof weights !== 'object') {
    throw new Error('Weights configuration must be an object');
  }

  const { rating: w1, price: w2, deliveryTime: w3 } = weights;

  if (typeof w1 !== 'number' || !Number.isFinite(w1) || w1 < 0) {
    throw new Error(`Invalid rating weight: ${w1}. Must be a non-negative finite number.`);
  }
  if (typeof w2 !== 'number' || !Number.isFinite(w2) || w2 < 0) {
    throw new Error(`Invalid price weight: ${w2}. Must be a non-negative finite number.`);
  }
  if (typeof w3 !== 'number' || !Number.isFinite(w3) || w3 < 0) {
    throw new Error(`Invalid deliveryTime weight: ${w3}. Must be a non-negative finite number.`);
  }

  const sum = w1 + w2 + w3;
  if (Math.abs(sum - 1.0) > FLOAT_TOLERANCE) {
    throw new Error(
      `MCDM weights must sum to 1.0 (received sum: ${sum.toFixed(6)} from w1=${w1}, w2=${w2}, w3=${w3})`
    );
  }

  return true;
}

/**
 * Validates candidate pitch data before computing scores.
 * Rejects missing, NaN, infinite, or negative values.
 */
export function validateCandidateOffer(offer, index = 0) {
  if (!offer || typeof offer !== 'object') {
    throw new Error(`Candidate offer at index ${index} must be an object`);
  }

  // 1. Rating validation (R)
  const rating = offer.sellerTrustScore ?? offer.sellerRating ?? offer.rating ?? 5.0;
  const numRating = Number(rating);
  if (isNaN(numRating) || !Number.isFinite(numRating) || numRating < 0 || numRating > 5.0) {
    throw new Error(`Invalid seller rating for offer ID "${offer.id || index}": ${rating}. Must be between 0.0 and 5.0`);
  }

  // 2. Price validation (P)
  const price = offer.offerPrice ?? offer.price;
  const numPrice = Number(price);
  if (isNaN(numPrice) || !Number.isFinite(numPrice) || numPrice <= 0) {
    throw new Error(`Invalid offer price for offer ID "${offer.id || index}": ${price}. Must be a finite positive number.`);
  }

  // 3. Delivery time validation (T)
  const deliveryRaw = offer.deliveryTime ?? offer.deliveryDays ?? offer.delivery;
  const deliveryDays = parseDeliveryTimeToDays(deliveryRaw);

  return {
    rating: numRating,
    price: numPrice,
    deliveryDays
  };
}

/**
 * Computes Min-Max Normalized MCDM Scores for a comparison set of offers.
 * 
 * @param {Array<Object>} offers List of pitches/offers competing for a requirement
 * @param {Object} customWeights Optional custom weights configuration
 * @returns {Array<Object>} Enriched offers with normalized attributes, final scores, and ranks
 */
export function calculateMCDMScores(offers, customWeights = DEFAULT_MCDM_WEIGHTS) {
  if (!Array.isArray(offers)) {
    throw new Error('Candidate offers must be an array');
  }

  if (offers.length === 0) {
    return [];
  }

  // Validate weights
  validateWeights(customWeights);
  const { rating: w1, price: w2, deliveryTime: w3 } = customWeights;

  // Validate and extract numeric criteria for all candidates
  const validatedCandidates = offers.map((offer, idx) => ({
    original: offer,
    parsed: validateCandidateOffer(offer, idx)
  }));

  // Determine comparison set bounds
  let minRating = Infinity, maxRating = -Infinity;
  let minPrice = Infinity, maxPrice = -Infinity;
  let minDelivery = Infinity, maxDelivery = -Infinity;

  for (const { parsed } of validatedCandidates) {
    if (parsed.rating < minRating) minRating = parsed.rating;
    if (parsed.rating > maxRating) maxRating = parsed.rating;

    if (parsed.price < minPrice) minPrice = parsed.price;
    if (parsed.price > maxPrice) maxPrice = parsed.price;

    if (parsed.deliveryDays < minDelivery) minDelivery = parsed.deliveryDays;
    if (parsed.deliveryDays > maxDelivery) maxDelivery = parsed.deliveryDays;
  }

  // Calculate normalized attributes and final score for each offer
  const scoredOffers = validatedCandidates.map(({ original, parsed }) => {
    // 1. Rating Normalization: Benefit Criterion (Higher is better)
    // Rn = (R - Rmin) / (Rmax - Rmin)
    let Rn;
    if (Math.abs(maxRating - minRating) < FLOAT_TOLERANCE) {
      Rn = NEUTRAL_NORMALIZED_VALUE; // All candidates have the same rating
    } else {
      Rn = (parsed.rating - minRating) / (maxRating - minRating);
    }
    // Clamp to [0, 1] to prevent floating point inaccuracies
    Rn = Math.max(0, Math.min(1, Rn));

    // 2. Price Normalization: Cost Criterion (Lower is better)
    // Pn = (Pmax - P) / (Pmax - Pmin)
    let Pn;
    if (Math.abs(maxPrice - minPrice) < FLOAT_TOLERANCE) {
      Pn = NEUTRAL_NORMALIZED_VALUE; // All candidates have the same price
    } else {
      Pn = (maxPrice - parsed.price) / (maxPrice - minPrice);
    }
    Pn = Math.max(0, Math.min(1, Pn));

    // 3. Delivery Time Normalization: Cost Criterion (Shorter is better)
    // Tn = (Tmax - T) / (Tmax - Tmin)
    let Tn;
    if (Math.abs(maxDelivery - minDelivery) < FLOAT_TOLERANCE) {
      Tn = NEUTRAL_NORMALIZED_VALUE; // All candidates have the same delivery time
    } else {
      Tn = (maxDelivery - parsed.deliveryDays) / (maxDelivery - minDelivery);
    }
    Tn = Math.max(0, Math.min(1, Tn));

    // Final Linear Min-Max MCDM Score: S = w1 * Rn + w2 * Pn + w3 * Tn
    const score = Number((w1 * Rn + w2 * Pn + w3 * Tn).toFixed(4));
    const scorePercentage = Math.round(score * 100);

    return {
      ...original,
      mcdm: {
        score,
        scorePercentage,
        normalized: {
          rating: Number(Rn.toFixed(4)),
          price: Number(Pn.toFixed(4)),
          deliveryTime: Number(Tn.toFixed(4))
        },
        criteria: {
          rating: parsed.rating,
          price: parsed.price,
          deliveryDays: parsed.deliveryDays
        },
        weights: { w1, w2, w3 }
      }
    };
  });

  // Sort descending by MCDM score (highest score = rank 1)
  scoredOffers.sort((a, b) => b.mcdm.score - a.mcdm.score);

  // Assign ranks
  scoredOffers.forEach((item, index) => {
    item.mcdm.rank = index + 1;
    item.mcdm.isTopRecommendation = index === 0;
  });

  return scoredOffers;
}

export const mcdmScoringService = {
  calculateMCDMScores,
  validateWeights,
  validateCandidateOffer,
  parseDeliveryTimeToDays,
  DEFAULT_MCDM_WEIGHTS
};
