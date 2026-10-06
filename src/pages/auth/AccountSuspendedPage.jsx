import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ShieldAlert, LogOut, Mail, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AccountSuspendedPage = () => {
  const { userProfile, currentUser, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const handleCheckStatus = async () => {
    try {
      const refreshed = await refreshProfile();
      if (refreshed && refreshed.status !== 'suspended' && !refreshed.accessRevoked) {
        toast.success('Your account has been reactivated! Redirecting...');
        navigate(`/${refreshed.role || 'buyer'}`);
      } else {
        toast.info('Account remains suspended. Please contact administrator.');
      }
    } catch (err) {
      toast.error('Could not check status: ' + err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: '#F7F7F5'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #FECDCA',
          borderRadius: '12px',
          padding: '36px 30px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(180, 35, 24, 0.08)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF3F2',
            color: '#B42318',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid #FECDCA'
          }}
        >
          <ShieldAlert size={34} />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <Badge variant="danger" size="md">Account Suspended</Badge>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>
          Access Suspended by Administrator
        </h1>

        <p style={{ fontSize: '13.5px', color: '#667085', lineHeight: 1.5, marginBottom: '20px' }}>
          Your account for <strong>{userProfile?.email || currentUser?.email}</strong> has been suspended or has had access revoked by platform administration.
        </p>

        {/* Reason card */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E5E9',
            borderRadius: '8px',
            padding: '14px 18px',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '13px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase', marginBottom: '4px' }}>
            Administrative Notice
          </div>
          <div style={{ color: '#1F2933', fontWeight: 500 }}>
            {userProfile?.suspendedReason || userProfile?.revokeReason || 'Account suspended pending administrative review or policy violation.'}
          </div>
          {userProfile?.suspendedAt && (
            <div style={{ fontSize: '11.5px', color: '#9AA5B1', marginTop: '6px' }}>
              Action recorded on: {formatDate(userProfile.suspendedAt, true)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            variant="primary"
            icon={RefreshCw}
            size="md"
            onClick={handleCheckStatus}
            style={{ width: '100%' }}
          >
            Check Account Reactivation Status
          </Button>

          <a
            href="mailto:admin@needconnect.com?subject=Account%20Suspension%20Appeal"
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant="secondary"
              icon={Mail}
              size="md"
              style={{ width: '100%' }}
            >
              Contact Platform Administrator
            </Button>
          </a>

          <Button
            variant="ghost"
            icon={LogOut}
            size="sm"
            onClick={handleLogout}
            style={{ color: '#B42318', width: '100%', marginTop: '4px' }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
