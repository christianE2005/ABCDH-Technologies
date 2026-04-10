import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from '../../config/api';

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
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = AUTH_TOKEN_KEY;
const USER_KEY = 'auth_user';

function pickUserId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const source = payload as Record<string, unknown>;
  const directId = source.id_user ?? source.id ?? source.user_id;
  if (directId !== undefined && directId !== null) return String(directId);

  const nestedUser = source.user;
  if (!nestedUser || typeof nestedUser !== 'object') return null;
  const nested = nestedUser as Record<string, unknown>;
  const nestedId = nested.id_user ?? nested.id ?? nested.user_id;
  if (nestedId !== undefined && nestedId !== null) return String(nestedId);
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }

      const data = await response.json();
      
      // Store access token
      if (data.access_token) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
      }
      
      // Store refresh token if provided
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      const userId = pickUserId(data);
      if (!userId) {
        throw new Error('La respuesta de login no incluye user.id válido.');
      }

      // Store user data - API returns: id_user, email, username, created_at
      const userData: User = {
        id: userId,
        name: data.user?.username || email,
        email: data.user?.email || email,
        role: data.user?.role || 'operative',
        avatar: data.user?.avatar,
      };
      
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear la cuenta');
      }

      const data = await response.json();
      
      // Store token if provided by backend
      if (data.access_token) {
        localStorage.setItem(TOKEN_KEY, data.access_token);
      } else if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      const userId = pickUserId(data);
      if (!userId) {
        throw new Error('La respuesta de registro no incluye user.id válido.');
      }

      // Store user data - API returns: id_user, email, username, created_at
      const userData: User = {
        id: userId,
        name: data.user?.username || data.username || username,
        email: data.user?.email || data.email || email,
        role: data.user?.role || data.role || 'operative',
        avatar: data.user?.avatar || data.avatar,
      };
      
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cuenta';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading, error }}>
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
