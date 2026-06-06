import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, ArrowLeftRight, Wallet, History,
  MapPin, ShieldAlert, Users, Settings, LogOut, QrCode, Store, X, Sun, Moon
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, mobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const merchantNav = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'transaction', label: 'Nouvelle transaction', icon: ArrowLeftRight },
    { id: 'wallet', label: 'Portefeuille', icon: Wallet },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'geolocation', label: 'Partenaires', icon: MapPin },
  ];
  const customerNav = [
    { id: 'customer-wallet', label: 'Mon portefeuille', icon: Wallet },
    { id: 'customer-qr', label: 'Mon QR Code', icon: QrCode },
    { id: 'history', label: 'Historique', icon: History },
    { id: 'geolocation', label: 'Trouver partenaire', icon: MapPin },
  ];
  const partnerNav = [
    { id: 'partner-dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'partner-scan', label: 'Scanner QR Code', icon: QrCode },
    { id: 'wallet', label: 'Portefeuille', icon: Wallet },
    { id: 'history', label: 'Historique', icon: History },
  ];
  const adminNav = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Utilisateurs', icon: Users },
    { id: 'admin-transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'admin-fraud', label: 'Fraudes', icon: ShieldAlert },
    { id: 'admin-partners', label: 'Partenaires', icon: Store },
    { id: 'admin-commissions', label: 'Commissions', icon: Wallet },
  ];

  const navMap: Record<string, typeof merchantNav> = {
    merchant: merchantNav, customer: customerNav, partner: partnerNav, admin: adminNav,
  };
  const nav = navMap[user?.role || 'merchant'] || merchantNav;

  const roleColors: Record<string, string> = {
    merchant: '#00d4ff', customer: '#10b981', partner: '#7c3aed', admin: '#f59e0b',
  };
  const roleLabels: Record<string, string> = {
    merchant: 'Commerçant', customer: 'Client', partner: 'Partenaire', admin: 'Administrateur',
  };
  const roleColor = roleColors[user?.role || 'merchant'];

  const handleNav = (id: string) => {
    onNavigate(id);
    onMobileClose?.();
  };

  const handleLogout = () => {
    logout();
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="drawer-overlay open" onClick={onMobileClose} />
      )}

      <div className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 15, color: '#0a0f1e',
            }}>S</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text)', lineHeight: 1 }}>SmartChange</div>
              <div style={{ fontSize: 10, color: roleColor, fontWeight: 600, letterSpacing: '0.05em' }}>AI</div>
            </div>
          </div>
          <button onClick={onMobileClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'none' }} className="close-sidebar-btn">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `${roleColor}22`, border: `2px solid ${roleColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: roleColor,
            }}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.prenom} {user?.nom}
              </div>
              <div style={{ fontSize: 11, color: roleColor, fontWeight: 600 }}>{roleLabels[user?.role || 'merchant']}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button key={item.id} onClick={() => handleNav(item.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                background: isActive ? `${roleColor}18` : 'transparent',
                border: isActive ? `1px solid ${roleColor}33` : '1px solid transparent',
                color: isActive ? roleColor : 'var(--text-muted)',
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
              }}>
                <Icon size={16} />{item.label}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Apparence</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', borderRadius: 'var(--radius-sm)',
                background: theme === 'light' ? 'rgba(245,158,11,0.12)' : 'var(--bg-surface)',
                border: theme === 'light' ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)',
                color: theme === 'light' ? '#d97706' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              <Sun size={13} /> Clair
            </button>
            <button
              onClick={() => setTheme('dark')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px', borderRadius: 'var(--radius-sm)',
                background: theme === 'dark' ? 'rgba(0,212,255,0.12)' : 'var(--bg-surface)',
                border: theme === 'dark' ? '1px solid rgba(0,212,255,0.4)' : '1px solid var(--border)',
                color: theme === 'dark' ? '#00d4ff' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              <Moon size={13} /> Sombre
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => handleNav('settings')} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: activePage === 'settings' ? 'var(--bg-surface)' : 'transparent',
            border: '1px solid transparent', color: 'var(--text-muted)',
            fontSize: 14, cursor: 'pointer', marginBottom: 4, fontFamily: 'var(--font-body)',
          }}>
            <Settings size={16} />Paramètres
          </button>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'transparent', border: '1px solid transparent',
            color: 'var(--danger)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            <LogOut size={16} />Déconnexion
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
