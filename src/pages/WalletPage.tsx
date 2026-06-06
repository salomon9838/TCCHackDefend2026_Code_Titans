import React from 'react';
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

const WalletPage: React.FC = () => {

  const wallet = {
    balance: 12500,
    balanceEnAttente: 3200,
    revenusGeneres: 847500,
    totalCommissions: 4235,
  };

  const operations = [
    { id: 1, type: 'credit', label: 'Commission TXN-001', amount: 5, date: '2024-01-15 10:30', ref: 'TXN-001' },
    { id: 2, type: 'credit', label: 'Commission TXN-003', amount: 5, date: '2024-01-15 09:15', ref: 'TXN-003' },
    { id: 3, type: 'debit', label: 'Retrait portefeuille', amount: 500, date: '2024-01-14 18:00', ref: 'WDR-001' },
    { id: 4, type: 'credit', label: 'Commission TXN-006', amount: 5, date: '2024-01-13 12:00', ref: 'TXN-006' },
    { id: 5, type: 'credit', label: 'Commission TXN-009', amount: 5, date: '2024-01-12 11:00', ref: 'TXN-009' },
    { id: 6, type: 'debit', label: 'Retrait portefeuille', amount: 1000, date: '2024-01-10 16:00', ref: 'WDR-002' },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Portefeuille</h1>
        <p className="page-subtitle">Gérez vos soldes et commissions SmartChange</p>
      </div>

      {/* Main balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2040 0%, #1a0a35 100%)',
        border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-lg)',
        padding: 32,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,212,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 200, width: 250, height: 250, borderRadius: '50%', background: 'rgba(124,58,237,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Wallet size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solde disponible</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 900, lineHeight: 1, color: 'white' }}>
              {wallet.balance.toLocaleString('fr')}
              <span style={{ fontSize: 22, fontWeight: 400, color: 'var(--primary)', marginLeft: 8 }}>F CFA</span>
            </div>
          </div>
          <button className="btn btn-primary">
            <RefreshCw size={14} /> Retirer
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={11} /> En attente
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>{wallet.balanceEnAttente.toLocaleString('fr')} F</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={11} /> Revenus totaux
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{(wallet.revenusGeneres / 1000).toFixed(0)}K F</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              💰 Commissions
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#a78bfa' }}>{wallet.totalCommissions.toLocaleString('fr')} F</div>
          </div>
        </div>
      </div>

      {/* Commission breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Plateforme SmartChange', amount: '10 F / txn', color: 'var(--primary)', icon: '🏦', desc: '50% des frais' },
          { label: 'Votre commission (émetteur)', amount: '5 F / txn', color: 'var(--success)', icon: '🏪', desc: '25% des frais' },
          { label: 'Commission partenaire', amount: '5 F / txn', color: '#a78bfa', icon: '🤝', desc: '25% des frais' },
        ].map((item, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.amount}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Operations history */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Historique des opérations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {operations.map(op => (
            <div key={op.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: op.type === 'credit' ? 'var(--success-dim)' : 'var(--danger-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: op.type === 'credit' ? 'var(--success)' : 'var(--danger)',
                flexShrink: 0,
              }}>
                {op.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{op.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{op.ref} · {new Date(op.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: op.type === 'credit' ? 'var(--success)' : 'var(--danger)',
              }}>
                {op.type === 'credit' ? '+' : '-'}{op.amount.toLocaleString('fr')} F
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
