import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, Wallet, MapPin, QrCode, ShieldAlert, History } from 'lucide-react';

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigate }) => {
  const { user } = useAuth();

  const roleColors: Record<string, string> = {
    merchant: '#00d4ff', customer: '#10b981', partner: '#7c3aed', admin: '#f59e0b',
  };
  const roleColor = roleColors[user?.role || 'merchant'];

  const navMap: Record<string, { id: string; label: string; icon: React.FC<any> }[]> = {
    merchant: [
      { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
      { id: 'transaction', label: 'Transaction', icon: ArrowLeftRight },
      { id: 'wallet', label: 'Portefeuille', icon: Wallet },
      { id: 'history', label: 'Historique', icon: History },
      { id: 'geolocation', label: 'Partenaires', icon: MapPin },
    ],
    customer: [
      { id: 'customer-wallet', label: 'Portefeuille', icon: Wallet },
      { id: 'customer-qr', label: 'QR Code', icon: QrCode },
      { id: 'history', label: 'Historique', icon: History },
      { id: 'geolocation', label: 'Partenaires', icon: MapPin },
    ],
    partner: [
      { id: 'partner-dashboard', label: 'Accueil', icon: LayoutDashboard },
      { id: 'partner-scan', label: 'Scanner', icon: QrCode },
      { id: 'wallet', label: 'Portefeuille', icon: Wallet },
      { id: 'history', label: 'Historique', icon: History },
    ],
    admin: [
      { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'admin-users', label: 'Utilisateurs', icon: ShieldAlert },
      { id: 'admin-transactions', label: 'Transactions', icon: ArrowLeftRight },
      { id: 'admin-fraud', label: 'Fraudes', icon: ShieldAlert },
    ],
  };

  const nav = navMap[user?.role || 'merchant'] || navMap.merchant;

  return (
    <nav className="bottom-nav">
      {nav.map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id ||
          (item.id === 'admin-dashboard' && activePage.startsWith('admin-'));
        return (
          <button
            key={item.id}
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            style={isActive ? { color: roleColor, background: `${roleColor}15` } : {}}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
