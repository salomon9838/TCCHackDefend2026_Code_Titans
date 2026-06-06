import type { Transaction, PartnerShop, FraudReport, DashboardStats } from '../types';

export const mockTransactions: Transaction[] = [
  { transactionId: 'TXN-001', montantAchat: 980, montantPaye: 1000, monnaieARendre: 20, fraisService: 20, statut: 'validee', createdAt: '2024-01-15T10:30:00', merchantName: 'Boutique Kokou', qrCode: 'QR-ABC123' },
  { transactionId: 'TXN-002', montantAchat: 750, montantPaye: 1000, monnaieARendre: 250, fraisService: 20, statut: 'en_attente', createdAt: '2024-01-15T11:00:00', merchantName: 'Marché Central', qrCode: 'QR-DEF456' },
  { transactionId: 'TXN-003', montantAchat: 1200, montantPaye: 2000, monnaieARendre: 800, fraisService: 20, statut: 'validee', createdAt: '2024-01-15T09:15:00', merchantName: 'Épicerie Akosua', qrCode: 'QR-GHI789' },
  { transactionId: 'TXN-004', montantAchat: 450, montantPaye: 500, monnaieARendre: 50, fraisService: 20, statut: 'expiree', createdAt: '2024-01-14T16:45:00', merchantName: 'Boulangerie Lomé', qrCode: 'QR-JKL012' },
  { transactionId: 'TXN-005', montantAchat: 1800, montantPaye: 2000, monnaieARendre: 200, fraisService: 20, statut: 'annulee', createdAt: '2024-01-14T14:20:00', merchantName: 'SuperShop Togo', qrCode: 'QR-MNO345' },
  { transactionId: 'TXN-006', montantAchat: 620, montantPaye: 1000, monnaieARendre: 380, fraisService: 20, statut: 'validee', createdAt: '2024-01-13T12:00:00', merchantName: 'Pharmacie Kpalimé', qrCode: 'QR-PQR678' },
];

export const mockPartners: PartnerShop[] = [
  { id: 'P1', nom: 'Dosseh', prenom: 'Kwame', telephone: '+22890112233', email: 'kwame@shop.tg', role: 'partner', statut: 'actif', createdAt: '2024-01-01', nomBoutique: 'Épicerie Dosseh', adresse: 'Rue des Commerçants, Lomé', latitude: 6.1375, longitude: 1.2123, distance: 0.3, horaires: '7h - 21h' },
  { id: 'P2', nom: 'Amewu', prenom: 'Afi', telephone: '+22891223344', email: 'afi@market.tg', role: 'partner', statut: 'actif', createdAt: '2024-01-01', nomBoutique: 'Marché Afi', adresse: 'Avenue du 13 Janvier, Lomé', latitude: 6.1420, longitude: 1.2200, distance: 0.7, horaires: '6h - 20h' },
  { id: 'P3', nom: 'Dossou', prenom: 'Kofi', telephone: '+22892334455', email: 'kofi@boutique.tg', role: 'partner', statut: 'actif', createdAt: '2024-01-01', nomBoutique: 'Boutique Dossou', adresse: 'Bd du Mono, Lomé', latitude: 6.1300, longitude: 1.2050, distance: 1.2, horaires: '8h - 22h' },
  { id: 'P4', nom: 'Agbeko', prenom: 'Mawuli', telephone: '+22893445566', email: 'mawuli@shop.tg', role: 'partner', statut: 'actif', createdAt: '2024-01-01', nomBoutique: 'Shop Agbeko', adresse: 'Quartier Bè, Lomé', latitude: 6.1500, longitude: 1.2300, distance: 2.1, horaires: '7h - 20h' },
];

export const mockFraudReports: FraudReport[] = [
  { fraudId: 'FR-001', scoreRisque: 87, typeFraude: 'Double remboursement', description: 'Tentative de scanner le même QR Code deux fois', dateDetection: '2024-01-15T10:15:00', transactionId: 'TXN-007' },
  { fraudId: 'FR-002', scoreRisque: 65, typeFraude: 'QR Code copié', description: "Utilisation d'un QR Code dupliqué depuis un autre appareil", dateDetection: '2024-01-14T15:30:00', transactionId: 'TXN-008' },
  { fraudId: 'FR-003', scoreRisque: 42, typeFraude: 'Comportement inhabituel', description: "Plus de 10 transactions en moins d'une heure", dateDetection: '2024-01-13T09:00:00', transactionId: 'TXN-009' },
];

export const mockDashboardStats: DashboardStats = {
  totalTransactions: 1247,
  revenusJour: 24940,
  revenusMois: 748200,
  totalClients: 523,
  monnaieDistribuee: 187350,
  monnaieRecuperee: 164200,
};

export const mockChartData = [
  { jour: 'Lun', transactions: 145, revenus: 2900 },
  { jour: 'Mar', transactions: 189, revenus: 3780 },
  { jour: 'Mer', transactions: 167, revenus: 3340 },
  { jour: 'Jeu', transactions: 210, revenus: 4200 },
  { jour: 'Ven', transactions: 234, revenus: 4680 },
  { jour: 'Sam', transactions: 198, revenus: 3960 },
  { jour: 'Dim', transactions: 104, revenus: 2080 },
];
