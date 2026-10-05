import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E5E9',
          borderRadius: '8px',
          padding: '36px 24px'
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: 800, color: '#2457A6', lineHeight: 1, marginBottom: '12px' }}>
          404
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '13.5px', color: '#667085', marginBottom: '20px' }}>
          The page you requested does not exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" icon={Home}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
