import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { MobileNavDrawer } from '../components/common/MobileNavDrawer';
import { LogIn, LayoutDashboard, Menu } from 'lucide-react';

export const PublicLayout = () => {
  const { currentUser, userProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      const role = userProfile?.role || 'buyer';
      navigate(`/${role}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F7F5' }}>
      {/* Public Header */}
      <header
        style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E5E9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(true)}
            title="Open Navigation"
          >
            <Menu size={22} />
          </button>

          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#1F2933', letterSpacing: '-0.3px' }}>
              Need Connect
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" style={{ color: '#4B5563', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}>
            Home
          </Link>
          <a href="/#how-it-works" style={{ color: '#4B5563', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}>
            How It Works
          </a>
          <a href="/#categories" style={{ color: '#4B5563', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}>
            Categories
          </a>
          <a href="/#about" style={{ color: '#4B5563', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}>
            About
          </a>
          <Link to="/terms" style={{ color: '#4B5563', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}>
            Terms
          </Link>
          <Link to="/privacy" style={{ color: '#4B5563', fontSize: '13.5px', fontWeight: 500, textDecoration: 'none' }}>
            Privacy
          </Link>

          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              icon={LayoutDashboard}
              onClick={handleAuthAction}
            >
              Dashboard
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login?tab=register')}
              >
                Get Started
              </Button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Page Body */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E5E9',
          padding: '48px 24px 32px',
          marginTop: 'auto',
          fontSize: '13px',
          color: '#667085'
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '36px' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1F2933', fontSize: '17px', marginBottom: '8px' }}>
                Need Connect
              </div>
              <p style={{ fontSize: '13px', color: '#667085', lineHeight: 1.5, margin: 0 }}>
                Post what you need. Let sellers come to you. A reverse marketplace connecting buyer demand with competitive local sellers.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#1F2933', fontSize: '14px', marginBottom: '12px' }}>
                Explore
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/" style={{ color: '#667085', textDecoration: 'none' }}>Home</Link></li>
                <li><a href="/#how-it-works" style={{ color: '#667085', textDecoration: 'none' }}>How It Works</a></li>
                <li><a href="/#categories" style={{ color: '#667085', textDecoration: 'none' }}>Categories</a></li>
                <li><a href="/#about" style={{ color: '#667085', textDecoration: 'none' }}>About Model</a></li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#1F2933', fontSize: '14px', marginBottom: '12px' }}>
                Account & Access
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/login" style={{ color: '#667085', textDecoration: 'none' }}>Buyer Login</Link></li>
                <li><Link to="/seller" style={{ color: '#667085', textDecoration: 'none' }}>Seller Workspace</Link></li>
                <li><Link to="/admin" style={{ color: '#667085', textDecoration: 'none' }}>Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#1F2933', fontSize: '14px', marginBottom: '12px' }}>
                Legal
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/terms" style={{ color: '#667085', textDecoration: 'none' }}>Terms & Conditions</Link></li>
                <li><Link to="/privacy" style={{ color: '#667085', textDecoration: 'none' }}>Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E5E9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12.5px' }}>
            <div>
              Copyright © 2026 Need Connect. All rights reserved.
            </div>
            <div>
              Post what you need. Let sellers come to you.
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
};
