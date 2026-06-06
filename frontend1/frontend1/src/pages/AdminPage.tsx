import React, { useState, useEffect } from 'react';
import { Users, ArrowLeftRight, ShieldAlert, Wallet, TrendingUp, Eye, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { getDashboardStats, getAdminUsers, getAdminTransactions, getAdminFraudReports, getAdminCommissions } from '../api';
import { mockChartData } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { User, Transaction, FraudReport, CommissionHistory, DashboardStats } from '../types';

type AdminTab = 'dashboard' | 'users' | 'transactions' | 'fraud' | 'commissions';

const roleColors: Record<string, string> = {
  merchant: 'var(--primary)',
  customer: 'var(--success)',
  partner: '#a78bfa',
  admin: 'var(--warning)',
};
const roleLabels: Record<string, string> = { merchant: 'Commerçant', customer: 'Client', partner: 'Partenaire', admin: 'Admin' };

interface AdminPageProps {
  activePage?: string;
}

const AdminPage: React.FC<AdminPageProps> = ({ activePage }) => {
  // Map sidebar activePage to internal tab
  const getTabFromPage = (page?: string): AdminTab => {
    const map: Record<string, AdminTab> = {
      'admin-dashboard': 'dashboard',
      'admin-users': 'users',
      'admin-transactions': 'transactions',
      'admin-fraud': 'fraud',
      'admin-partners': 'users',
      'admin-commissions': 'commissions',
    };
    return map[page || ''] || 'dashboard';
  };

  const [tab, setTab] = useState<AdminTab>(() => getTabFromPage(activePage));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>([]);
  const [commissions, setCommissions] = useState<CommissionHistory[]>([]);

  // Sync tab when activePage changes from sidebar
  React.useEffect(() => {
    setTab(getTabFromPage(activePage));
  }, [activePage]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [dashboard, usersData, txData, fraudData, commissionData] = await Promise.all([
          getDashboardStats(),
          getAdminUsers(),
          getAdminTransactions(),
          getAdminFraudReports(),
          getAdminCommissions(),
        ]);
        setStats(dashboard);
        setUsers(usersData);
        setTransactions(txData);
        setFraudReports(fraudData);
        setCommissions(commissionData);
      } catch (error) {
        console.error('Erreur de chargement admin', error);
      }
    }
    loadAdminData();
  }, []);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Vue globale', icon: <TrendingUp size={15} /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users size={15} /> },
    { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={15} /> },
    { id: 'fraud', label: 'Fraudes', icon: <ShieldAlert size={15} /> },
    { id: 'commissions', label: 'Commissions', icon: <Wallet size={15} /> },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-muted)' }}>{label}</div>
        {payload.map((p: any) => <div key={p.key} style={{ color: p.color, fontWeight: 600 }}>{p.value}</div>)}
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Administration</h1>
        <p className="page-subtitle">Gestion complète de la plateforme SmartChange AI</p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', marginBottom: 24, width: 'fit-content', border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: tab === t.id ? 'var(--bg-card)' : 'transparent',
            border: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', transition: 'all 0.15s',
          }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Dashboard tab */}
      {tab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Transactions totales', value: `${stats?.totalTransactions.toLocaleString('fr') ?? '0'}`, color: 'var(--primary)', icon: '🔄' },
              { label: 'Revenu journalier', value: `${stats?.revenusJour.toLocaleString('fr') ?? '0'} F`, color: 'var(--success)', icon: '💰' },
              { label: 'Clients actifs', value: `${stats?.totalClients.toLocaleString('fr') ?? '0'}`, color: '#a78bfa', icon: '👥' },
              { label: 'Montant distribué', value: `${stats?.monnaieDistribuee.toLocaleString('fr') ?? '0'} F`, color: 'var(--warning)', icon: '🚨' },
            ].map((s, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Transactions par jour</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="jour" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="transactions" stroke="var(--primary)" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Répartition des commissions</div>
              {[
                { label: 'Plateforme', pct: 50, amount: '12 470 F', color: 'var(--primary)' },
                { label: 'Commerçants', pct: 25, amount: '6 235 F', color: 'var(--success)' },
                { label: 'Partenaires', pct: 25, amount: '6 235 F', color: '#a78bfa' },
              ].map((c, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{c.label}</span>
                    <span style={{ color: c.color, fontWeight: 600 }}>{c.amount}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>{users.length} utilisateurs</span>
            <button className="btn btn-primary btn-sm">+ Ajouter</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Email / Téléphone</th>
                <th>Inscrit le</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{`${u.prenom} ${u.nom}`}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: `${roleColors[u.role]}18`, color: roleColors[u.role] }}>
                      {roleLabels[u.role] ?? u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email || u.telephone}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: u.statut === 'actif' ? 'var(--success-dim)' : 'var(--danger-dim)', color: u.statut === 'actif' ? 'var(--success)' : 'var(--danger)' }}>
                      {u.statut}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}><Eye size={12} /></button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: u.statut === 'actif' ? 'var(--danger)' : 'var(--success)' }}>
                      {u.statut === 'actif' ? <Ban size={12} /> : <CheckCircle size={12} />}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>Chargement des utilisateurs...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions tab */}
      {tab === 'transactions' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Toutes les transactions</div>
          <table className="table">
            <thead>
              <tr><th>Référence</th><th>Achat</th><th>Monnaie</th><th>Frais</th><th>Date</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map(tx => (
                <tr key={tx.transactionId}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)' }}>{tx.transactionId}</span></td>
                  <td style={{ fontWeight: 600 }}>{tx.montantAchat.toLocaleString('fr')} F</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{tx.monnaieARendre.toLocaleString('fr')} F</td>
                  <td style={{ color: 'var(--text-muted)' }}>{tx.fraisService.toLocaleString('fr')} F</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    {(() => {
                      const s = { validee: { label: 'Validée', color: 'var(--success)', bg: 'var(--success-dim)' }, en_attente: { label: 'En attente', color: 'var(--warning)', bg: 'var(--warning-dim)' }, annulee: { label: 'Annulée', color: 'var(--danger)', bg: 'var(--danger-dim)' }, expiree: { label: 'Expirée', color: 'var(--text-muted)', bg: 'var(--bg-surface)' } }[tx.statut];
                      return <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: s?.bg, color: s?.color }}>{s?.label}</span>;
                    })()}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>Chargement des transactions...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Fraud tab */}
      {tab === 'fraud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 8 }}>
            <div className="card" style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)' }}>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--danger)' }}>3</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fraudes détectées</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--warning)' }}>65</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Score moyen de risque</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--success)' }}>2</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Transactions bloquées</div>
            </div>
          </div>

          {fraudReports.length > 0 ? fraudReports.map(fr => {
            const riskColor = fr.scoreRisque > 70 ? 'var(--danger)' : fr.scoreRisque > 40 ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={fr.fraudId} className="card" style={{ border: `1px solid ${riskColor}33` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${riskColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: riskColor }}>
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{fr.typeFraude}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{fr.fraudId} · {fr.transactionId}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ background: `${riskColor}18`, color: riskColor, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                      Score: {fr.scoreRisque}/100
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--text-muted)' }}>{fr.description}</div>
                <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${fr.scoreRisque}%`, background: riskColor, borderRadius: 3 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Détecté le {new Date(fr.dateDetection).toLocaleString('fr-FR')}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm"><Eye size={13} /> Voir</button>
                    <button className="btn btn-sm" style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                      <Ban size={13} /> Bloquer
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>Chargement des rapports de fraude...</div>
          )}
        </div>
      )}

      {/* Commissions tab */}
      {tab === 'commissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Plateforme SmartChange', total: '12 470 F', taux: '10 F/txn', color: 'var(--primary)', icon: '🏦' },
              { label: 'Commerçants (émetteurs)', total: '6 235 F', taux: '5 F/txn', color: 'var(--success)', icon: '🏪' },
              { label: 'Partenaires', total: '6 235 F', taux: '5 F/txn', color: '#a78bfa', icon: '🤝' },
            ].map((c, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: c.color }}>{c.total}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.taux}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Modèle économique</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>20 F CFA de frais par transaction répartis comme suit :</div>
            <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
              <div style={{ flex: 1, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0a0f1e' }}>10 F — Plateforme</div>
              <div style={{ flex: 0.5, background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0a0f1e' }}>5 F — Commerçants</div>
              <div style={{ flex: 0.5, background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0a0f1e' }}>5 F — Partenaires</div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Historique des commissions récentes</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.length > 0 ? commissions.map(c => (
                  <tr key={c.commissionId}>
                    <td style={{ textTransform: 'capitalize' }}>{c.typeCommission.replace('_', ' ')}</td>
                    <td style={{ fontWeight: 700 }}>{c.montantCommission.toLocaleString('fr')} F</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(c.dateCommission).toLocaleDateString('fr-FR')}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>Chargement des commissions...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
