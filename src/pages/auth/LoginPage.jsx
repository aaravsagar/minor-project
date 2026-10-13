import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/FormControls';
import { Modal } from '../../components/common/Modal';
import { LogIn, UserPlus, Key, UserCheck } from 'lucide-react';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, currentUser, userProfile } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('buyer'); // 'buyer' | 'seller'
  const [locationField, setLocationField] = useState('Ahmedabad');
  const [phoneField, setPhoneField] = useState('');

  // Forgot Password Modal
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleRedirectAfterAuth = (profile) => {
    const from = location.state?.from?.pathname;
    if (!profile?.role) {
      navigate('/onboarding');
    } else if (profile.role === 'admin') {
      navigate('/admin');
    } else if (profile.role === 'seller') {
      navigate(from && from.startsWith('/seller') ? from : '/seller');
    } else {
      navigate(from && from.startsWith('/buyer') ? from : '/buyer');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { profile } = await loginWithGoogle();
      toast.success('Signed in successfully with Google!');
      handleRedirectAfterAuth(profile);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google Sign-In failed: ' + (err.message || 'Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password) {
      toast.error('Please enter your credentials.');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) {
        if (!fullName.trim()) {
          toast.error('Please enter your full name.');
          return;
        }
        const { profile } = await registerWithEmail({
          email: emailOrUsername,
          password,
          name: fullName,
          role: selectedRole,
          phone: phoneField,
          location: locationField
        });
        toast.success(`Account created successfully as a ${selectedRole.toUpperCase()}!`);
        handleRedirectAfterAuth(profile);
      } else {
        const { profile } = await loginWithEmail(emailOrUsername, password);
        toast.success('Logged in successfully!');
        handleRedirectAfterAuth(profile);
      }
    } catch (err) {
      console.error('Auth Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        toast.error('Invalid username/email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        toast.error('An account already exists with this email.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else {
        toast.error(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {

    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    try {
      setResetLoading(true);
      await resetPassword(resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setForgotModal(false);
      setResetEmail('');
    } catch (err) {
      toast.error('Failed to send reset email: ' + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E5E9',
          borderRadius: '8px',
          padding: '32px 28px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1F2933', marginBottom: '6px' }}>
            {isRegister ? 'Create an Account' : 'Welcome to Need Connect'}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#667085', lineHeight: 1.4 }}>
            {isRegister
              ? 'Register to post requirements or submit seller offers'
              : 'Sign in to access your requirements, pitches, and active deals'}
          </p>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '10px 16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD2D9',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#1F2933',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            marginBottom: '20px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 20px', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E5E9' }} />
          <span style={{ fontSize: '12px', color: '#9AA5B1', textTransform: 'uppercase', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E5E9' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit}>
          {isRegister && (
            <>
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Mehta"
                required
              />

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">
                  How will you use Need Connect? <span className="required">*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: `1px solid ${selectedRole === 'buyer' ? '#2457A6' : '#E2E5E9'}`,
                      backgroundColor: selectedRole === 'buyer' ? '#EBF2FC' : '#FFFFFF',
                      color: selectedRole === 'buyer' ? '#2457A6' : '#1F2933',
                      fontWeight: selectedRole === 'buyer' ? 600 : 400,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    I am a Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: `1px solid ${selectedRole === 'seller' ? '#2457A6' : '#E2E5E9'}`,
                      backgroundColor: selectedRole === 'seller' ? '#EBF2FC' : '#FFFFFF',
                      color: selectedRole === 'seller' ? '#2457A6' : '#1F2933',
                      fontWeight: selectedRole === 'seller' ? 600 : 400,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    I am a Seller
                  </button>
                </div>
              </div>
            </>
          )}

          <Input
            label={isRegister ? "Email Address" : "Email or Username"}
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder={isRegister ? "user@example.com" : "seller, admin, or email@example.com"}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {!isRegister && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', marginTop: '-6px' }}>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2457A6',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={isRegister ? UserPlus : LogIn}
            loading={loading}
            style={{ width: '100%', marginTop: '4px' }}
          >
            {isRegister ? 'Create Account' : 'Log In'}
          </Button>
        </form>

        {/* Toggle between Login and Register */}
        <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: '#4B5563' }}>
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ background: 'transparent', border: 'none', color: '#2457A6', fontWeight: 600, cursor: 'pointer' }}
              >
                Log In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ background: 'transparent', border: 'none', color: '#2457A6', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Account
              </button>
            </>
          )}
        </div>



        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11.5px', color: '#9AA5B1' }}>
          By continuing, you agree to our{' '}
          <Link to="/terms" style={{ color: '#667085' }}>Terms & Conditions</Link> and{' '}
          <Link to="/privacy" style={{ color: '#667085' }}>Privacy Policy</Link>.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <Modal
          isOpen={forgotModal}
          onClose={() => setForgotModal(false)}
          title="Reset Your Password"
          maxWidth="420px"
        >
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: '13px', color: '#667085', marginBottom: '16px' }}>
              Enter the email address associated with your account and we'll send you a password reset link.
            </p>
            <Input
              label="Email Address"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setForgotModal(false)} disabled={resetLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={resetLoading}>
                Send Reset Link
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
