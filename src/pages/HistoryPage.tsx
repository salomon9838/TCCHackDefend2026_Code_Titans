import React, { useState } from 'react';
import { Search, Download, Eye, X, Clock } from 'lucide-react';
import { mockTransactions } from '../data/mockData';
import type { Transaction } from '../types';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  validee:    { label: 'Validée',    color: 'var(--success)',    bg: 'var(--success-dim)' },
  en_attente: { label: 'En attente', color: 'var(--warning)',    bg: 'var(--warning-dim)' },
  annulee:    { label: 'Annulée',    color: 'var(--danger)',     bg: 'var(--danger-dim)'  },
  expiree:    { label: 'Expirée',    color: 'var(--text-muted)', bg: 'var(--bg-surface)'  },
};

const HistoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = mockTransactions.filter(tx => {
    const matchSearch = tx.transactionId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || tx.statut === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">Historique</h1>
          <p className="page-subtitle">{mockTransactions.length} transactions</p>
        </div>
        <button className="btn btn-secondary btn-sm"><Download size={13} /> Exporter</button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une référence..." style={{ paddingLeft: 42 }} />
      </div>

      {/* Status filters — scrollable on mobile */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'validee', label: 'Validées' },
          { id: 'en_attente', label: 'En attente' },
          { id: 'annulee', label: 'Annulées' },
          { id: 'expiree', label: 'Expirées' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilterStatus(f.id)}
            className="btn btn-sm"
            style={{
              whiteSpace: 'nowrap', flexShrink: 0,
              background: filterStatus === f.id ? 'var(--primary-dim)' : 'var(--bg-surface)',
              border: `1px solid ${filterStatus === f.id ? 'var(--primary)' : 'var(--border)'}`,
              color: filterStatus === f.id ? 'var(--primary)' : 'var(--text-muted)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Mobile: card list */}
      <div className="mobile-tx-list" style={{ display: 'none', flexDirection: 'column', gap: 8 }}>
        {filtered.map(tx => {
          const s = statusConfig[tx.statut];
          return (
            <div key={tx.transactionId} className="card" style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setSelected(tx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)', marginBottom: 3 }}>{tx.transactionId}</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{tx.montantAchat.toLocaleString('fr')} F <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>achat</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    <Clock size={10} />
                    {new Date(tx.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--warning)', marginBottom: 4 }}>{tx.monnaieARendre.toLocaleString('fr')} F</div>
                  <span style={{ padding: '2px 9px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Aucune transaction trouvée</div>}
      </div>

      {/* Desktop: table */}
      <div className="desktop-tx-table">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Achat</th>
                  <th>Monnaie rendue</th>
                  <th className="hide-mobile">Frais</th>
                  <th className="hide-mobile">Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const s = statusConfig[tx.statut];
                  return (
                    <tr key={tx.transactionId}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)' }}>{tx.transactionId}</span></td>
                      <td style={{ fontWeight: 600 }}>{tx.montantAchat.toLocaleString('fr')} F</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{tx.monnaieARendre.toLocaleString('fr')} F</td>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)' }}>{tx.fraisService} F</td>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />{new Date(tx.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span></td>
                      <td><button onClick={() => setSelected(tx)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}><Eye size={12} /></button></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>Aucune transaction trouvée</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease' }}
          onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
            borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480,
            animation: 'fadeUp 0.25s ease',
          }}>
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Détails de la transaction</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)', marginBottom: 4 }}>{selected.transactionId}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{selected.monnaieARendre.toLocaleString('fr')} F CFA</div>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: statusConfig[selected.statut].bg, color: statusConfig[selected.statut].color, display: 'inline-block', marginTop: 6 }}>
                {statusConfig[selected.statut].label}
              </span>
            </div>
            {[
              { label: 'Montant achat', value: `${selected.montantAchat.toLocaleString('fr')} F` },
              { label: 'Montant payé', value: `${selected.montantPaye.toLocaleString('fr')} F` },
              { label: 'Frais de service', value: `${selected.fraisService} F` },
              { label: 'Date', value: new Date(selected.createdAt).toLocaleString('fr-FR') },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
            <button className="btn btn-secondary btn-full" style={{ marginTop: 16 }} onClick={() => setSelected(null)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
