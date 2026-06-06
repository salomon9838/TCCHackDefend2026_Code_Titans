import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarMobileProps {
  onMenuOpen: () => void;
  pageTitle?: string;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Tableau de bord',
  transaction: 'Nouvelle transaction',
  wallet: 'Portefeuille',
  history: 'Historique',
  geolocation: 'Partenaires',
  'customer-wallet': 'Mon portefeuille',
  'customer-qr': 'Mon QR Code',
  'partner-scan': 'Scanner QR',
  'partner-dashboard': 'Tableau de bord',
  'admin-dashboard': 'Administration',
  'admin-users': 'Utilisateurs',
  'admin-transactions': 'Transactions',
  'admin-fraud': 'Fraudes',
  'admin-partners': 'Partenaires',
  'admin-commissions': 'Commissions',
  settings: 'Paramètres',
};

const TopbarMobile: React.FC<TopbarMobileProps> = ({ onMenuOpen, pageTitle = '' }) => {
  const { user } = useAuth();
  const roleColors: Record<string, string> = {
    merchant: '#00d4ff', customer: '#10b981', partner: '#7c3aed', admin: '#f59e0b',
  };
  const roleColor = roleColors[user?.role || 'merchant'];
  const title = pageTitles[pageTitle] || 'SmartChange AI';

  return (
    <div className="topbar-mobile">
      {/* Hamburger */}
      <button onClick={onMenuOpen} style={{
        background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer',
        padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center',
      }}>
        <Menu size={22} />
      </button>

      {/* Logo + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 13, color: '#0a0f1e',
        }}>S</div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{title}</span>
      </div>

      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `${roleColor}22`, border: `1.5px solid ${roleColor}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: roleColor,
      }}>
        {user?.prenom?.[0]}{user?.nom?.[0]}
      </div>
    </div>
  );
};

export default TopbarMobile;
