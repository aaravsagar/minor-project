import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public & Auth Pages
import { LandingPage } from '../pages/public/LandingPage';
import { TermsPage } from '../pages/public/TermsPage';
import { PrivacyPage } from '../pages/public/PrivacyPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { AccessDeniedPage } from '../pages/auth/AccessDeniedPage';
import { NotFoundPage } from '../pages/auth/NotFoundPage';

// Buyer Pages
import { BuyerDashboard } from '../pages/buyer/BuyerDashboard';
import { PostRequirementPage } from '../pages/buyer/PostRequirementPage';
import { MyRequirementsPage } from '../pages/buyer/MyRequirementsPage';
import { BuyerOffersPage } from '../pages/buyer/BuyerOffersPage';
import { BuyerDealsPage } from '../pages/buyer/BuyerDealsPage';
import { BuyerMessagesPage } from '../pages/buyer/BuyerMessagesPage';
import { BuyerProfilePage } from '../pages/buyer/BuyerProfilePage';

// Seller Pages
import { SellerDashboard } from '../pages/seller/SellerDashboard';
import { BrowseRequirementsPage } from '../pages/seller/BrowseRequirementsPage';
import { MyPitchesPage } from '../pages/seller/MyPitchesPage';
import { SellerDealsPage } from '../pages/seller/SellerDealsPage';
import { SellerMessagesPage } from '../pages/seller/SellerMessagesPage';
import { SellerProfilePage } from '../pages/seller/SellerProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminRequirementsPage } from '../pages/admin/AdminRequirementsPage';
import { AdminPitchesPage } from '../pages/admin/AdminPitchesPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/categories" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
      </Route>

      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Buyer Workspace Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BuyerDashboard />} />
        <Route path="requirements" element={<MyRequirementsPage />} />
        <Route path="requirements/new" element={<PostRequirementPage />} />
        <Route path="requirements/:id" element={<BuyerOffersPage />} />
        <Route path="post" element={<Navigate to="/buyer/requirements/new" replace />} />
        <Route path="offers" element={<BuyerOffersPage />} />
        <Route path="offers/:requirementId" element={<BuyerOffersPage />} />
        <Route path="deals" element={<BuyerDealsPage />} />
        <Route path="messages" element={<BuyerMessagesPage />} />
        <Route path="profile" element={<BuyerProfilePage />} />
      </Route>

      {/* Seller Workspace Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SellerDashboard />} />
        <Route path="requirements" element={<BrowseRequirementsPage />} />
        <Route path="requirements/:id" element={<BrowseRequirementsPage />} />
        <Route path="browse" element={<Navigate to="/seller/requirements" replace />} />
        <Route path="pitches" element={<MyPitchesPage />} />
        <Route path="deals" element={<SellerDealsPage />} />
        <Route path="messages" element={<SellerMessagesPage />} />
        <Route path="profile" element={<SellerProfilePage />} />
      </Route>

      {/* Admin Workspace Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="requirements" element={<AdminRequirementsPage />} />
        <Route path="pitches" element={<AdminPitchesPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
