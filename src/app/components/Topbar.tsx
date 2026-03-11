import { Bell, Search, LogOut, Moon, Sun, AlertTriangle, AlertCircle, Info, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router';
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info';
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Retraso Mayor Detectado', description: 'Security Audit muestra un retraso de 12 días.', type: 'critical', time: 'Hace 2h', read: false },
  { id: '2', title: 'Presupuesto al 98%', description: 'Security Audit ha consumido casi todo el presupuesto.', type: 'critical', time: 'Hace 4h', read: false },
  { id: '3', title: 'Desviación Presupuestal', description: 'Cloud Migration muestra posible sobrecosto del 15%.', type: 'warning', time: 'Hace 6h', read: false },
  { id: '4', title: 'Hito Completado', description: 'ERP Modernization: Desarrollo Fase 1 al 100%.', type: 'info', time: 'Hace 1d', read: true },
  { id: '5', title: 'Nuevo Miembro', description: 'Laura Torres se unió a Data Analytics.', type: 'info', time: 'Hace 2d', read: true },
];

const notificationIcon: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="w-3.5 h-3.5 text-destructive" />,
  warning: <AlertCircle className="w-3.5 h-3.5 text-warning" />,
  info: <Info className="w-3.5 h-3.5 text-info" />,
};

const notificationDot: Record<string, string> = {
  critical: 'bg-destructive',
  warning: 'bg-warning',
  info: 'bg-info',
};

export function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const openCommandPalette = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <div className="bg-card border-b border-border h-14 flex items-center justify-between px-6">
      {/* Search - triggers Command Palette */}
      <div className="flex-1 max-w-md">
        <button
          onClick={openCommandPalette}
          aria-label="Buscar (Ctrl+K)"
          className="w-full flex items-center gap-2 pl-3 pr-3 py-1.5 bg-background rounded-md border border-input text-sm text-muted-foreground hover:border-primary/40 hover:bg-accent transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-6">
        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative p-2 rounded-md hover:bg-accent transition-colors"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
                aria-expanded={showNotifications}
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>Notificaciones</TooltipContent>
          </Tooltip>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[380px] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Marcar todas como leídas
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-0.5 rounded hover:bg-accent transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                      setShowNotifications(false);
                      navigate('/alerts');
                    }}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-border last:border-0 ${
                      !n.read ? 'bg-primary/[0.03]' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      {notificationIcon[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                        {!n.read && (
                          <span className={`w-1.5 h-1.5 rounded-full ${notificationDot[n.type]} flex-shrink-0`} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-2.5">
                <button
                  onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  Ver todas las alertas
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="text-xs font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                  className="p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Cerrar sesión</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
