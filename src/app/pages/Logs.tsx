import { useState } from 'react';
import { FileCode, Search, Filter } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  const logs = [
    { id: 1, user: 'Admin Usuario', action: 'Login', module: 'Autenticación', description: 'Inicio de sesión exitoso', date: '25 Feb 2026 14:32', ip: '192.168.1.105' },
    { id: 2, user: 'María González', action: 'Edición', module: 'Proyectos', description: 'Actualizó ERP Modernization', date: '25 Feb 2026 13:15', ip: '192.168.1.87' },
    { id: 3, user: 'Admin Usuario', action: 'Creación', module: 'Proyectos', description: 'Creó UX Redesign', date: '25 Feb 2026 11:45', ip: '192.168.1.105' },
    { id: 4, user: 'Director Ejecutivo', action: 'Descarga', module: 'Reportes', description: 'Generó reporte ejecutivo trimestral', date: '25 Feb 2026 10:22', ip: '192.168.1.93' },
    { id: 5, user: 'Usuario Operativo', action: 'Edición', module: 'Backlog', description: 'Movió tarea a "Completada"', date: '25 Feb 2026 09:15', ip: '192.168.1.112' },
    { id: 6, user: 'Admin Usuario', action: 'Eliminación', module: 'Usuarios', description: 'Eliminó usuario inactivo', date: '24 Feb 2026 16:40', ip: '192.168.1.105' },
    { id: 7, user: 'Project Manager', action: 'Edición', module: 'Configuración', description: 'Actualizó preferencias de notificaciones', date: '24 Feb 2026 15:20', ip: '192.168.1.87' },
    { id: 8, user: 'Usuario Operativo', action: 'Login', module: 'Autenticación', description: 'Inicio de sesión exitoso', date: '24 Feb 2026 08:45', ip: '192.168.1.112' },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Login': return 'bg-info/10 text-info';
      case 'Edición': return 'bg-warning/10 text-warning';
      case 'Creación': return 'bg-success/10 text-success';
      case 'Eliminación': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-muted-foreground';
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

  const selectClass = 'w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      <h1 className="text-xl font-semibold text-foreground mb-1">Logs del Sistema</h1>
      <p className="text-sm text-muted-foreground mb-6">Auditoría de acciones (Solo Admin)</p>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className={selectClass}>
              <option value="all">Todas las acciones</option>
              <option value="Login">Login</option>
              <option value="Edición">Edición</option>
              <option value="Creación">Creación</option>
              <option value="Eliminación">Eliminación</option>
              <option value="Descarga">Descarga</option>
            </select>
          </div>

          <div className="relative">
            <FileCode className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className={selectClass}>
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

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filteredLogs.length}</span> de <span className="font-medium text-foreground">{logs.length}</span> registros
          </p>
          <button className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-xs font-medium transition-colors">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left py-2.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Usuario</th>
                <th className="text-left py-2.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Acción</th>
                <th className="text-left py-2.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Módulo</th>
                <th className="text-left py-2.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Descripción</th>
                <th className="text-left py-2.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Fecha</th>
                <th className="text-left py-2.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="search"
                      title="Sin resultados"
                      description="No se encontraron logs con los filtros aplicados"
                      action={{ label: 'Limpiar filtros', onClick: () => { setSearchTerm(''); setFilterAction('all'); setFilterModule('all'); } }}
                    />
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-foreground">{log.user}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{log.module}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{log.description}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{log.date}</td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{log.ip}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
