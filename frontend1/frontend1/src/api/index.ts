import type { PartnerShop, User, Wallet, Transaction, FraudReport, CommissionHistory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'smartchange_access_token';
const REFRESH_TOKEN_KEY = 'smartchange_refresh_token';

const getAuthToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};
const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refresh = getRefreshToken();
    if (refresh) {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTokens(data.access, refresh);
        headers.Authorization = `Bearer ${data.access}`;
        const retry = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
        return handleResponse<T>(retry);
      }
    }
    clearTokens();
    throw new Error('Authentification requise');
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload as any).detail || (payload as any).message || 'Erreur serveur';
    throw new Error(message);
  }
  return payload as T;
}

export async function loginUser(emailOrPhone: string, password: string) {
  return apiRequest<{ success: boolean; user: User; access: string; refresh: string }>('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email_or_phone: emailOrPhone, password }),
  });
}

export async function registerUser(data: { nom: string; prenom: string; telephone: string; email: string; password: string; role: string }) {
  return apiRequest<{ success: boolean; user: User; access: string; refresh: string }>('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe() {
  return apiRequest<User>('/api/auth/me/');
}

export async function updateUserProfile(data: Partial<User>) {
  return apiRequest<User>('/api/users/me/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getPartners(query = '') {
  const path = `/api/partners/${query ? `?q=${encodeURIComponent(query)}` : ''}`;
  return apiRequest<PartnerShop[]>(path);
}

export async function getWallet() {
  return apiRequest<Wallet>('/api/wallet/');
}

export interface PaymentInitResponse {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  status?: string;
  raw?: any;
}

export async function initiatePayment(payload: { amount: number; currency?: string; transactionId?: string; email?: string }) {
  return apiRequest<PaymentInitResponse>('/api/payments/initiate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function withdrawWallet() {
  return apiRequest<{ success: boolean; withdrawn: number; wallet: Wallet }>('/api/wallet/withdraw/', {
    method: 'POST',
  });
}

export async function getTransactions() {
  return apiRequest<Transaction[]>('/api/transactions/');
}

export async function createTransaction(payload: { montantAchat: number; montantPaye: number; fraisService?: number }) {
  return apiRequest<Transaction>('/api/transactions/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function scanQr(reference: string) {
  return apiRequest<{ status: string; message: string; reference?: string; montant?: number; expiration?: string; isFraud?: boolean }>('/api/qr/scan/', {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}

export async function getDashboardStats() {
  return apiRequest<{ totalTransactions: number; revenusJour: number; revenusMois: number; totalClients: number; monnaieDistribuee: number; monnaieRecuperee: number }>('/api/dashboard/');
}

export async function getAdminUsers() {
  return apiRequest<User[]>('/api/admin/users/');
}

export async function getAdminTransactions() {
  return apiRequest<Transaction[]>('/api/admin/transactions/');
}

export async function getAdminFraudReports() {
  return apiRequest<FraudReport[]>('/api/admin/fraud/');
}

export async function getAdminCommissions() {
  return apiRequest<CommissionHistory[]>('/api/admin/commissions/');
}

export function storeTokens(access: string, refresh: string) {
  setTokens(access, refresh);
}

export function logoutClient() {
  clearTokens();
}

export function getStoredToken() {
  return getAuthToken();
}
