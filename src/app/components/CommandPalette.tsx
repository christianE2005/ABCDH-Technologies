import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProjects } from '../hooks/useProjectData';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from './ui/command';
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
  Moon,
  Sun,
  LogOut,
  Search,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface NavCommand {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  keywords?: string;
}

const navCommands: NavCommand[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid, keywords: 'inicio home overview resumen' },
  { name: 'Proyectos', path: '/projects', icon: Briefcase, keywords: 'projects lista list' },
  { name: 'Backlog', path: '/backlog', icon: ListChecks, keywords: 'tareas tasks kanban board' },
  { name: 'Alertas', path: '/alerts', icon: Bell, keywords: 'notificaciones notifications avisos' },
  { name: 'Reportes', path: '/reports', icon: FileBarChart, keywords: 'reports informes generar' },
  { name: 'Vista Ejecutiva', path: '/executive', icon: PieChart, roles: ['executive', 'admin'], keywords: 'executive director estrategia' },
  { name: 'Mi Perfil', path: '/profile', icon: CircleUser, keywords: 'perfil profile usuario user' },
  { name: 'Configuración', path: '/settings', icon: SlidersHorizontal, keywords: 'settings ajustes preferences' },
  { name: 'Logs del Sistema', path: '/logs', icon: ScrollText, roles: ['admin'], keywords: 'audit registros sistema' },
];

const alertCommands = [
  { name: 'Security Audit — Retraso crítico', icon: ShieldAlert, severity: 'critical', keywords: 'seguridad retraso critico roberto silva' },
  { name: 'Cloud Migration — Exceso presupuestal', icon: AlertTriangle, severity: 'warning', keywords: 'cloud presupuesto carlos ramirez' },
  { name: 'DevOps Pipeline — Recursos insuficientes', icon: AlertCircle, severity: 'critical', keywords: 'devops recursos sandra lopez' },
  { name: 'ERP Modernization — Testing pendiente', icon: AlertTriangle, severity: 'warning', keywords: 'erp testing qa maria gonzalez' },
  { name: 'Data Analytics — Modelo ML en validación', icon: AlertCircle, severity: 'info', keywords: 'analytics ml modelo laura torres' },
  { name: 'Cloud Migration — SLA en riesgo', icon: ShieldAlert, severity: 'critical', keywords: 'cloud sla riesgo' },
  { name: 'Security Audit — Presupuesto agotado 98%', icon: AlertTriangle, severity: 'warning', keywords: 'seguridad presupuesto agotado' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { allProjects } = useProjects();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const filteredNav = navCommands.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      {open && (
        <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette" description="Busca páginas, proyectos o acciones">
      <CommandInput placeholder="Escribe un comando o busca..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">Sin resultados</p>
          </div>
        </CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navegación">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.path}
                value={`${item.name} ${item.keywords || ''}`}
                onSelect={() => runCommand(() => navigate(item.path))}
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span>{item.name}</span>
                <ArrowRight className="ml-auto w-3 h-3 text-muted-foreground/50" />
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Projects quick access — dynamic from hook */}
        <CommandGroup heading="Proyectos">
          {allProjects.map((project) => {
            const statusColor = project.status === 'delayed' ? 'text-destructive' : project.status === 'at_risk' ? 'text-warning' : 'text-success';
            return (
              <CommandItem
                key={project.id}
                value={`proyecto ${project.name} ${project.manager} ${project.tags.join(' ')}`}
                onSelect={() => runCommand(() => navigate(`/projects/${project.id}`))}
              >
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{project.name}</span>
                <span className={`ml-2 text-[10px] font-medium ${statusColor}`}>{project.progress}%</span>
                <ArrowRight className="ml-auto w-3 h-3 text-muted-foreground/50" />
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Alerts quick access */}
        <CommandGroup heading="Alertas">
          {alertCommands.map((alert, index) => {
            const Icon = alert.icon;
            const color = alert.severity === 'critical' ? 'text-destructive' : alert.severity === 'warning' ? 'text-warning' : 'text-info';
            return (
              <CommandItem
                key={index}
                value={`alerta ${alert.name} ${alert.keywords}`}
                onSelect={() => runCommand(() => navigate('/alerts'))}
              >
                <Icon className={`w-4 h-4 ${color}`} />
                <span>{alert.name}</span>
                <ArrowRight className="ml-auto w-3 h-3 text-muted-foreground/50" />
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Acciones">
          <CommandItem
            value="cambiar tema dark light oscuro claro"
            onSelect={() => runCommand(toggleTheme)}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
            <span>{theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="cerrar sesion logout salir"
            onSelect={() => runCommand(() => { logout(); navigate('/login'); })}
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            <span>Cerrar sesión</span>
            <CommandShortcut>⌘Q</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
      )}
    </>
  );
}
