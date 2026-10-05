import React, { useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from './Badge';
import { Button } from './Button';
import { 
  X, 
  Home, 
  HelpCircle, 
  Tag, 
  Info, 
  FileText, 
  Shield, 
  LogIn, 
  LogOut, 
  LayoutDashboard, 
  ListPlus, 
  Layers, 
  Inbox, 
  Handshake, 
  MessageSquare, 
  User, 
  Search, 
  Send, 
  Users, 
  Flag,
  Settings
} from 'lucide-react';

export const MobileNavDrawer = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const role = userProfile?.role || 'buyer';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Logged out successfully.');
      onClose();
      navigate('/');
    } catch {
      toast.error('Failed to log out.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-start'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '85%',
          maxWidth: '320px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '4px 0 16px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E5E9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC'
          }}
        >
          <div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#1F2933' }}>
              Need Connect
            </div>
            <div style={{ fontSize: '11.5px', color: '#667085' }}>
              Reverse Marketplace
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#667085',
              padding: '6px',
              display: 'flex',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info if authenticated */}
        {isAuthenticated && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E5E9', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={userProfile?.name || 'User'}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EBF2FC', color: '#2457A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {(userProfile?.name || currentUser?.displayName || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1F2933' }}>
                  {userProfile?.name || currentUser?.displayName || 'User'}
                </div>
                <Badge variant={userProfile?.role || 'info'} size="sm">
                  {userProfile?.role || 'User'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9AA5B1', padding: '6px 12px' }}>
            {isAuthenticated ? `${role.toUpperCase()} MENU` : 'MAIN MENU'}
          </div>

          {/* Role specific links if authenticated */}
          {isAuthenticated ? (
            <>
              {role === 'buyer' && (
                <>
                  <NavLink to="/buyer" end onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <LayoutDashboard size={18} /> <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/buyer/requirements/new" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <ListPlus size={18} /> <span>Post a Requirement</span>
                  </NavLink>
                  <NavLink to="/buyer/requirements" end onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Layers size={18} /> <span>My Requirements</span>
                  </NavLink>
                  <NavLink to="/buyer/offers" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Inbox size={18} /> <span>Offers Received</span>
                  </NavLink>
                  <NavLink to="/buyer/deals" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Handshake size={18} /> <span>Deals & Orders</span>
                  </NavLink>
                  <NavLink to="/buyer/messages" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <MessageSquare size={18} /> <span>Messages</span>
                  </NavLink>
                  <NavLink to="/buyer/profile" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <User size={18} /> <span>Profile</span>
                  </NavLink>
                </>
              )}

              {role === 'seller' && (
                <>
                  <NavLink to="/seller" end onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <LayoutDashboard size={18} /> <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/seller/requirements" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Search size={18} /> <span>Browse Requirements</span>
                  </NavLink>
                  <NavLink to="/seller/pitches" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Send size={18} /> <span>My Pitches</span>
                  </NavLink>
                  <NavLink to="/seller/deals" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Handshake size={18} /> <span>Accepted Deals</span>
                  </NavLink>
                  <NavLink to="/seller/messages" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <MessageSquare size={18} /> <span>Messages</span>
                  </NavLink>
                  <NavLink to="/seller/profile" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <User size={18} /> <span>Profile</span>
                  </NavLink>
                </>
              )}

              {role === 'admin' && (
                <>
                  <NavLink to="/admin" end onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <LayoutDashboard size={18} /> <span>Overview</span>
                  </NavLink>
                  <NavLink to="/admin/users" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Users size={18} /> <span>Users</span>
                  </NavLink>
                  <NavLink to="/admin/requirements" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Layers size={18} /> <span>Requirements</span>
                  </NavLink>
                  <NavLink to="/admin/pitches" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Send size={18} /> <span>Pitches</span>
                  </NavLink>
                  <NavLink to="/admin/categories" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Tag size={18} /> <span>Categories</span>
                  </NavLink>
                  <NavLink to="/admin/reports" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Flag size={18} /> <span>Reports & Flags</span>
                  </NavLink>
                  <NavLink to="/admin/settings" onClick={onClose} className="drawer-link" style={getNavLinkStyle}>
                    <Settings size={18} /> <span>Settings</span>
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/" onClick={onClose} style={staticLinkStyle}>
                <Home size={18} /> <span>Home</span>
              </Link>
              <Link to="/how-it-works" onClick={onClose} style={staticLinkStyle}>
                <HelpCircle size={18} /> <span>How It Works</span>
              </Link>
              <Link to="/categories" onClick={onClose} style={staticLinkStyle}>
                <Tag size={18} /> <span>Categories</span>
              </Link>
              <Link to="/about" onClick={onClose} style={staticLinkStyle}>
                <Info size={18} /> <span>About</span>
              </Link>
            </>
          )}

          <div style={{ borderTop: '1px solid #E2E5E9', margin: '8px 0', paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9AA5B1', padding: '6px 12px' }}>
              LEGAL & INFORMATION
            </div>
            <Link to="/terms" onClick={onClose} style={staticLinkStyle}>
              <FileText size={18} /> <span>Terms & Conditions</span>
            </Link>
            <Link to="/privacy" onClick={onClose} style={staticLinkStyle}>
              <Shield size={18} /> <span>Privacy Policy</span>
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px', borderTop: '1px solid #E2E5E9', backgroundColor: '#F8FAFC' }}>
          {isAuthenticated ? (
            <Button
              variant="danger"
              size="md"
              icon={LogOut}
              onClick={handleLogout}
              style={{ width: '100%' }}
            >
              Sign Out
            </Button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant="primary"
                size="md"
                icon={LogIn}
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                style={{ width: '100%' }}
              >
                Log In / Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getNavLinkStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  borderRadius: '6px',
  fontSize: '13.5px',
  fontWeight: isActive ? 600 : 500,
  color: isActive ? '#2457A6' : '#334155',
  backgroundColor: isActive ? '#EBF2FC' : 'transparent',
  textDecoration: 'none'
});

const staticLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  borderRadius: '6px',
  fontSize: '13.5px',
  fontWeight: 500,
  color: '#334155',
  textDecoration: 'none'
};
