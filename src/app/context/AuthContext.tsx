import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, tokenStore, usersService } from '../../services';
import type { ApiUserAccount } from '../../services';

export type UserRole = 'admin' | 'project_manager' | 'operative' | 'executive' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Map backend system_role_name (or project role names) to frontend UserRole
const ROLE_MAP: Record<string, UserRole> = {
  admin: 'admin',
  administrador: 'admin',
  executive: 'executive',
  ejecutivo: 'executive',
  project_manager: 'project_manager',
  'project manager': 'project_manager',
  manager: 'project_manager',
  pm: 'project_manager',
  user: 'operative',
  operative: 'operative',
  operativo: 'operative',
};

function mapRole(roleName: string | undefined | null): UserRole {
  if (!roleName) return 'operative';
  return ROLE_MAP[roleName.toLowerCase()] ?? 'operative';
}

function apiUserToUser(apiUser: ApiUserAccount, roleOverride?: UserRole): User {
  const role = roleOverride ?? mapRole(apiUser.system_role_name);
  return {
    id: String(apiUser.id_user),
    name: apiUser.username,
    email: apiUser.email,
    role,
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, systemRoleId?: number) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: if token exists, restore the user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pip_user');
    if (stored && tokenStore.getAccess()) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        // corrupted — clear
        tokenStore.clear();
        localStorage.removeItem('pip_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      const data = await authService.login(email, password);
      const u = apiUserToUser(data.user, role);
      setUser(u);
      localStorage.setItem('pip_user', JSON.stringify(u));
    } catch (err) {
      // Always return generic message for security
      throw new Error('Correo o contraseña incorrectos.');
    }
  };

  const register = async (name: string, email: string, password: string, systemRoleId?: number) => {
    try {
      const apiUser = await authService.register(email, name, password);
      // Auto-login after register
      await login(email, password);
      // Assign system role if provided
      if (systemRoleId) {
        await usersService.update(apiUser.id_user, { system_role: systemRoleId });
      }
    } catch (err) {
      // Always return generic message for security
      throw new Error('No se pudo completar el registro. Intenta más tarde.');
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('pip_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

