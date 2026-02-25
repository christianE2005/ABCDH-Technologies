import { motion } from 'motion/react';
import { useState } from 'react';
import { FileCode, Search, Filter } from 'lucide-react';

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  const logs = [
    {
      id: 1,
      user: 'Admin Usuario',
      action: 'Login',
      module: 'Autenticación',
      description: 'Inicio de sesión exitoso',
      date: '25 Feb 2026 14:32',
      ip: '192.168.1.105'
    },
    {
      id: 2,
      user: 'Project Manager',
      action: 'Edición',
      module: 'Proyectos',
      description: 'Actualizó Proyecto Alpha',
      date: '25 Feb 2026 13:15',
      ip: '192.168.1.87'
    },
    {
      id: 3,
      user: 'Admin Usuario',
      action: 'Creación',
      module: 'Proyectos',
      description: 'Creó Proyecto Omega',
      date: '25 Feb 2026 11:45',
      ip: '192.168.1.105'
    },
    {
      id: 4,
      user: 'Director Ejecutivo',
      action: 'Descarga',
      module: 'Reportes',
      description: 'Generó reporte ejecutivo trimestral',
      date: '25 Feb 2026 10:22',
      ip: '192.168.1.93'
    },
    {
      id: 5,
      user: 'Usuario Operativo',
      action: 'Edición',
      module: 'Backlog',
      description: 'Movió tarea a "Completada"',
      date: '25 Feb 2026 09:15',
      ip: '192.168.1.112'
    },
    {
      id: 6,
      user: 'Admin Usuario',
      action: 'Eliminación',
      module: 'Usuarios',
      description: 'Eliminó usuario inactivo',
      date: '24 Feb 2026 16:40',
      ip: '192.168.1.105'
    },
    {
      id: 7,
      user: 'Project Manager',
      action: 'Edición',
      module: 'Configuración',
      description: 'Actualizó preferencias de notificaciones',
      date: '24 Feb 2026 15:20',
      ip: '192.168.1.87'
    },
    {
      id: 8,
      user: 'Usuario Operativo',
      action: 'Login',
      module: 'Autenticación',
      description: 'Inicio de sesión exitoso',
      date: '24 Feb 2026 08:45',
      ip: '192.168.1.112'
    },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Login':
        return 'bg-[#2196F3]/10 text-[#2196F3]';
      case 'Edición':
        return 'bg-[#FFC107]/10 text-[#FFC107]';
      case 'Creación':
        return 'bg-[#00C853]/10 text-[#00C853]';
      case 'Eliminación':
        return 'bg-[#FF3D3D]/10 text-[#FF3D3D]';
      case 'Descarga':
        return 'bg-muted/20 text-muted-foreground';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesModule = filterModule === 'all' || log.module === filterModule;

    return matchesSearch && matchesAction && matchesModule;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Logs del Sistema</h1>
        <p className="text-muted-foreground">Auditoría completa de acciones de usuarios (Solo Admin)</p>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filter by Action */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todas las acciones</option>
              <option value="Login">Login</option>
              <option value="Edición">Edición</option>
              <option value="Creación">Creación</option>
              <option value="Eliminación">Eliminación</option>
              <option value="Descarga">Descarga</option>
            </select>
          </div>

          {/* Filter by Module */}
          <div className="relative">
            <FileCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background rounded-lg border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos los módulos</option>
              <option value="Autenticación">Autenticación</option>
              <option value="Proyectos">Proyectos</option>
              <option value="Reportes">Reportes</option>
              <option value="Backlog">Backlog</option>
              <option value="Usuarios">Usuarios</option>
              <option value="Configuración">Configuración</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{filteredLogs.length}</span> de <span className="font-medium text-foreground">{logs.length}</span> registros
          </p>
          <button className="px-4 py-2 bg-primary hover:bg-[#FF4C4C] text-white rounded-lg text-sm font-medium transition-colors">
            Exportar CSV
          </button>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Usuario</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Acción</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Módulo</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Descripción</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Fecha/Hora</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-medium text-foreground">{log.user}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-foreground">{log.module}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-muted-foreground text-sm">{log.description}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-muted-foreground text-sm">{log.date}</span>
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{log.ip}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
