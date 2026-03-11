import { Link, useLocation, useParams } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Proyectos',
  backlog: 'Backlog',
  alerts: 'Alertas',
  reports: 'Reportes',
  executive: 'Ejecutivo',
  profile: 'Perfil',
  settings: 'Configuración',
  logs: 'Logs',
};

// Map project IDs to names (mock data — matches Projects.tsx)
const projectNames: Record<string, string> = {
  '1': 'ERP Modernization',
  '2': 'Cloud Migration',
  '3': 'Mobile App',
  '4': 'Security Audit',
  '5': 'Data Analytics Platform',
};

export function AppBreadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs: { label: string; path?: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const path = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;

    // If this is a project ID segment under /projects/:id
    if (i === 1 && segments[0] === 'projects' && params.id) {
      crumbs.push({
        label: projectNames[params.id] || `Proyecto #${params.id}`,
        path: isLast ? undefined : path,
      });
    } else {
      crumbs.push({
        label: routeLabels[segment] || segment,
        path: isLast ? undefined : path,
      });
    }
  }

  if (crumbs.length <= 1 && !params.id) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs">
        {crumbs.map((crumb, i) => (
          <BreadcrumbItem key={i}>
            {i > 0 && <BreadcrumbSeparator />}
            {crumb.path ? (
              <BreadcrumbLink asChild>
                <Link to={crumb.path}>{crumb.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
