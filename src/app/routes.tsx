import { createBrowserRouter } from 'react-router';
import { AppLayout } from './components/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Backlog from './pages/Backlog';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Executive from './pages/Executive';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Logs from './pages/Logs';

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
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'backlog', element: <Backlog /> },
      { path: 'alerts', element: <Alerts /> },
      { path: 'reports', element: <Reports /> },
      { path: 'executive', element: <Executive /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'logs', element: <Logs /> },
    ],
  },
]);
