import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'project_manager' | 'operative' | 'executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: UserRole) => {
    // Mock login - en producción esto se conectaría a Supabase
    const mockUser: User = {
      id: '1',
      name: role === 'admin' ? 'Admin Usuario' : role === 'project_manager' ? 'Project Manager' : role === 'executive' ? 'Director Ejecutivo' : 'Usuario Operativo',
      email,
      role,
    };
    setUser(mockUser);
  };

  const register = (name: string, email: string, _password: string) => {
    // Mock registration
    const mockUser: User = {
      id: '1',
      name,
      email,
      role: 'operative',
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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
