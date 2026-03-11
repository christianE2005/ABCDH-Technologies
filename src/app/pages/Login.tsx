import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Mail, ArrowRight, BarChart3, Bell, Brain } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { LoadingButton } from '../components/LoadingButton';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('project_manager');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email, password, selectedRole);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-card border-r border-border flex-col justify-between p-10">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-xs">PI</span>
            </div>
            <span className="font-semibold text-foreground text-sm">Project Intelligence</span>
          </Link>

          <h2 className="text-2xl font-semibold text-foreground leading-snug mb-3">
            Plataforma de gestión de proyectos para Tech Mahindra
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-10">
            Monitorea el portafolio de proyectos, anticipa riesgos y toma decisiones informadas con análisis predictivo impulsado por IA.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: <BarChart3 className="w-4 h-4" />, title: 'KPIs en tiempo real', desc: 'Métricas de avance y presupuesto actualizadas' },
              { icon: <Bell className="w-4 h-4" />, title: 'Alertas tempranas', desc: 'Notificaciones inteligentes de riesgos' },
              { icon: <Brain className="w-4 h-4" />, title: 'IA predictiva', desc: 'Predicción de retrasos y desviaciones' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; 2026 Tech Mahindra
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-xs">PI</span>
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground mb-1">Iniciar Sesión</h1>
            <p className="text-sm text-muted-foreground">Accede a tu panel de gestión de proyectos</p>
          </div>

          {/* Login Card */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector (demo) */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Rol</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="admin">Administrador</option>
                <option value="project_manager">Project Manager</option>
                <option value="operative">Operativo</option>
                <option value="executive">Directivo</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@techmahindra.com"
                  className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-input rounded-md pl-9 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-input" />
                <span className="text-xs text-muted-foreground">Recordarme</span>
              </label>
              <a href="#" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            {/* Submit */}
            <LoadingButton
              type="submit"
              loading={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-md py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              Iniciar Sesión
              <ArrowRight className="w-3.5 h-3.5" />
            </LoadingButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground">o</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Crea una aquí</Link>
          </p>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}