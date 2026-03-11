import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { AppLayout } from './components/AppLayout';
import {
  DashboardSkeleton,
  ProjectsSkeleton,
  BacklogSkeleton,
  AlertsSkeleton,
  GenericPageSkeleton,
} from './components/PageSkeletons';

// Eager: lightweight public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Lazy: heavier authenticated pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Backlog = lazy(() => import('./pages/Backlog'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Reports = lazy(() => import('./pages/Reports'));
const Executive = lazy(() => import('./pages/Executive'));
const Profile = lazy(() => import('./pages/Profile'));
const MemberProfile = lazy(() => import('./pages/MemberProfile'));
const Settings = lazy(() => import('./pages/Settings'));
const Logs = lazy(() => import('./pages/Logs'));

function withSuspense(Component: React.LazyExoticComponent<React.ComponentType>, Fallback: React.ComponentType = GenericPageSkeleton) {
  return (
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: withSuspense(Dashboard, DashboardSkeleton) },
      { path: 'projects', element: withSuspense(Projects, ProjectsSkeleton) },
      { path: 'projects/:id', element: withSuspense(ProjectDetail, GenericPageSkeleton) },
      { path: 'backlog', element: withSuspense(Backlog, BacklogSkeleton) },
      { path: 'alerts', element: withSuspense(Alerts, AlertsSkeleton) },
      { path: 'reports', element: withSuspense(Reports) },
      { path: 'executive', element: withSuspense(Executive) },
      { path: 'profile', element: withSuspense(Profile) },
      { path: 'profile/:memberId', element: withSuspense(MemberProfile) },
      { path: 'settings', element: withSuspense(Settings) },
      { path: 'logs', element: withSuspense(Logs) },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
