import React from 'react';
import { TrendingUp, TrendingDown, ArrowLeftRight, Users, Wallet, ArrowUpRight, Clock } from 'lucide-react';
import { mockDashboardStats, mockChartData, mockTransactions } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StatCard: React.FC<{ label: string; value: string; change?: number; icon: React.ReactNode; color: string }> = ({ label, value, change, icon, color }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(change)}%
        </div>
      )}
    </div>
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  validee:    { label: 'Validée',    color: 'var(--success)',     bg: 'var(--success-dim)' },
  en_attente: { label: 'En attente', color: 'var(--warning)',     bg: 'var(--warning-dim)' },
  annulee:    { label: 'Annulée',    color: 'var(--danger)',      bg: 'var(--danger-dim)'  },
  expiree:    { label: 'Expirée',    color: 'var(--text-muted)',  bg: 'var(--bg-surface)'  },
};

const DashboardPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const stats = mockDashboardStats;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
        {payload.map((p: any) => <div key={p.key} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Activité du jour</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('transaction')} style={{ whiteSpace: 'nowrap' }}>
          <ArrowLeftRight size={14} /> Nouvelle transaction
        </button>
      </div>

      {/* Stats grid — 2 cols on mobile, 4 on desktop */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label="Transactions" value={stats.totalTransactions.toLocaleString('fr')} change={12.5} icon={<ArrowLeftRight size={18} />} color="var(--primary)" />
        <StatCard label="Revenus du jour" value={`${stats.revenusJour.toLocaleString('fr')} F`} change={8.2} icon={<Wallet size={18} />} color="var(--success)" />
        <StatCard label="Revenus du mois" value={`${(stats.revenusMois / 1000).toFixed(0)}K F`} change={-3.1} icon={<TrendingUp size={18} />} color="var(--warning)" />
        <StatCard label="Clients actifs" value={stats.totalClients.toLocaleString('fr')} change={5.7} icon={<Users size={18} />} color="#a78bfa" />
      </div>

      {/* Monnaie distribuée / récupérée */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{(stats.monnaieDistribuee / 1000).toFixed(0)}K F</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Monnaie distribuée</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>{(stats.monnaieRecuperee / 1000).toFixed(0)}K F</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Récupérée</div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Transactions / jour</div>
            <div style={{ fontSize: 11, background: 'var(--primary-dim)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 100, fontWeight: 600 }}>7 jours</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={mockChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="jour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="transactions" name="Transactions" stroke="var(--primary)" strokeWidth={2} fill="url(#grad1)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Revenus</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mockChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="jour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenus" name="Revenus" fill="var(--success)" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Transactions récentes</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('history')}>
            Voir tout <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Mobile: cards */}
        <div className="mobile-tx-list" style={{ display: 'none' }}>
          {mockTransactions.slice(0, 4).map(tx => {
            const s = statusConfig[tx.statut];
            return (
              <div key={tx.transactionId} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)', marginBottom: 2 }}>{tx.transactionId}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.montantAchat.toLocaleString('fr')} F achat</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <Clock size={10} />
                    {new Date(tx.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: 15 }}>{tx.monnaieARendre.toLocaleString('fr')} F</div>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="desktop-tx-table">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Achat</th>
                  <th>Monnaie</th>
                  <th className="hide-mobile">Frais</th>
                  <th className="hide-mobile">Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.slice(0, 5).map(tx => {
                  const s = statusConfig[tx.statut];
                  return (
                    <tr key={tx.transactionId}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)' }}>{tx.transactionId}</span></td>
                      <td style={{ fontWeight: 600 }}>{tx.montantAchat.toLocaleString('fr')} F</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{tx.monnaieARendre.toLocaleString('fr')} F</td>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>{tx.fraisService} F</td>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{new Date(tx.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
