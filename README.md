# Need Connect

> **Tagline:** *"Post what you need. Let sellers come to you."*

Need Connect is a reverse marketplace web application where buyers post what they need and sellers respond with competitive, relevant offers.

---

## 1. Concept & Workflow

Traditional online marketplaces operate on a supply-driven model where sellers post listings and buyers must endlessly browse and message individuals.

**Need Connect** is demand-driven:
1. **Post Your Need:** Buyer describes the desired product or service, target budget (in ₹), location, and urgency.
2. **Receive Offers:** Verified local sellers review active demand and submit competitive proposals with pricing, condition, and delivery times.
3. **Compare & Choose:** Buyer compares incoming pitches side-by-side on price, product condition, and seller trust scores.
4. **Deal Lock & Chat:** When the buyer accepts an offer, the requirement is marked as **FULFILLED**, other competing offers are closed, and a secure 1-to-1 real-time messaging channel opens.
5. **Verified Reviews:** After deal completion, buyers submit ratings and feedback, dynamically updating the seller's trust score.

---

## 2. Authentication & Credentials

The platform supports **Google OAuth** and **Email / Password** authentication backed by real Firebase Authentication.

### Demo Accounts for Testing

| Role | Username / Email | Password | Access URL |
|---|---|---|---|
| **Seller** | `seller` *(or `seller@needconnect.demo`)* | `password123` | [`/seller`](http://localhost:5173/seller) |
| **Admin** | `admin` *(or `admin@needconnect.demo`)* | `password123` | [`/admin`](http://localhost:5173/admin) |
| **Buyer** | Any registered email or Google login | User-defined | [`/buyer`](http://localhost:5173/buyer) |

---

## 3. Application Route Map

### Public Routes
- `/` — Landing Page (Hero, How It Works, Categories, About, Live Demands)
- `/how-it-works` — How It Works section
- `/categories` — Marketplace Categories
- `/about` — About Need Connect
- `/login` — Sign In / Create Account / Demo Access
- `/register` — Account Registration
- `/terms` — Terms & Conditions (15 sections)
- `/privacy` — Privacy Policy (15 sections)

### Buyer Workspace (`/buyer/*`)
- `/buyer` — Buyer Dashboard
- `/buyer/requirements` — My Requirements listing & status management
- `/buyer/requirements/new` — Post a new requirement
- `/buyer/requirements/:id` — Side-by-side pitch comparison & offer acceptance
- `/buyer/offers` — Offers Received comparison view
- `/buyer/deals` — Concluded deals, order handover & review submission
- `/buyer/messages` — 1-to-1 Real-time chat with sellers
- `/buyer/profile` — Profile settings & workspace switcher

### Seller Workspace (`/seller/*`)
- `/seller` — Seller Dashboard
- `/seller/requirements` — Browse active buyer demands with filters & "Good Match" tags
- `/seller/pitches` — My submitted proposals
- `/seller/deals` — Won deals & handover coordination
- `/seller/messages` — 1-to-1 Real-time chat with buyers
- `/seller/profile` — Categories handled, reviews & trust score

### Administrator Portal (`/admin/*`)
- `/admin` — System Overview & live platform metrics
- `/admin/users` — User directory, role modification & suspension
- `/admin/requirements` — Demand moderation
- `/admin/pitches` — Proposal audit trail
- `/admin/categories` — Dynamic Firestore category management (Create, Edit, Toggle)
- `/admin/reports` — Moderation flags & resolution
- `/admin/settings` — Platform configuration, authorized admin emails & data seeder

---

## 4. Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 5. Firebase Collections Schema

- `users` — User profiles, roles, locations, trust scores, and categories
- `categories` — Dynamically managed marketplace categories
- `requirements` — Buyer posts with budgets, specifications, and statuses (`active`, `fulfilled`, `closed`)
- `pitches` — Seller quotes with pricing, item condition, delivery timeline, and statuses (`pending`, `accepted`, `rejected`)
- `deals` — Concluded matches linking requirement, buyer, and seller
- `conversations` — Matched 1-to-1 conversation threads
- `conversations/{id}/messages` — Real-time messages with timestamps
- `reviews` — Verified deal feedback and star ratings
- `reports` — Moderation reports and flags
- `_system` — Database initialization metadata
