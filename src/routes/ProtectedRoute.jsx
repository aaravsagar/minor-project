import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userProfile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Authenticating user session..." />
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // First time logged in with no chosen role (and not admin)
  if (!userProfile?.role && !isAdmin) {
    return <Navigate to="/onboarding" replace />;
  }

  // Admin has access to all routes or admin route
  if (isAdmin) {
    return children;
  }

  // Account suspended or access revoked by administrator
  if (userProfile?.status === 'suspended' || userProfile?.accessRevoked) {
    return <Navigate to="/suspended" replace />;
  }

  // Check role restrictions
  if (allowedRoles.length > 0 && !allowedRoles.includes(userProfile?.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};
