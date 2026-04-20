import { useState, useEffect } from 'react';
import { Plus, Mail, User, Lock, Loader2, Shield, Pencil, Trash2 } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { usersService } from '../../services';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import type { ApiUserAccount } from '../../services';

interface NewUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

interface EditingUser {
  id: number;
  username: string;
  email: string;
  role: number;
  password?: string;
}

export default function CreateUsers() {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<NewUser>({
    username: '',
    email: '',
    password: '',
    role: 'project_manager',
  });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allUsers, setAllUsers] = useState<ApiUserAccount[]>([]);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    // Only load users if the current user is an admin
    if (currentUser?.role === 'admin') {
      loadAllUsers();
    }
  }, [currentUser?.role]);

  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await usersService.list();
      setAllUsers(users);
    } catch (err) {
      console.error('[CreateUsers] Error loading users:', err);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await usersService.create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        system_role: getRoleSystemValue(formData.role),
      });

      toast.success(`Usuario ${formData.username} creado exitosamente`);
      setFormData({ username: '', email: '', password: '', role: 'project_manager' });
      await loadAllUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear usuario';
      console.error('[CreateUsers] Error:', err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingUser) return;

    if (editingUser.password && editingUser.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (currentUser?.id === String(editingUser.id)) {
      toast.error('No puedes editar tu propia cuenta');
      return;
    }

    setEditSaving(true);
    try {
      const updateData: any = {
        username: editingUser.username,
        email: editingUser.email,
        ...(editingUser.password ? { password: editingUser.password } : {}),
      };
      
      // Include system_role if it has been changed
      if (editingUser.role) {
        updateData.system_role = editingUser.role;
      }
      
      await usersService.update(editingUser.id, updateData);
      toast.success('Usuario actualizado exitosamente');
      setEditingUser(null);
      await loadAllUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar usuario';
      console.error('[CreateUsers] Error updating:', err);
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (currentUser?.id === String(userId)) {
      toast.error('No puedes eliminar tu propia cuenta');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await usersService.delete(userId);
      toast.success('Usuario eliminado exitosamente');
      await loadAllUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar usuario';
      console.error('[CreateUsers] Error deleting:', err);
      toast.error(msg);
    }
  };

  const getRoleLabel = (role: UserRole | string | number): string => {
    if (typeof role === 'number') {
      const mapping: Record<number, string> = {
        2: 'Administrador',
        3: 'Usuario',
        4: 'Stakeholder',
        5: 'Project Manager',
      };
      return mapping[role] || 'Desconocido';
    }

    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      project_manager: 'Project Manager',
      operative: 'Parte Interesada',
      executive: 'Directivo',
      user: 'Usuario',
    };
    return labels[role as UserRole] || role;
  };

  const getRoleSystemValue = (role: UserRole): number => {
    const mapping: Record<UserRole, number> = {
      admin: 2,
      project_manager: 5,
      operative: 4,
      executive: 3,
      user: 3,
    };
    return mapping[role] || 3;
  };

  const getRoleColor = (roleId: number): string => {
    switch (roleId) {
      case 2:
        return 'bg-destructive/10 text-destructive';
      case 3:
        return 'bg-info/15 text-info';
      case 4:
        return 'bg-warning/15 text-warning';
      case 5:
        return 'bg-primary/15 text-primary';
      default:
        return 'bg-secondary';
    }
  };

  // Only allow admins
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            Solo administradores pueden crear usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-3 space-y-3 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[13px] font-semibold text-foreground">Gestión de Usuarios</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Crea y administra usuarios de la plataforma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[3px] p-5"
          >
            <h2 className="text-[13px] font-semibold text-foreground mb-3.5">
              Nuevo Usuario
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Username */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="juan.perez"
                    className="w-full bg-input-background border border-input rounded-[3px] pl-8 pr-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="juan@techmahindra.com"
                    className="w-full bg-input-background border border-input rounded-[3px] pl-8 pr-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">
                  Contraseña Temporal
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-input-background border border-input rounded-[3px] pl-8 pr-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Mínimo 8 caracteres
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[12px] font-medium text-foreground mb-1.5">
                  Rol
                </label>
                <div className="relative">
                  <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    value={formData.role}
                    onChange={handleRoleChange}
                    className="w-full bg-input-background border border-input rounded-[3px] pl-8 pr-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none"
                  >
                    <option value="project_manager">Project Manager</option>
                    <option value="user">Usuario</option>
                    <option value="operative">Stakeholder</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-[3px] py-2 text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Crear Usuario
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-[3px] p-5"
          >
            <h2 className="text-[13px] font-semibold text-foreground mb-3.5">
              Usuarios ({allUsers.length})
            </h2>

            {loadingUsers ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-secondary/30 rounded animate-pulse" />
                ))}
              </div>
            ) : allUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-[3px] bg-primary/10 flex items-center justify-center mb-2.5">
                  <User className="w-5 h-5 text-primary/40" />
                </div>
                <p className="text-[13px] text-muted-foreground">
                  No hay usuarios en el sistema
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {allUsers.map((user) => {
                  const isCurrentUser = currentUser?.id === String(user.id_user);
                  const isEditing = editingUser?.id === user.id_user;

                  return (
                    <motion.div
                      key={user.id_user}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-[3px] border border-border hover:border-primary/40 hover:bg-accent/20 transition-colors"
                    >
                      {isEditing && editingUser ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingUser.username}
                              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                              placeholder="Usuario"
                              className="flex-1 bg-input-background border border-input rounded-[3px] px-2.5 py-1.5 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                              placeholder="Correo"
                              className="flex-1 bg-input-background border border-input rounded-[3px] px-2.5 py-1.5 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({ ...editingUser, role: Number(e.target.value) })}
                              className="flex-1 bg-input-background border border-input rounded-[3px] px-2.5 py-1.5 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                            >
                              <option value={2}>Administrador</option>
                              <option value={3}>Usuario</option>
                              <option value={4}>Stakeholder</option>
                              <option value={5}>Project Manager</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              value={editingUser.password ?? ''}
                              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                              placeholder="Nueva contraseña. Dejar vacío si no requiere cambios."
                              className="flex-1 bg-input-background border border-input rounded-[3px] px-2.5 py-1.5 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-2 justify-end">
                            <button
                              onClick={() => setEditingUser(null)}
                              disabled={editSaving}
                              className="px-2.5 py-1 rounded-[3px] text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleEditSave}
                              disabled={editSaving}
                              className="px-2.5 py-1 rounded-[3px] text-xs font-medium bg-primary hover:bg-primary-hover text-primary-foreground transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              {editSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-[13px] font-medium text-foreground truncate">
                                {user.username}
                              </p>
                              {isCurrentUser && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                                  Tú
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-muted-foreground truncate mb-1.5">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block px-2 py-0.5 rounded-[2px] text-[11px] font-medium ${getRoleColor(user.system_role)}`}>
                                {user.system_role_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                            {!isCurrentUser && (
                              <>
                                <button
                                  onClick={() => setEditingUser({
                                    id: user.id_user,
                                    username: user.username,
                                    email: user.email,
                                    role: user.system_role,
                                  })}
                                  className="p-1.5 rounded-[3px] hover:bg-primary/10 text-primary/60 hover:text-primary transition-colors"
                                  title="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id_user)}
                                  className="p-1.5 rounded-[3px] hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
