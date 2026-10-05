import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { MobileNavDrawer } from '../components/common/MobileNavDrawer';
import { seedDemoData } from '../firebase/seedDemoData';
import { 
  Menu, 
  LogOut, 
  Database, 
  ShieldCheck,
  User,
  ArrowRightLeft
} from 'lucide-react';

export const Header = () => {
  const { currentUser, userProfile, logout, isAuthenticated, isAdmin, setRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out successfully.');
      navigate('/');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoData(true);
      if (res.success) {
        toast.success('Demo data synchronized successfully.');
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Error seeding data: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleQuickRoleSwitch = async (role) => {
    try {
      await setRole(role);
      toast.success(`Switched workspace to ${role.toUpperCase()}`);
      navigate(`/${role}`);
    } catch (err) {
      toast.error('Failed to switch role.');
    }
  };

  return (
    <>
      <header
        style={{
          height: '60px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E5E9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Left: Brand Logo & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileDrawerOpen(true)}
            title="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>

          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1F2933', letterSpacing: '-0.3px' }}>
              Need Connect
            </span>
          </Link>
        </div>

        {/* Right Navigation & Profile (Desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Role Switcher for Developer / Evaluator Testing */}
          {isAuthenticated && (
            <div className="desktop-nav" style={{ gap: '6px' }}>
              {userProfile?.role === 'buyer' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRoleSwitch('seller')}
                  title="Switch to Seller workspace"
                >
                  Switch to Seller
                </Button>
              )}
              {userProfile?.role === 'seller' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRoleSwitch('buyer')}
                  title="Switch to Buyer workspace"
                >
                  Switch to Buyer
                </Button>
              )}
              {isAdmin && userProfile?.role !== 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={ShieldCheck}
                  onClick={() => handleQuickRoleSwitch('admin')}
                >
                  Admin Panel
                </Button>
              )}
            </div>
          )}

          {/* User profile & Sign Out */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={userProfile?.name || 'User'}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E5E9' }}
                  />
                ) : (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#EBF2FC',
                    color: '#2457A6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}>
                    {(userProfile?.name || currentUser?.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="desktop-nav" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2933', lineHeight: 1.2 }}>
                    {userProfile?.name || currentUser?.displayName || 'User'}
                  </span>
                  <div style={{ marginTop: '2px' }}>
                    <Badge variant={userProfile?.role || 'info'} size="sm">
                      {userProfile?.role || 'User'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="desktop-nav">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNavDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </>
  );
};
