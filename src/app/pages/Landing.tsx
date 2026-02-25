import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  BarChart3, 
  Bell, 
  Brain, 
  Shield, 
  TrendingUp,
  Users,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'KPIs en Tiempo Real',
      description: 'Monitoreo continuo del avance, presupuesto y métricas críticas de todos tus proyectos'
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Alertas Tempranas',
      description: 'Sistema inteligente de notificaciones para identificar riesgos antes de que impacten'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Análisis Predictivo IA',
      description: 'Predicciones precisas sobre probabilidad de retrasos y desviaciones presupuestales'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Seguridad Corporativa',
      description: 'Roles y permisos granulares para proteger información sensible del negocio'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Reportes Ejecutivos',
      description: 'Dashboards personalizados para directivos con insights accionables'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Gestión Colaborativa',
      description: 'Coordinación eficiente entre equipos con visibilidad total del flujo de trabajo'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">PI</span>
            </div>
            <span className="font-bold text-foreground text-xl">Project Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Iniciar sesión
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2 bg-primary hover:bg-[#FF4C4C] text-white rounded-lg transition-all font-medium"
            >
              Solicitar demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Potenciado por IA • Mahindra Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Gestión Inteligente de
            <span className="text-primary"> Proyectos en Tiempo Real</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Centraliza información, monitorea KPIs críticos y toma decisiones basadas en análisis predictivo. 
            La plataforma corporativa que ejecutivos y equipos necesitan.
          </p>

          <div className="flex items-center gap-4 justify-center">
            <Link 
              to="/register"
              className="px-8 py-4 bg-primary hover:bg-[#FF4C4C] text-white rounded-lg transition-all font-medium text-lg flex items-center gap-2 group"
            >
              Comenzar ahora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login"
              className="px-8 py-4 bg-card hover:bg-card/80 border border-border text-foreground rounded-lg transition-all font-medium text-lg"
            >
              Ver demo
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 rounded-2xl border border-border bg-card p-4 shadow-2xl"
          >
            <div className="bg-secondary rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Dashboard Principal - Vista Previa</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para gestionar proyectos complejos
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Herramientas de nivel empresarial diseñadas para organizaciones que exigen excelencia
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/20 to-[#FF3D3D]/20 border border-primary/30 rounded-2xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            ¿Listo para transformar tu gestión de proyectos?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a las organizaciones líderes que confían en Project Intelligence Platform
          </p>
          <Link 
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-[#FF4C4C] text-white rounded-lg transition-all font-medium text-lg"
          >
            Solicitar demo gratuita
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PI</span>
                </div>
                <span className="font-bold text-foreground">Project Intelligence</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Gestión empresarial de proyectos con inteligencia artificial
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Producto</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2026 Project Intelligence Platform by Mahindra. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}