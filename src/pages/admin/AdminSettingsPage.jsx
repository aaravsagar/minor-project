import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAILS } from '../../firebase/adminConfig';
import { Badge } from '../../components/common/Badge';
import { Settings, Shield, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { currentUser } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings & Configuration</h1>
          <p className="page-description">
            System configuration, administrator access list, and database maintenance tools.
          </p>
        </div>
      </div>

      {/* Platform Status Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-title" style={{ marginBottom: '14px' }}>System Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E5E9' }}>
            <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>Database Engine</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginTop: '2px' }}>Cloud Firestore</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#287D3C', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#287D3C' }} /> Operational
            </div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E5E9' }}>
            <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>Authentication Service</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginTop: '2px' }}>Google OAuth & Email</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#287D3C', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#287D3C' }} /> Active
            </div>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '6px', border: '1px solid #E2E5E9' }}>
            <div style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase' }}>Realtime Messaging</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginTop: '2px' }}>Firestore Listeners</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#287D3C', fontSize: '12px', marginTop: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#287D3C' }} /> Synchronized
            </div>
          </div>
        </div>
      </div>

      {/* Admin Email List */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="card-title" style={{ marginBottom: '6px' }}>Authorized Administrator Accounts</h3>
        <p className="card-subtitle" style={{ marginBottom: '16px' }}>
          Users authenticating with any of these email addresses automatically receive administrative access rights.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ADMIN_EMAILS.map((email) => (
            <div
              key={email}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px solid #E2E5E9',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: '#1F2933' }}>
                <Shield size={16} color="#2457A6" />
                {email}
              </div>
              <Badge variant="admin">Authorized Admin</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Category Configuration Info */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '6px' }}>Category Price Limits</h3>
        <p className="card-subtitle" style={{ marginBottom: '16px' }}>
          All categories have enforced minimum and maximum price limits. Requirements submitted outside
          these bounds are rejected at both the frontend and backend validation layers.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { name: 'Books', min: '₹50', max: '₹50,000' },
            { name: 'Stationery & Office', min: '₹30', max: '₹50,000' },
            { name: 'Groceries & Food', min: '₹50', max: '₹50,000' },
            { name: 'Beauty & Personal Care', min: '₹50', max: '₹50,000' },
            { name: 'Fashion', min: '₹150', max: '₹1,00,000' },
            { name: 'Sports & Fitness', min: '₹100', max: '₹2,00,000' },
            { name: 'Toys & Games', min: '₹100', max: '₹1,00,000' },
            { name: 'Electronics', min: '₹300', max: '₹5,00,000' },
            { name: 'Services', min: '₹200', max: '₹5,00,000' },
            { name: 'Furniture', min: '₹500', max: '₹3,00,000' },
            { name: 'Mobile Phones', min: '₹1,000', max: '₹3,00,000' },
            { name: 'Home Appliances', min: '₹1,000', max: '₹3,00,000' },
            { name: 'Laptops', min: '₹5,000', max: '₹5,00,000' },
            { name: 'Vehicles', min: '₹2,000', max: '₹50,00,000' }
          ].map(cat => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E5E9', fontSize: '13px' }}>
              <span style={{ fontWeight: 500, color: '#1F2933' }}>{cat.name}</span>
              <span style={{ color: '#667085' }}>Min: <strong style={{ color: '#287D3C' }}>{cat.min}</strong> &nbsp;·&nbsp; Max: <strong style={{ color: '#2457A6' }}>{cat.max}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
