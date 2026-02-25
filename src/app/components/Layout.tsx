import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FolderKanban,
  List,
  Bell,
  FileText,
  BarChart3,
  User,
  Settings,
  FileBarChart,
  Menu,
  X,
  Search,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: ReactNode;
  roles?: string[];
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Mis Proyectos', path: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { name: 'Backlog', path: '/backlog', icon: <List className="w-5 h-5" /> },
    { name: 'Alertas', path: '/alerts', icon: <Bell className="w-5 h-5" /> },
    { name: 'Reportes', path: '/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Panel Ejecutivo', path: '/executive', icon: <BarChart3 className="w-5 h-5" />, roles: ['admin', 'executive'] },
    { name: 'Perfil', path: '/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Configuración', path: '/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Logs', path: '/logs', icon: <FileBarChart className="w-5 h-5" />, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mockNotifications = [
    { id: 1, text: 'Proyecto Alpha superó el 80% del presupuesto', type: 'warning', time: '5 min' },
    { id: 2, text: 'Nueva asignación en proyecto Beta', type: 'info', time: '1h' },
    { id: 3, text: 'Alerta crítica: retraso en hito importante', type: 'danger', time: '2h' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 72 }}
        className="bg-sidebar border-r border-card-border flex flex-col fixed h-screen z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-card-border">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PI</span>
                </div>
                <span className="font-bold text-foreground">Project Intelligence</span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto"
              >
                <span className="text-white font-bold text-sm">PI</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-text-secondary hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-sidebar-active text-primary'
                    : 'text-text-secondary hover:bg-sidebar-hover hover:text-foreground'
                }`}
              >
                <span className={isActive ? 'text-primary' : 'group-hover:text-foreground'}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="p-4 border-t border-card-border">
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 overflow-hidden"
                  >
                    <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
                    <p className="text-text-secondary text-xs truncate">{user.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 280 : 72 }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar proyectos, tareas..."
                className="w-full bg-background-secondary border border-input-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-text-secondary hover:text-foreground transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
              </button>

              <AnimatePresence>
                {notificationOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-card border border-card-border rounded-lg shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-card-border">
                        <h3 className="font-bold text-foreground">Notificaciones</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {mockNotifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-card-border hover:bg-sidebar-hover transition-colors cursor-pointer">
                            <div className="flex gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                                notif.type === 'warning' ? 'bg-warning' : 
                                notif.type === 'danger' ? 'bg-danger' : 'bg-info'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{notif.text}</p>
                                <p className="text-xs text-text-muted mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center border-t border-card-border">
                        <Link to="/alerts" className="text-sm text-primary hover:text-primary-hover">
                          Ver todas las alertas
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-foreground transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Cerrar sesión</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
