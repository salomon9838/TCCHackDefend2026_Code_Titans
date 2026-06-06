import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types';

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
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredAccount {
  user: User;
  password: string;
}

// Seul le compte admin est pré-enregistré — les autres doivent s'inscrire
const defaultAccounts: StoredAccount[] = [
  {
    password: 'admin123',
    user: { id: 'A1', nom: 'Gahounzo', prenom: 'Koffi', telephone: '+22890000004', email: 'admin@smartchange.tg', role: 'admin', statut: 'actif', createdAt: '2024-01-01' },
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>(defaultAccounts);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    await new Promise(r => setTimeout(r, 900));
    const found = accounts.find(
      a => (a.user.email.toLowerCase() === email.toLowerCase() || a.user.telephone === email) && a.password === password
    );
    if (!found) return { success: false, error: 'Email/téléphone ou mot de passe incorrect.' };
    setUser(found.user);
    return { success: true, role: found.user.role };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 900));
    const exists = accounts.find(a => a.user.email.toLowerCase() === data.email.toLowerCase());
    if (exists) return { success: false, error: 'Cet email est déjà utilisé.' };
    const newUser: User = {
      id: `U${Date.now()}`,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      email: data.email,
      role: data.role,
      statut: 'actif',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const newAccount: StoredAccount = { user: newUser, password: data.password };
    setAccounts(prev => [...prev, newAccount]);
    setUser(newUser);
    return { success: true };
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    setAccounts(prev => prev.map(a => a.user.id === updated.id ? { ...a, user: updated } : a));
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
