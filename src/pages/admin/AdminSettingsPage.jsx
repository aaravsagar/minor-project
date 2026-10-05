import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ADMIN_EMAILS } from '../../firebase/adminConfig';
import { seedDemoData } from '../../firebase/seedDemoData';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Settings, Database, RefreshCw, Shield, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoData(true);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

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

      {/* Database Maintenance Tools */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '6px' }}>Data Synchronization</h3>
        <p className="card-subtitle" style={{ marginBottom: '16px' }}>
          Reset or re-seed marketplace categories and example records directly in Firestore.
        </p>

        <Button
          variant="secondary"
          icon={Database}
          onClick={handleSeedData}
          loading={seeding}
        >
          Re-seed Marketplace Demo Data
        </Button>
      </div>
    </div>
  );
};
