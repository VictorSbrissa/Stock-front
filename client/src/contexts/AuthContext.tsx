import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface User {
  username: string;
  email?: string;
  roles: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  tenantId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, tenantId: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recuperar dados do localStorage ao inicializar
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const storedTenantId = localStorage.getItem('tenantId');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedTenantId) {
        setTenantId(storedTenantId);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      const { token: newToken, tenantId: responseTenantId } = response.data;

      // Decodificar o JWT para extrair informações do usuário
      const decoded = JSON.parse(atob(newToken.split('.')[1]));

      const userData: User = {
        username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || username,
        roles: Array.isArray(decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'])
          ? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
          : [decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']].filter(Boolean),
      };

      setToken(newToken);
      setUser(userData);
      setTenantId(responseTenantId);

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tenantId', responseTenantId);

      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (username: string, email: string, password: string, tenantId: string) => {
    try {
      await api.post('/auth/register', {
        username,
        email,
        password,
        tenantId,
      });

      toast.success('Usuário registrado com sucesso! Fazendo login...');

      // Após registrar, fazer login automaticamente
      await login(username, password);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTenantId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenantId');
    toast.success('Logout realizado com sucesso!');
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  const value: AuthContextType = {
    user,
    token,
    tenantId,
    isLoading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
