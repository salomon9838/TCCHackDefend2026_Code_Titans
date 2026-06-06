import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Scan, RefreshCw } from 'lucide-react';

type ScanResult = 'idle' | 'scanning' | 'valid' | 'invalid' | 'fraud';

const PartnerScanPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult>('idle');
  const [manualRef, setManualRef] = useState('');
  const [loading, setLoading] = useState(false);

  const mockQrData = {
    ref: 'TXN-002',
    montant: 250,
    emetteur: 'Marché Central',
    date: '2024-01-15T11:00:00',
    expires: '2024-01-17T11:00:00',
    clientNom: 'Klouvi Jean-Paul',
  };

  const handleScan = async () => {
    setLoading(true);
    setScanResult('scanning');
    await new Promise(r => setTimeout(r, 1800));
    // Simulate random results for demo
    const results: ScanResult[] = ['valid', 'valid', 'valid', 'fraud', 'invalid'];
    setScanResult(results[Math.floor(Math.random() * results.length)]);
    setLoading(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setScanResult('scanning');
    await new Promise(r => setTimeout(r, 1200));
    setScanResult(manualRef.startsWith('TXN') ? 'valid' : 'invalid');
    setLoading(false);
  };

  const handleValidate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setScanResult('idle');
    setManualRef('');
  };

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Scanner QR Code</h1>
        <p className="page-subtitle">Validez et remboursez les crédits SmartChange</p>
      </div>

      {/* Stats partenaire */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Validés aujourd\'hui', value: '23', color: 'var(--success)' },
          { label: 'Commissions gagnées', value: '115 F', color: '#a78bfa' },
          { label: 'En attente', value: '3', color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Scanner area */}
      {(scanResult === 'idle' || scanResult === 'scanning') && (
        <div className="card" style={{ marginBottom: 16 }}>
          {/* Camera simulation */}
          <div style={{
            background: '#000', borderRadius: 'var(--radius)',
            height: 260, marginBottom: 20, position: 'relative',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)' }} />

            {scanResult === 'scanning' ? (
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-dim)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', animation: 'pulse-glow 1s infinite' }}>
                  <Scan size={26} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}>Vérification en cours...</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Analyse IA anti-fraude</div>
              </div>
            ) : (
              <>
                {/* Scan frame */}
                <div style={{
                  width: 180, height: 180, position: 'relative',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}>
                  {[
                    { top: -2, left: -2, borderTop: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', width: 30, height: 30 },
                    { top: -2, right: -2, borderTop: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', width: 30, height: 30 },
                    { bottom: -2, left: -2, borderBottom: '3px solid var(--primary)', borderLeft: '3px solid var(--primary)', width: 30, height: 30 },
                    { bottom: -2, right: -2, borderBottom: '3px solid var(--primary)', borderRight: '3px solid var(--primary)', width: 30, height: 30 },
                  ].map((corner, i) => (
                    <div key={i} style={{ position: 'absolute', ...corner }} />
                  ))}
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', animation: 'float 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  Pointez la caméra sur le QR Code
                </div>
              </>
            )}
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={handleScan} disabled={loading}>
            <Scan size={18} /> Scanner un QR Code
          </button>
        </div>
      )}

      {/* Manual entry */}
      {scanResult === 'idle' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Saisie manuelle de la référence</div>
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 10 }}>
            <input className="input" value={manualRef} onChange={e => setManualRef(e.target.value.toUpperCase())}
              placeholder="Ex: TXN-002" style={{ flex: 1, fontFamily: 'var(--font-mono)' }} />
            <button type="submit" className="btn btn-secondary" disabled={!manualRef}>Vérifier</button>
          </form>
        </div>
      )}

      {/* Valid result */}
      {scanResult === 'valid' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ border: '1px solid var(--success)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '12px 16px', background: 'var(--success-dim)', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>QR Code valide — Aucune fraude détectée</span>
            </div>
            {[
              { label: 'Référence', value: mockQrData.ref, mono: true },
              { label: 'Client', value: mockQrData.clientNom },
              { label: 'Émetteur', value: mockQrData.emetteur },
              { label: 'Montant à rembourser', value: `${mockQrData.montant.toLocaleString('fr')} F CFA`, bold: true, color: 'var(--warning)' },
              { label: 'Score de risque IA', value: '18/100 — ✅ Faible', color: 'var(--success)' },
              { label: 'Votre commission', value: '5 F CFA', color: '#a78bfa' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontWeight: (row as any).bold ? 700 : 500, color: (row as any).color || 'var(--text)', fontFamily: (row as any).mono ? 'var(--font-mono)' : 'inherit', fontSize: (row as any).mono ? 12 : 14 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setScanResult('idle'); setManualRef(''); }}>
                <XCircle size={15} /> Annuler
              </button>
              <button className="btn btn-success btn-lg" style={{ flex: 2 }} onClick={handleValidate} disabled={loading}>
                {loading ? <div className="spinner" /> : <><CheckCircle size={18} /> Rembourser {mockQrData.montant} F CFA</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invalid result */}
      {scanResult === 'invalid' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ border: '1px solid var(--danger)', textAlign: 'center', padding: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--danger)' }}>
              <XCircle size={28} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, color: 'var(--danger)' }}>QR Code invalide</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Ce QR Code est expiré, déjà utilisé ou ne correspond à aucune transaction.</p>
            <button className="btn btn-secondary" onClick={() => { setScanResult('idle'); setManualRef(''); }}>
              <RefreshCw size={15} /> Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Fraud result */}
      {scanResult === 'fraud' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ border: '1px solid var(--danger)', textAlign: 'center', padding: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--danger-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--danger)', animation: 'pulse-glow 1s infinite' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8, color: 'var(--danger)' }}>🚨 Fraude détectée !</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>L'IA a détecté une tentative de fraude. Score de risque : <strong style={{ color: 'var(--danger)' }}>87/100</strong></p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Ce QR Code a déjà été scanné. Un rapport a été envoyé à l'administration.</p>
            <button className="btn btn-secondary" onClick={() => { setScanResult('idle'); setManualRef(''); }}>
              <RefreshCw size={15} /> Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerScanPage;
