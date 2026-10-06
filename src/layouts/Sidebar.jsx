import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LayoutDashboard, 
  ListPlus, 
  Layers, 
  Inbox, 
  MessageSquare, 
  User, 
  FileText, 
  Shield, 
  LogOut, 
  Search, 
  Send, 
  Handshake, 
  Users, 
  Tag, 
  Flag,
  Settings,
  TrendingUp
} from 'lucide-react';

export const Sidebar = () => {
  const { userProfile, logout } = useAuth();
  const role = userProfile?.role || 'buyer';
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Signed out successfully.');
      navigate('/');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
        { to: '/admin/metrics', icon: TrendingUp, label: 'Analytics & Metrics' },
        { to: '/admin/users', icon: Users, label: 'Users & Credentials' },
        { to: '/admin/requirements', icon: Layers, label: 'Requirements' },
        { to: '/admin/pitches', icon: Send, label: 'Pitches' },
        { to: '/admin/categories', icon: Tag, label: 'Categories' },
        { to: '/admin/reports', icon: Flag, label: 'Reports' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' }
      ];
    }

    if (role === 'seller') {
      return [
        { to: '/seller', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/seller/requirements', icon: Search, label: 'Browse Requirements' },
        { to: '/seller/pitches', icon: Send, label: 'My Pitches' },
        { to: '/seller/deals', icon: Handshake, label: 'Accepted Deals' },
        { to: '/seller/messages', icon: MessageSquare, label: 'Messages' },
        { to: '/seller/profile', icon: User, label: 'Profile' }
      ];
    }

    // Default: Buyer
    return [
      { to: '/buyer', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/buyer/requirements/new', icon: ListPlus, label: 'Post a Requirement' },
      { to: '/buyer/requirements', icon: Layers, label: 'My Requirements', end: true },
      { to: '/buyer/offers', icon: Inbox, label: 'Offers Received' },
      { to: '/buyer/deals', icon: Handshake, label: 'Deals & Orders' },
      { to: '/buyer/messages', icon: MessageSquare, label: 'Messages' },
      { to: '/buyer/profile', icon: User, label: 'Profile' }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside
      className="sidebar-desktop"
      style={{
        width: '240px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E5E9',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: '60px',
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        zIndex: 90
      }}
    >
      <div style={{ padding: '16px 14px', borderBottom: '1px solid #E2E5E9' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#667085', fontWeight: 600 }}>
          {role.toUpperCase()} WORKSPACE
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2457A6' : '#4B5563',
                backgroundColor: isActive ? '#EBF2FC' : 'transparent',
                textDecoration: 'none',
                transition: 'background-color 0.12s ease'
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Legal & Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #E2E5E9', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <NavLink
          to="/terms"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            color: '#667085',
            textDecoration: 'none'
          }}
        >
          <FileText size={16} />
          <span>Terms & Conditions</span>
        </NavLink>

        <NavLink
          to="/privacy"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            color: '#667085',
            textDecoration: 'none'
          }}
        >
          <Shield size={16} />
          <span>Privacy Policy</span>
        </NavLink>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12.5px',
            color: '#B42318',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
