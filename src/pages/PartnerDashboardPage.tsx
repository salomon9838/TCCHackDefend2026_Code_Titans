import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, Clock, XCircle, ArrowUpRight, Coins } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data spécifique au partenaire
const partnerStats = {
  monnaieRemboursee: 4830,        // total monnaie remboursée par ce partenaire
  commissionsGagnees: 115,        // commissions gagnées aujourd'hui (visible sur l'écran scanner)
  commissionsMois: 890,           // commissions du mois
  transactionsValidees: 23,       // validées aujourd'hui
  transactionsEnAttente: 3,       // en attente
  transactionsTotal: 26,          // total du jour
};

const partnerChartData = [
  { jour: 'Lun', remboursements: 620, commissions: 12 },
  { jour: 'Mar', remboursements: 850, commissions: 17 },
  { jour: 'Mer', remboursements: 490, commissions: 10 },
  { jour: 'Jeu', remboursements: 970, commissions: 19 },
  { jour: 'Ven', remboursements: 1100, commissions: 22 },
  { jour: 'Sam', remboursements: 680, commissions: 14 },
  { jour: 'Dim', remboursements: 4830, commissions: 115 },
];

// Derniers remboursements effectués par ce partenaire
const partnerRecentReimbursements = [
  { ref: 'TXN-002', montant: 250, commission: 5, heure: '11:00', statut: 'validee' },
  { ref: 'TXN-011', montant: 380, commission: 5, heure: '10:32', statut: 'validee' },
  { ref: 'TXN-019', montant: 50,  commission: 5, heure: '10:15', statut: 'validee' },
  { ref: 'TXN-024', montant: 200, commission: 5, heure: '09:48', statut: 'en_attente' },
  { ref: 'TXN-031', montant: 800, commission: 5, heure: '09:20', statut: 'validee' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  validee:    { label: 'Remboursé',   color: 'var(--success)',    bg: 'var(--success-dim)' },
  en_attente: { label: 'En attente',  color: 'var(--warning)',    bg: 'var(--warning-dim)' },
  annulee:    { label: 'Annulé',      color: 'var(--danger)',     bg: 'var(--danger-dim)'  },
};

const StatCard: React.FC<{
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  sublabel?: string;
}> = ({ label, value, change, icon, color, sublabel }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
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
      {sublabel && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{sublabel}</div>}
    </div>
  </div>
);

const PartnerDashboardPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.key} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value} F</div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Mes statistiques du jour</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('partner-scan')} style={{ whiteSpace: 'nowrap' }}>
          <CheckCircle size={14} /> Scanner un QR Code
        </button>
      </div>

      {/* Stats grid — 2 cols mobile, 4 desktop */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard
          label="Commissions aujourd'hui"
          value={`${partnerStats.commissionsGagnees} F`}
          change={8.2}
          icon={<Coins size={18} />}
          color="#a78bfa"
        />
        <StatCard
          label="Commissions du mois"
          value={`${partnerStats.commissionsMois} F`}
          change={14.3}
          icon={<TrendingUp size={18} />}
          color="var(--success)"
        />
        <StatCard
          label="Monnaie remboursée"
          value={`${partnerStats.monnaieRemboursee.toLocaleString('fr')} F`}
          sublabel="Cumulé aujourd'hui"
          icon={<CheckCircle size={18} />}
          color="var(--primary)"
        />
        <StatCard
          label="Remboursements"
          value={`${partnerStats.transactionsValidees} / ${partnerStats.transactionsTotal}`}
          sublabel={`${partnerStats.transactionsEnAttente} en attente`}
          icon={<Clock size={18} />}
          color="var(--warning)"
        />
      </div>

      {/* Résumé visuel — 2 cartes accent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center', padding: '14px', background: 'linear-gradient(135deg, var(--primary-dim), transparent)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>
            {partnerStats.monnaieRemboursee.toLocaleString('fr')} F
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Monnaie remboursée aujourd'hui</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '14px', background: 'linear-gradient(135deg, rgba(167,139,250,0.12), transparent)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#a78bfa' }}>
            {partnerStats.commissionsGagnees} F
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Mes commissions gagnées</div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Remboursements / jour</div>
            <div style={{ fontSize: 11, background: 'var(--primary-dim)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 100, fontWeight: 600 }}>7 jours</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={partnerChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPartner" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="jour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9,  fill: 'var(--text-dim)' }}  axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="remboursements" name="Remboursements" stroke="var(--primary)" strokeWidth={2} fill="url(#gradPartner)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Commissions</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={partnerChartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="jour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9,  fill: 'var(--text-dim)' }}  axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="commissions" name="Commissions" fill="#a78bfa" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Derniers remboursements */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Mes derniers remboursements</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('history')}>
            Voir tout <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Mobile: cards */}
        <div className="mobile-tx-list" style={{ display: 'none' }}>
          {partnerRecentReimbursements.map((tx, i) => {
            const s = statusConfig[tx.statut];
            return (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)', marginBottom: 2 }}>{tx.ref}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Remboursé {tx.montant} F</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tx.heure}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: 14 }}>+{tx.commission} F</div>
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
                  <th>Montant remboursé</th>
                  <th>Ma commission</th>
                  <th className="hide-mobile">Heure</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {partnerRecentReimbursements.map((tx, i) => {
                  const s = statusConfig[tx.statut];
                  return (
                    <tr key={i}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)' }}>{tx.ref}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--warning)' }}>{tx.montant.toLocaleString('fr')} F</td>
                      <td style={{ fontWeight: 700, color: '#a78bfa' }}>+{tx.commission} F</td>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{tx.heure}</td>
                      <td><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé commissions en bas */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(167,139,250,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Total commissions ({partnerStats.transactionsValidees} remboursements)
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: '#a78bfa' }}>
            {partnerStats.commissionsGagnees} F
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
