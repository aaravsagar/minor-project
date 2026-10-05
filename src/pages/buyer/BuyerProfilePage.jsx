import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { Input } from '../../components/common/FormControls';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { User, Save, ArrowRightLeft, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

export const BuyerProfilePage = () => {
  const { currentUser, userProfile, refreshProfile, switchRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [location, setLocation] = useState(userProfile?.location || 'Ahmedabad');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      await userService.updateProfile(currentUser.uid, {
        name: name.trim(),
        location: location.trim(),
        phone: phone.trim()
      });
      await refreshProfile();
      toast.success('Buyer profile updated successfully in Firestore.');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToSeller = async () => {
    try {
      setSwitching(true);
      await switchRole('seller');
      toast.success('Switched to Seller Workspace!');
      navigate('/seller');
    } catch (err) {
      toast.error('Could not switch role.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Buyer Profile</h1>
          <p className="page-description">
            Manage your personal profile details and contact preferences.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E2E5E9' }}>
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Avatar"
              style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #E2E5E9' }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#EBF2FC',
                color: '#2457A6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700
              }}
            >
              {(userProfile?.name || 'U')[0]}
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2933', margin: 0 }}>
              {userProfile?.name || currentUser?.displayName || 'User'}
            </h2>
            <div style={{ fontSize: '13px', color: '#667085', marginTop: '2px' }}>
              {currentUser?.email}
            </div>
            <div style={{ marginTop: '6px' }}>
              <Badge variant="buyer">Buyer Account</Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid-2">
            <Input
              label="Location / City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98980 00000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Google Account Email</label>
            <input
              type="text"
              value={currentUser?.email || ''}
              disabled
              className="form-control"
            />
            <div className="form-hint">Authenticated securely via Google Provider.</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button type="submit" variant="primary" icon={Save} loading={loading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Role Switching Utility */}
      <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: '#1F2933', margin: 0 }}>
              Switch Workspace
            </h4>
            <p style={{ fontSize: '12.5px', color: '#667085', margin: '3px 0 0 0' }}>
              Switch between Buyer and Seller workspaces anytime.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRightLeft}
            onClick={handleSwitchToSeller}
            loading={switching}
          >
            Switch to Seller Workspace
          </Button>
        </div>
      </div>
    </div>
  );
};
