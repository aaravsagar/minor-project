import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AccessDeniedPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    const role = userProfile?.role || 'buyer';
    navigate(`/${role}`);
  };

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
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E5E9',
          borderRadius: '8px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FEF3F2',
            color: '#B42318',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <ShieldAlert size={30} />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2933', marginBottom: '8px' }}>
          Access Denied
        </h1>
        <p style={{ fontSize: '13.5px', color: '#667085', marginBottom: '24px', lineHeight: 1.4 }}>
          You do not have permission to view this section. Role restrictions prevent buyers from accessing seller pages, and vice-versa.
        </p>
        <Button variant="primary" icon={ArrowLeft} onClick={handleBackToDashboard}>
          Return to Your Dashboard
        </Button>
      </div>
    </div>
  );
};
