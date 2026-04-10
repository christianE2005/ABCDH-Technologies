import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Mail, User, Phone, Check, X, ArrowRight, Shield, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoadingButton } from '../components/LoadingButton';
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
  const strengthColors = ['bg-destructive', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordStrength < 2) {
      toast.error('La contraseña es muy débil');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear cuenta';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full bg-surface-secondary border border-border rounded-[3px] pl-8 pr-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-card border-r border-border flex-col justify-between p-10">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-7 h-7 bg-primary rounded-[3px] flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-xs">PI</span>
            </div>
            <span className="font-semibold text-foreground text-[13px]">Project Intelligence</span>
          </Link>

          <h2 className="text-[18px] font-semibold text-foreground leading-snug mb-3">
            Únete al equipo de Project Intelligence
          </h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-10">
            Crea tu cuenta y comienza a gestionar los proyectos de Tech Mahindra con inteligencia en menos de 2 minutos.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: <Shield className="w-4 h-4" />, title: 'Configuración segura', desc: 'Encriptación de datos y acceso por roles' },
              { icon: <Clock className="w-4 h-4" />, title: 'Listo en minutos', desc: 'Sin configuración compleja para comenzar' },
              { icon: <Users className="w-4 h-4" />, title: 'Colaboración total', desc: 'Invita a tu equipo y asigna permisos' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[3px] bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[12px] font-medium text-foreground">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">{f.desc}</p>
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
              <div className="w-8 h-8 bg-primary rounded-[3px] flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-xs">PI</span>
              </div>
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="text-[18px] font-semibold text-foreground mb-1">Crear Cuenta</h1>
            <p className="text-[13px] text-muted-foreground">Completa tus datos para comenzar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[12px] font-medium text-foreground mb-1.5">Nombre completo *</label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email & Phone row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">Correo *</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@techmahindra.com"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+52 123 456 7890"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-foreground mb-1.5">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-surface-secondary border border-border rounded-[3px] pl-8 pr-10 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-0.5 mb-1">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`h-0.5 flex-1 rounded-full transition-colors ${
                          index < passwordStrength ? strengthColors[passwordStrength] : 'bg-input'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] ${passwordStrength < 2 ? 'text-destructive' : passwordStrength < 3 ? 'text-warning' : 'text-success'}`}>
                    Fortaleza: {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[12px] font-medium text-foreground mb-1.5">Confirmar contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-surface-secondary border border-border rounded-[3px] pl-8 pr-10 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {formData.confirmPassword && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="w-3 h-3 text-success" />
                      <span className="text-[10px] text-success">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 text-destructive" />
                      <span className="text-[10px] text-destructive">Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-1.5 cursor-pointer">
              <input type="checkbox" required className="w-3.5 h-3.5 rounded-[3px] border-input mt-0.5" />
              <span className="text-[11px] text-muted-foreground">
                Acepto los <a href="#" className="text-primary hover:underline">términos</a> y la <a href="#" className="text-primary hover:underline">política de privacidad</a>
              </span>
            </label>

            {/* Submit */}
            <LoadingButton
              type="submit"
              loading={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] py-2.5 text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
            >
              Crear Cuenta
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

          <p className="text-center text-[12px] text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Inicia sesión</Link>
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