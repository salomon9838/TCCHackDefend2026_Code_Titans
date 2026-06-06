import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { getWallet, getTransactions, withdrawWallet } from '../api';
import type { Wallet as WalletType, Transaction } from '../types';

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [walletData, transactionData] = await Promise.all([getWallet(), getTransactions()]);
        setWallet(walletData);
        setTransactions(transactionData);
      } catch (error) {
        console.error('Impossible de charger le portefeuille', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const operations = transactions.slice(0, 6).map((tx, i) => ({
    id: i,
    type: 'credit' as const,
    label: tx.transactionId,
    amount: tx.monnaieARendre ?? tx.montantAchat ?? 0,
    date: tx.createdAt,
    ref: tx.transactionId,
  }));

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const response = await withdrawWallet();
      setWallet(response.wallet);
      alert(`Retrait de ${response.withdrawn.toLocaleString('fr')} F CFA effectué.`);
    } catch (error) {
      console.error('Erreur de retrait', error);
      alert((error as Error).message || 'Impossible de retirer le solde.');
    } finally {
      setWithdrawing(false);
    }
  };

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
              {loading ? '...' : (wallet?.balance ?? 0).toLocaleString('fr')}
              <span style={{ fontSize: 22, fontWeight: 400, color: 'var(--primary)', marginLeft: 8 }}>F CFA</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleWithdraw} disabled={loading || withdrawing}>
            <RefreshCw size={14} /> {withdrawing ? 'Retrait...' : 'Retirer'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, position: 'relative' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={11} /> En attente
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>{loading ? '...' : (wallet?.balanceEnAttente ?? 0).toLocaleString('fr')} F</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={11} /> Revenus totaux
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{loading ? '...' : ((wallet?.revenusGeneres ?? 0) / 1000).toFixed(0)}K F</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              💰 Revenus générés
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#a78bfa' }}>{loading ? '...' : (wallet?.revenusGeneres ?? 0).toLocaleString('fr')} F</div>
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
