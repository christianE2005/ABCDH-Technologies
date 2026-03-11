import { Link, useLocation } from 'react-router';
import { 
  LayoutGrid, 
  Briefcase, 
  ListChecks, 
  Bell, 
  FileBarChart, 
  PieChart,
  CircleUser,
  SlidersHorizontal,
  ScrollText,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
  { name: 'Proyectos', path: '/projects', icon: Briefcase },
  { name: 'Backlog', path: '/backlog', icon: ListChecks },
  { name: 'Alertas', path: '/alerts', icon: Bell },
  { name: 'Reportes', path: '/reports', icon: FileBarChart },
  { name: 'Ejecutivo', path: '/executive', icon: PieChart, roles: ['executive', 'admin'] },
  { name: 'Perfil', path: '/profile', icon: CircleUser },
  { name: 'Configuración', path: '/settings', icon: SlidersHorizontal },
  { name: 'Logs', path: '/logs', icon: ScrollText, roles: ['admin'] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-200 flex flex-col ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
            Project Intelligence
          </span>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              className="p-1 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{collapsed ? 'Expandir' : 'Colapsar'}</TooltipContent>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto" aria-label="Navegación principal">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          const linkElement = (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors text-[13px] ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );

          return collapsed ? (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
              <TooltipContent side="right">{item.name}</TooltipContent>
            </Tooltip>
          ) : (
            <span key={item.path}>{linkElement}</span>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
