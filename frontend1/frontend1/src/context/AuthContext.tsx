import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { loginUser, registerUser, getMe, updateUserProfile, logoutClient, storeTokens } from '../api';

interface RegisterData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMe();
        setUser(profile);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    loadProfile();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    try {
      const result = await loginUser(email, password);
      storeTokens(result.access, result.refresh);
      setUser(result.user);
      setIsAuthenticated(true);
      return { success: true, role: result.user.role };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur de connexion.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await registerUser(data);
      storeTokens(result.access, result.refresh);
      setUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erreur lors de l’inscription.' };
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await updateUserProfile(data);
    setUser(updated);
  };

  const logout = () => {
    logoutClient();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
