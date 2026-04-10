import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, tokenStore, usersService, ApiRequestError } from '../../services';
import type { ApiUserAccount } from '../../services';

export type UserRole = 'admin' | 'project_manager' | 'operative' | 'executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Resolve user role from project_member entries.
// Fetches memberships + roles, picks the "highest" role across all projects.
const ROLE_PRIORITY: Record<string, UserRole> = {
  admin: 'admin',
  administrador: 'admin',
  executive: 'executive',
  ejecutivo: 'executive',
  project_manager: 'project_manager',
  'project manager': 'project_manager',
  manager: 'project_manager',
  pm: 'project_manager',
};
const ROLE_RANK: Record<UserRole, number> = {
  admin: 4,
  executive: 3,
  project_manager: 2,
  operative: 1,
};

async function resolveRole(userId: number): Promise<UserRole> {
  try {
    const [memberships, roles] = await Promise.all([
      usersService.listMembers(),
      usersService.listRoles(),
    ]);
    const roleMap = new Map(roles.map((r) => [r.id_role, r.name]));
    const userMemberships = memberships.filter((m) => m.user === userId);
    let best: UserRole = 'operative';
    for (const m of userMemberships) {
      if (m.role == null) continue;
      const roleName = (roleMap.get(m.role) ?? '').toLowerCase();
      const mapped = ROLE_PRIORITY[roleName] ?? 'operative';
      if (ROLE_RANK[mapped] > ROLE_RANK[best]) best = mapped;
    }
    return best;
  } catch {
    return 'operative';
  }
}

function apiUserToUser(apiUser: ApiUserAccount, role: UserRole = 'operative'): User {
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
  register: (name: string, email: string, password: string) => Promise<void>;
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
      // Resolve role from project_member entries (or use override for dev/demo)
      const resolvedRole = role ?? await resolveRole(data.user.id_user);
      const u = apiUserToUser(data.user, resolvedRole);
      setUser(u);
      localStorage.setItem('pip_user', JSON.stringify(u));
    } catch (err) {
      // Re-throw so callers (Login page) can show specific error messages
      if (err instanceof ApiRequestError) throw err;
      throw new Error('Error de conexión. Verifica que el servidor esté activo.');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const apiUser = await authService.register(email, name, password);
      // Auto-login after register
      await login(email, password);
      void apiUser; // returned data already used via login()
    } catch (err) {
      if (err instanceof ApiRequestError) throw err;
      throw new Error('Error de conexión. Verifica que el servidor esté activo.');
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

