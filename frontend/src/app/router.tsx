import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { SignInPage } from '../features/auth/SignInPage';
import { SignUpPage } from '../features/auth/SignUpPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { StudentDashboard } from '../features/student/StudentDashboard';
import { FacultyDashboard } from '../features/faculty/FacultyDashboard';
import { FacultyDirectoryPage } from '../features/faculty/FacultyDirectoryPage';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { UserManagementPage } from '../features/admin/UserManagementPage';
import { ResearchTaxonomyPage } from '../features/admin/ResearchTaxonomyPage';
import { AuditLogsPage } from '../features/admin/AuditLogsPage';
import { TopicsCatalog } from '../features/research/TopicsCatalog';
import { PapersCatalog } from '../features/research/PapersCatalog';
import { RecommendationsPage } from '../features/research/RecommendationsPage';
import { SavedResearchPage } from '../features/research/SavedResearchPage';
import { ProjectIdeasCatalog } from '../features/projectIdeas/ProjectIdeasCatalog';
import { CreateProjectWizard } from '../features/projects/CreateProjectWizard';
import { ProjectsListPage } from '../features/projects/ProjectsListPage';
import { ProjectWorkspace } from '../features/projects/ProjectWorkspace';
import { SupportCenterPage } from '../features/support/SupportCenterPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { VerifyEmailPage } from '../features/auth/VerifyEmailPage';
import { IprDashboard } from '../features/ipr/IprDashboard';
import { NoveltyScreeningPage } from '../features/ipr/NoveltyScreeningPage';
import { NoveltyResultPage } from '../features/ipr/NoveltyResultPage';
import { IprSubmitPage } from '../features/ipr/IprSubmitPage';
import { MyIprPage } from '../features/ipr/MyIprPage';
import { IprDetailPage } from '../features/ipr/IprDetailPage';
import { IprReviewsPage } from '../features/ipr/IprReviewsPage';
import { IprDocumentsPage } from '../features/ipr/IprDocumentsPage';
import { IprActivityPage } from '../features/ipr/IprActivityPage';
import { useAuth } from '../hooks/useAuth';

// Role-aware Dashboard Switcher
const RoleDashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <StudentDashboard />;
};

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // Authenticated Dashboard Routes
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/dashboard',
        element: <RoleDashboardRouter />,
      },
      // Research discovery
      {
        path: '/research/topics',
        element: <TopicsCatalog />,
      },
      {
        path: '/research/papers',
        element: <PapersCatalog />,
      },
      {
        path: '/research/recommendations',
        element: <RecommendationsPage />,
      },
      {
        path: '/research/saved',
        element: <SavedResearchPage />,
      },
      // Projects
      {
        path: '/projects',
        element: <ProjectsListPage />,
      },
      {
        path: '/projects/ideas',
        element: <ProjectIdeasCatalog />,
      },
      {
        path: '/projects/create',
        element: <CreateProjectWizard />,
      },
      {
        path: '/projects/:id',
        element: <ProjectWorkspace />,
      },
      // Faculty
      {
        path: '/faculty',
        element: <FacultyDirectoryPage />,
      },
      {
        path: '/faculty/dashboard',
        element: <FacultyDashboard />,
      },
      // Admin
      {
        path: '/admin/dashboard',
        element: <AdminDashboard />,
      },
      {
        path: '/admin/users',
        element: <UserManagementPage />,
      },
      {
        path: '/admin/taxonomy',
        element: <ResearchTaxonomyPage />,
      },
      {
        path: '/admin/audit-logs',
        element: <AuditLogsPage />,
      },
      // IPR & Innovation Module
      {
        path: '/ipr/dashboard',
        element: <IprDashboard />,
      },
      {
        path: '/ipr/novelty',
        element: <NoveltyScreeningPage />,
      },
      {
        path: '/ipr/novelty/result/:id',
        element: <NoveltyResultPage />,
      },
      {
        path: '/ipr/submit',
        element: <IprSubmitPage />,
      },
      {
        path: '/ipr/my',
        element: <MyIprPage />,
      },
      {
        path: '/ipr/category/:category',
        element: <MyIprPage />,
      },
      {
        path: '/ipr/disclosures/:id',
        element: <IprDetailPage />,
      },
      {
        path: '/ipr/reviews',
        element: <IprReviewsPage />,
      },
      {
        path: '/ipr/documents',
        element: <IprDocumentsPage />,
      },
      {
        path: '/ipr/activity',
        element: <IprActivityPage />,
      },
      // Support & Settings
      {
        path: '/support',
        element: <SupportCenterPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  // Fallback redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
