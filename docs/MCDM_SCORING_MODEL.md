# Multi-Criteria Decision-Making (MCDM) Scoring Model

## 1. Overview & Mathematical Formulation

In **Need Connect**, incoming seller offers are evaluated using a Multi-Criteria Decision-Making (MCDM) scoring engine with **Min-Max Normalization**. 

Traditional marketplace linear equations combine attributes of disparate scales (e.g., ratings in [1, 5], prices in ₹ thousands, delivery times in days), allowing price to dominate the ranking disproportionately. The Min-Max normalized MCDM model eliminates scale distortions by mapping every criterion into a dimensionless interval $[0, 1]$ before computing the weighted score:

$$S = w_1 R_n + w_2 P_n + w_3 T_n$$

---

## 2. Criterion Definitions and Normalization Equations

### A. Seller Reputation & Trust Score ($R$) — Benefit Criterion
Higher ratings represent higher trustworthiness. Normalized rating $R_n$ improves monotonically with $R$:

$$R_n = \frac{R - R_{\min}}{R_{\max} - R_{\min}}$$

- $R$: Seller's verified trust rating / average star rating ($0.0 \le R \le 5.0$).
- $R_{\min}, R_{\max}$: Minimum and maximum seller ratings within the active comparison set of candidate pitches for the requirement.
- **Direction:** $\uparrow R \implies \uparrow R_n \implies \uparrow S$ (Higher rating yields higher score).

### B. Quoted Offer Price ($P$) — Cost Criterion
Buyers prefer competitive, lower prices. Normalized price $P_n$ penalizes higher prices:

$$P_n = \frac{P_{\max} - P}{P_{\max} - P_{\min}}$$

- $P$: Offer price submitted by the seller (in ₹).
- $P_{\min}, P_{\max}$: Lowest and highest offer prices among all competing pitches for the requirement.
- **Direction:** $\downarrow P \implies \uparrow P_n \implies \uparrow S$ (Lower price yields higher score).

### C. Delivery Timeline ($T$) — Cost Criterion
Faster fulfillment and handover is preferred by buyers. Normalized delivery time $T_n$ penalizes longer fulfillment days:

$$T_n = \frac{T_{\max} - T}{T_{\max} - T_{\min}}$$

- $T$: Estimated delivery / handover time expressed in days (parsed from delivery timeline).
- $T_{\min}, T_{\max}$: Shortest and longest delivery durations among the competing pitches.
- **Direction:** $\downarrow T \implies \uparrow T_n \implies \uparrow S$ (Shorter delivery time yields higher score).

---

## 3. Weight Constraints & Default Configuration

The relative importance of each decision criterion is parameterized via configurable weights:

$$w_1 + w_2 + w_3 = 1.0$$

Where all weights are strictly non-negative, finite numbers ($w_i \ge 0$).

### Configured Default Platform Weights

| Symbol | Criterion | Default Weight | Rationale |
|---|---|---|---|
| $w_1$ | Seller Rating / Trust Score | **0.35** | Ensures trusted, highly rated sellers are rewarded. |
| $w_2$ | Quoted Offer Price | **0.45** | Primary marketplace decision driver for buyer savings. |
| $w_3$ | Delivery Timeline (Days) | **0.20** | Rewards prompt fulfillment without overshadowing price. |

---

## 4. Edge Case & Boundary Handling

1. **Uniform Attribute Values ($X_{\max} == X_{\min}$):**
   - If all sellers quote the same price, possess the same rating, or promise identical delivery times, division by zero is strictly avoided.
   - The normalized value defaults to a documented neutral value of **$0.5$** ($X_n = 0.5$).
2. **Single-Offer Scenarios ($N = 1$):**
   - For a single candidate offer, $R_{\max} = R_{\min}$, $P_{\max} = P_{\min}$, and $T_{\max} = T_{\min}$.
   - All criteria normalize to $0.5$, producing a baseline score $S = 0.35(0.5) + 0.45(0.5) + 0.20(0.5) = 0.50$ (50%).
3. **Floating Point Clamping:**
   - Every normalized attribute is clamped to $[0.0, 1.0]$ to guard against micro-precision float rounding errors.
4. **Input Validation:**
   - Candidate offers with missing, negative, NaN, or non-finite values are rejected before score calculation.

---

## 5. Implementation Code Reference

The scoring function is implemented in:
- [`src/services/mcdmScoringService.js`](../src/services/mcdmScoringService.js)
  - `calculateMCDMScores(offers, customWeights)`
  - `validateWeights(weights)`
  - `validateCandidateOffer(offer)`
  - `parseDeliveryTimeToDays(deliveryTime)`
- Consumed by:
  - [`src/services/pitchService.js`](../src/services/pitchService.js) in `getPitchesByRequirement`
  - [`src/pages/buyer/BuyerOffersPage.jsx`](../src/pages/buyer/BuyerOffersPage.jsx) for interactive buyer rank sorting and badge presentation
