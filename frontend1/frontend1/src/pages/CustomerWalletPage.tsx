import React, { useState, useEffect } from 'react';
import { QrCode, Wallet as WalletIcon, Clock, MapPin, Plus, ChevronRight } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { getWallet, getTransactions } from '../api';
import type { Wallet as WalletType } from '../types';

const CustomerWalletPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [credits, setCredits] = useState<Array<{ ref: string; montant: number; merchant: string; expires: string; statut: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        const [walletData, transactionData] = await Promise.all([getWallet(), getTransactions()]);
        setWallet(walletData);
        setCredits(transactionData
          .filter(tx => tx.statut === 'validee')
          .map(tx => ({
            ref: tx.transactionId,
            montant: tx.monnaieARendre,
            merchant: tx.merchantName || 'SmartChange',
            expires: tx.createdAt,
            statut: 'actif',
          })));
      } catch (error) {
        console.error('Impossible de charger le portefeuille client', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
    QRCodeLib.toDataURL(JSON.stringify({ clientId: 'C1', nom: 'SmartChange Client', type: 'personal' }), {
      width: 180, margin: 2, color: { dark: '#000', light: '#fff' }, errorCorrectionLevel: 'H',
    }).then(setQrDataUrl);
  }, []);

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Mon Portefeuille</h1>
        <p className="page-subtitle">Gérez vos crédits SmartChange</p>
      </div>

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #0a2918, #0d2040)',
        border: '1px solid var(--success)',
        borderRadius: 'var(--radius-lg)',
        padding: 28,
        marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(16,185,129,0.06)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <WalletIcon size={14} /> Solde total disponible
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: 'white' }}>
          {loading ? '...' : (wallet?.balance ?? 0).toLocaleString('fr')} <span style={{ fontSize: 20, color: 'var(--success)', fontWeight: 400 }}>F CFA</span>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button className="btn btn-sm" style={{ background: 'var(--success)', color: '#0a2918' }} onClick={() => onNavigate('geolocation')}>
            <MapPin size={13} /> Utiliser ce crédit
          </button>
          <button className="btn btn-ghost btn-sm">
            <Plus size={13} /> Ajouter un crédit
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* QR Code personnel */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <QrCode size={14} /> Mon QR Code personnel
          </div>
          {qrDataUrl && (
            <div style={{ background: 'white', padding: 12, borderRadius: 10, display: 'inline-block', marginBottom: 10 }}>
              <img src={qrDataUrl} alt="QR personnel" style={{ width: 140, height: 140, display: 'block' }} />
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ID: C1-KLOUVI-JP</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Crédits actifs', value: loading ? '...' : credits.length.toString(), color: 'var(--success)' },
            { label: 'Solde disponible', value: loading ? '...' : `${(wallet?.balance ?? 0).toLocaleString('fr')} F`, color: 'var(--primary)' },
            { label: 'En attente', value: loading ? '...' : `${(wallet?.balanceEnAttente ?? 0).toLocaleString('fr')} F`, color: 'var(--warning)' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credits list */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Mes crédits SmartChange</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {credits.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 14, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${c.statut === 'actif' ? 'var(--border)' : 'var(--border)'}`,
              opacity: c.statut === 'expiré' ? 0.5 : 1,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: c.statut === 'actif' ? 'var(--success-dim)' : 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.statut === 'actif' ? 'var(--success)' : 'var(--text-muted)', flexShrink: 0,
              }}>
                <QrCode size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.merchant}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {c.ref} · <Clock size={10} style={{ display: 'inline' }} /> Expire: {new Date(c.expires).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: c.statut === 'actif' ? 'var(--warning)' : 'var(--text-muted)' }}>{c.montant.toLocaleString('fr')} F</div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                  background: c.statut === 'actif' ? 'var(--success-dim)' : 'var(--bg-card)',
                  color: c.statut === 'actif' ? 'var(--success)' : 'var(--text-muted)',
                }}>{c.statut}</span>
              </div>
              {c.statut === 'actif' && (
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('geolocation')}>
                  Utiliser <ChevronRight size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerWalletPage;
