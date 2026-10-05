import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/FormControls';
import { ShoppingBag, Store, ArrowRight, CheckCircle2 } from 'lucide-react';

export const OnboardingPage = () => {
  const { currentUser, userProfile, setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState('buyer'); // 'buyer' | 'seller'
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Ahmedabad');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select an option to continue.');
      return;
    }

    try {
      setLoading(true);
      await setRole(selectedRole, {
        phone: phone.trim(),
        location: location.trim() || 'Ahmedabad',
        name: userProfile?.name || currentUser?.displayName || 'User',
        email: currentUser?.email || '',
        photoURL: currentUser?.photoURL || ''
      });

      toast.success(`Welcome to Need Connect!`);
      if (selectedRole === 'seller') {
        navigate('/seller');
      } else {
        navigate('/buyer');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      toast.error('Failed to complete setup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E5E9',
          borderRadius: '8px',
          padding: '32px 28px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1F2933', marginBottom: '6px' }}>
            How will you use Need Connect?
          </h1>
          <p style={{ fontSize: '13.5px', color: '#667085' }}>
            Select how you would like to participate on the platform.
          </p>
        </div>

        <form onSubmit={handleCompleteOnboarding}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {/* Buyer Option */}
            <div
              onClick={() => setSelectedRole('buyer')}
              style={{
                border: `2px solid ${selectedRole === 'buyer' ? '#2457A6' : '#E2E5E9'}`,
                borderRadius: '8px',
                padding: '18px 16px',
                cursor: 'pointer',
                backgroundColor: selectedRole === 'buyer' ? '#F4F7FC' : '#FFFFFF',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#EBF2FC',
                  color: '#2457A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingBag size={20} />
                </div>
                {selectedRole === 'buyer' && <CheckCircle2 size={18} color="#2457A6" />}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '4px' }}>
                I am looking for products / services
              </div>
              <div style={{ fontSize: '12.5px', color: '#667085', lineHeight: 1.35 }}>
                Post what you need, receive competitive offers from sellers, and choose the best deal.
              </div>
            </div>

            {/* Seller Option */}
            <div
              onClick={() => setSelectedRole('seller')}
              style={{
                border: `2px solid ${selectedRole === 'seller' ? '#2457A6' : '#E2E5E9'}`,
                borderRadius: '8px',
                padding: '18px 16px',
                cursor: 'pointer',
                backgroundColor: selectedRole === 'seller' ? '#F4F7FC' : '#FFFFFF',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  backgroundColor: '#EBF6EE',
                  color: '#287D3C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Store size={20} />
                </div>
                {selectedRole === 'seller' && <CheckCircle2 size={18} color="#2457A6" />}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1F2933', marginBottom: '4px' }}>
                I am a seller
              </div>
              <div style={{ fontSize: '12.5px', color: '#667085', lineHeight: 1.35 }}>
                Browse active buyer requirements, pitch competitive offers, and close deals.
              </div>
            </div>
          </div>

          <div className="grid-2">
            <Input
              label="City / Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ahmedabad"
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98980 00000"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={ArrowRight}
            loading={loading}
            style={{ width: '100%', marginTop: '12px' }}
          >
            Continue to {selectedRole === 'seller' ? 'Seller Workspace' : 'Buyer Workspace'}
          </Button>
        </form>
      </div>
    </div>
  );
};
