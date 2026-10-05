import React from 'react';
import { Link } from 'react-router-dom';

export const TermsPage = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E5E9', borderRadius: '8px', padding: '36px 32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>
          Terms & Conditions
        </h1>
        <div style={{ fontSize: '13px', color: '#667085', marginBottom: '24px', borderBottom: '1px solid #E2E5E9', paddingBottom: '16px' }}>
          Last Updated: October 2026 • Need Connect Platform
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>1. Acceptance of Terms</h3>
            <p>
              By accessing, registering, or utilizing the <strong>Need Connect</strong> platform ("Platform"), you acknowledge and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>2. Account Registration</h3>
            <p>
              Users may register and authenticate using Google authentication or verified email credentials. You are responsible for maintaining the confidentiality of your account credentials and for all actions taken under your account.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>3. Buyer Responsibilities</h3>
            <p>
              Buyers must post accurate, legitimate requirements with genuine budget expectations and timelines. Posting duplicate, fictitious, or spam requirements is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>4. Seller Responsibilities</h3>
            <p>
              Sellers must provide truthful representations of goods and services in their pitches, including honest descriptions of item condition, accurate delivery estimates, and authentic pricing.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>5. Requirement Posts</h3>
            <p>
              All requirements must be categorized accurately under an active platform category. Need Connect reserves the right to remove requirements deemed unlawful, infringing, or irrelevant.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>6. Offers and Pitches</h3>
            <p>
              Submitting an offer signifies a genuine intent to supply the requested product or service under the specified terms. To maintain quality, sellers are limited to one active proposal per requirement.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>7. Communication</h3>
            <p>
              Direct messaging channels are activated between matched parties once a buyer formally accepts a seller's pitch. Abusive language, harassment, or fraudulent solicitation is grounds for account termination.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>8. Prohibited Activities</h3>
            <p>
              Users shall not post illicit goods, hazardous materials, pirated intellectual property, or counterfeit items. Fraudulent or manipulative bidding is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>9. User Content</h3>
            <p>
              You retain ownership of any specifications, descriptions, and media you submit. By uploading content, you grant Need Connect a non-exclusive license to display the content to potential transaction participants.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>10. Transactions</h3>
            <p>
              Need Connect functions as an introductory reverse marketplace. Product inspection, final payment terms, and physical handover take place directly between the buyer and seller.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>11. Reviews and Ratings</h3>
            <p>
              Buyers may leave numerical ratings (1–5 stars) and reviews following deal conclusion. Feedback must reflect genuine transaction experiences.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>12. Account Suspension</h3>
            <p>
              Need Connect reserves the right to suspend or disable accounts that violate community rules, terms of service, or generate repeated user complaints.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>13. Limitation of Liability</h3>
            <p>
              Need Connect provides the platform on an "AS IS" basis. The platform does not guarantee the quality, safety, or legality of items pitched by sellers or requirements posted by buyers.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>14. Modifications to Terms</h3>
            <p>
              We reserve the right to revise these Terms and Conditions at any time. Continued use of the platform after updates indicates acceptance of revised terms.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>15. Contact Us</h3>
            <p>
              For inquiries regarding these Terms and Conditions, please contact us at <code>support@needconnect.com</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
