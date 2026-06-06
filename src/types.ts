export type UserRole = 'merchant' | 'customer' | 'partner' | 'admin';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: UserRole;
  statut: 'actif' | 'inactif' | 'suspendu';
  createdAt: string;
}

export interface Merchant extends User {
  nomBoutique: string;
  adresse: string;
  latitude: number;
  longitude: number;
  wallet: Wallet;
}

export interface Customer extends User {
  qrPersonnel: string;
  wallet: Wallet;
}

export interface PartnerShop extends User {
  nomBoutique: string;
  adresse: string;
  latitude: number;
  longitude: number;
  distance?: number;
  horaires?: string;
}

export interface Wallet {
  walletId: string;
  balance: number;
  balanceEnAttente: number;
  revenusGeneres: number;
  createdAt: string;
}

export interface Transaction {
  transactionId: string;
  montantAchat: number;
  montantPaye: number;
  monnaieARendre: number;
  fraisService: number;
  statut: 'en_attente' | 'validee' | 'annulee' | 'expiree';
  createdAt: string;
  merchantName?: string;
  partnerName?: string;
  qrCode?: string;
}

export interface QRTransaction {
  qrId: string;
  qrCode: string;
  expirationDate: string;
  isUsed: boolean;
  montant: number;
  reference: string;
}

export interface FraudReport {
  fraudId: string;
  scoreRisque: number;
  typeFraude: string;
  description: string;
  dateDetection: string;
  transactionId: string;
}

export interface CommissionHistory {
  commissionId: string;
  montantCommission: number;
  typeCommission: 'plateforme' | 'emetteur' | 'partenaire';
  dateCommission: string;
}

export interface DashboardStats {
  totalTransactions: number;
  revenusJour: number;
  revenusMois: number;
  totalClients: number;
  monnaieDistribuee: number;
  monnaieRecuperee: number;
}
