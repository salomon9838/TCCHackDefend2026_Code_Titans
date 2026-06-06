import React, { useState, useEffect } from 'react';
import { ArrowRight, QrCode, CheckCircle, Download, Share2, RefreshCw, AlertTriangle } from 'lucide-react';
import QRCodeLib from 'qrcode';

type Step = 'form' | 'confirm' | 'qr' | 'success';

const TransactionPage: React.FC = () => {
  const [step, setStep] = useState<Step>('form');
  const [montantAchat, setMontantAchat] = useState('');
  const [montantPaye, setMontantPaye] = useState('');
  const [monnaie, setMonnaie] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [transactionId] = useState(`TXN-${Date.now().toString().slice(-6)}`);
  const [showFraudWarning, setShowFraudWarning] = useState(false);
  const fraisService = 20;

  useEffect(() => {
    const a = parseFloat(montantAchat) || 0;
    const p = parseFloat(montantPaye) || 0;
    setMonnaie(p > a ? p - a : 0);
  }, [montantAchat, montantPaye]);

  const generateQR = async () => {
    const data = JSON.stringify({ ref: transactionId, montant: monnaie, emetteur: 'Boutique Kokou', expires: new Date(Date.now() + 48 * 3600000).toISOString() });
    const url = await QRCodeLib.toDataURL(data, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'H' });
    setQrDataUrl(url);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    if (monnaie > 5000) setShowFraudWarning(true);
    await generateQR();
    setLoading(false);
    setStep('qr');
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `smartchange-${transactionId}.png`;
    a.click();
  };

  const riskScore = monnaie > 2000 ? 72 : monnaie > 500 ? 35 : 18;
  const riskColor = riskScore > 70 ? 'var(--danger)' : riskScore > 40 ? 'var(--warning)' : 'var(--success)';

  const steps = ['form', 'confirm', 'qr', 'success'];
  const stepLabels = ['Calcul', 'Confirmation', 'QR Code', 'Terminé'];

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Nouvelle Transaction</h1>
        <p className="page-subtitle">Convertir la monnaie en crédit numérique</p>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {stepLabels.map((label, i) => {
          const current = steps.indexOf(step);
          const done = i < current;
          const active = i === current;
          return (
            <React.Fragment key={label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--bg-surface)',
                  border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: done ? 'white' : active ? '#0a0f1e' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {done ? <CheckCircle size={13} /> : i + 1}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--primary)' : done ? 'var(--success)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done ? 'var(--success)' : 'var(--border)', marginBottom: 18, transition: 'background 0.3s', minWidth: 12 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* FORM */}
      {step === 'form' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--primary-dim)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>1</div>
              Saisie des montants
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="input-group">
                <label className="input-label">Montant achat (F)</label>
                <input className="input" type="number" inputMode="numeric" value={montantAchat}
                  onChange={e => setMontantAchat(e.target.value)} placeholder="980"
                  style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)' }} />
              </div>
              <div className="input-group">
                <label className="input-label">Montant payé (F)</label>
                <input className="input" type="number" inputMode="numeric" value={montantPaye}
                  onChange={e => setMontantPaye(e.target.value)} placeholder="1000"
                  style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)' }} />
              </div>
            </div>

            {monnaie > 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius)', padding: 16, animation: 'fadeUp 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Monnaie à rendre</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--warning)' }}>{monnaie.toLocaleString('fr')} F</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    { label: 'Plateforme SmartChange', value: '10 F', color: 'var(--primary)' },
                    { label: 'Votre commission', value: '5 F', color: 'var(--success)' },
                    { label: 'Commission partenaire', value: '5 F', color: '#a78bfa' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-dim)' }}>{r.label}</span>
                      <span style={{ color: r.color, fontWeight: 600 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="btn btn-primary btn-lg btn-full" disabled={monnaie <= 0} onClick={() => setStep('confirm')}>
            Continuer <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* CONFIRM */}
      {step === 'confirm' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Récapitulatif</div>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)', marginBottom: 4 }}>{transactionId}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--warning)' }}>{monnaie.toLocaleString('fr')} F</div>
            </div>
            {[
              { label: 'Montant achat', value: `${parseFloat(montantAchat).toLocaleString('fr')} F` },
              { label: 'Montant payé', value: `${parseFloat(montantPaye).toLocaleString('fr')} F` },
              { label: 'Frais de service', value: `${fraisService} F` },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
            {/* Risk score */}
            <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: `1px solid ${riskColor}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                  <AlertTriangle size={13} style={{ color: riskColor }} />Score de risque IA
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: riskColor }}>{riskScore}/100</span>
              </div>
              <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${riskScore}%`, background: riskColor, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                {riskScore < 40 ? '✅ Transaction normale' : riskScore < 70 ? '⚠️ Risque modéré' : '🚨 Risque élevé'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep('form')}>← Modifier</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleConfirm} disabled={loading}>
              {loading ? <><div className="spinner" />&nbsp;Génération...</> : <><QrCode size={16} /> Créer SmartChange</>}
            </button>
          </div>
        </div>
      )}

      {/* QR */}
      {step === 'qr' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
            {showFraudWarning && (
              <div style={{ background: 'var(--warning-dim)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '9px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--warning)' }}>Montant élevé — IA surveille cette transaction</span>
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)', marginBottom: 2 }}>{transactionId}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: 'var(--warning)', marginBottom: 4 }}>{monnaie.toLocaleString('fr')} F</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Crédit SmartChange généré</div>
            <div style={{ margin: '0 auto 16px', display: 'inline-block' }}>
              <div style={{ background: 'white', padding: 14, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'inline-block' }}>
                {qrDataUrl && <img src={qrDataUrl} alt="QR Code" style={{ display: 'block', width: 180, height: 180 }} />}
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>⏰ Expiration</span>
              <span style={{ fontWeight: 600 }}>48h — {new Date(Date.now() + 48 * 3600000).toLocaleDateString('fr-FR')}</span>
            </div>
            <div style={{ background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '9px 14px', marginBottom: 16, fontSize: 12, color: 'var(--success)' }}>
              📱 SMS envoyé au client
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={handleDownload}><Download size={13} /> Télécharger</button>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}><Share2 size={13} /> Partager</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep('success')}><CheckCircle size={14} /> Terminer</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {step === 'success' && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-dim)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--success)', animation: 'pulse-glow 2s infinite' }}>
              <CheckCircle size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Transaction réussie !</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              Crédit de <strong style={{ color: 'var(--warning)' }}>{monnaie.toLocaleString('fr')} F CFA</strong> créé et envoyé au client.
            </p>
            <button className="btn btn-secondary" onClick={() => { setStep('form'); setMontantAchat(''); setMontantPaye(''); }}>
              <RefreshCw size={14} /> Nouvelle transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
