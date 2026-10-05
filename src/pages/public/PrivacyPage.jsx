import React from 'react';

export const PrivacyPage = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E5E9', borderRadius: '8px', padding: '36px 32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>
          Privacy Policy
        </h1>
        <div style={{ fontSize: '13px', color: '#667085', marginBottom: '24px', borderBottom: '1px solid #E2E5E9', paddingBottom: '16px' }}>
          Last Updated: October 2026 • Need Connect Platform
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>1. Information We Collect</h3>
            <p>
              Need Connect collects personal information and marketplace listing data to facilitate connections between buyers and sellers on the platform.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>2. Account Information</h3>
            <p>
              When signing in via Google Authentication or registering with an email address, we collect your name, email address, and optional avatar image.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>3. Profile Information</h3>
            <p>
              Users may provide additional profile details such as their primary operational role (Buyer or Seller), contact telephone number, and primary city/area location.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>4. Requirement Information</h3>
            <p>
              When a buyer posts a need, we store the requirement title, description, category, target budget in Indian Rupees (₹), urgency timeline, and optional reference images.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>5. Messages</h3>
            <p>
              Direct 1-on-1 messages exchanged between buyers and sellers following deal acceptance are stored securely to maintain conversation history for transaction coordination.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>6. Reviews and Ratings</h3>
            <p>
              Ratings and written feedback provided after completed deals are stored and used to compute seller trust scores across the platform.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>7. How Information Is Used</h3>
            <p>
              Information is utilized to provide marketplace matching, enable side-by-side pitch comparisons, facilitate realtime messaging, and enforce safety and moderation standards.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>8. Infrastructure Services</h3>
            <p>
              Need Connect utilizes secure cloud infrastructure, including Google Cloud & Firebase Authentication and Cloud Firestore, to deliver secure user sessions and real-time messaging functionality.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>9. Data Security</h3>
            <p>
              We implement industry-standard database security rules and access control policies to safeguard user data from unauthorized access or disclosure.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>10. Data Retention</h3>
            <p>
              Account and transaction records are retained as long as your account remains active on the platform.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>11. Third-Party Services</h3>
            <p>
              Apart from the core cloud authentication and database providers required to operate the service, your personal data is not sold or shared with commercial advertisers.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>12. User Rights</h3>
            <p>
              Users may update their profile information, close active requirements, or request account deletion at any time by contacting support.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>13. Children's Privacy</h3>
            <p>
              Need Connect is intended for individuals of legal age capable of entering into binding marketplace agreements.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>14. Changes to Policy</h3>
            <p>
              We may update this Privacy Policy periodically. Significant changes will be announced on the platform.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '6px' }}>15. Contact Support</h3>
            <p>
              For questions regarding privacy practices, contact us at <code>privacy@needconnect.com</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
