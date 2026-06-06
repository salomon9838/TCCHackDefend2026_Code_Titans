import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Sidebar from './components/Sidebar';
import TopbarMobile from './components/TopbarMobile';
import BottomNav from './components/BottomNav';
import DashboardPage from './pages/DashboardPage';
import TransactionPage from './pages/TransactionPage';
import WalletPage from './pages/WalletPage';
import HistoryPage from './pages/HistoryPage';
import GeolocationPage from './pages/GeolocationPage';
import AdminPage from './pages/AdminPage';
import CustomerWalletPage from './pages/CustomerWalletPage';
import PartnerScanPage from './pages/PartnerScanPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage';
import SettingsPage from './pages/SettingsPage';

const getDefaultPage = (role: string) => {
  const map: Record<string, string> = {
    merchant: 'dashboard',
    customer: 'customer-wallet',
    partner: 'partner-scan',
    admin: 'admin-dashboard',
  };
  return map[role] || 'dashboard';
};

// Detect if the user is on the secret admin URL
const isAdminRoute = () => {
  return window.location.pathname === '/admin-login' ||
    window.location.hash === '#/admin-login';
};

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState(() => getDefaultPage(user?.role || 'merchant'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminRoute, setAdminRoute] = useState(isAdminRoute);

  // Monitor URL changes for admin route
  useEffect(() => {
    const handleHashChange = () => setAdminRoute(isAdminRoute());
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  React.useEffect(() => {
    if (user) setActivePage(getDefaultPage(user.role));
  }, [user?.role]);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  // Admin secret route — show special login if not authenticated as admin
  if (adminRoute) {
    if (!isAuthenticated || user?.role !== 'admin') {
      return (
        <AdminLoginPage onSuccess={() => {
          // After login, redirect away from admin-login to the main admin dashboard
          window.history.replaceState({}, '', '/');
          setAdminRoute(false);
        }} />
      );
    }
  }

  // Regular users: not authenticated → show normal login (no admin option)
  if (!isAuthenticated) return <LoginPage />;

  // If authenticated as admin but NOT on admin route, redirect them to admin panel
  // (admin accounts can only be accessed via /admin-login)
  if (user?.role === 'admin' && !adminRoute) {
    // Admin is logged in from admin-login route — this is fine, show admin UI
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':         return <DashboardPage onNavigate={handleNavigate} />;
      case 'transaction':       return <TransactionPage />;
      case 'wallet':            return <WalletPage />;
      case 'history':           return <HistoryPage />;
      case 'geolocation':       return <GeolocationPage />;
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-transactions':
      case 'admin-fraud':
      case 'admin-partners':
      case 'admin-commissions': return <AdminPage activePage={activePage} />;
      case 'customer-wallet':
      case 'customer-qr':       return <CustomerWalletPage onNavigate={handleNavigate} />;
      case 'partner-dashboard': return <PartnerDashboardPage onNavigate={handleNavigate} />;
      case 'partner-scan':      return <PartnerScanPage />;
      case 'settings':          return <SettingsPage />;
      default:                  return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="page">
      {/* Mobile topbar */}
      <TopbarMobile onMenuOpen={() => setSidebarOpen(true)} pageTitle={activePage} />

      {/* Sidebar (desktop fixed, mobile drawer) */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav activePage={activePage} onNavigate={handleNavigate} />
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
