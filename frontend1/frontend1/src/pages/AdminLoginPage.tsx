import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Identifiants requis.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError('Accès refusé. Identifiants administrateur incorrects.');
      return;
    }
    // Will re-render via auth context — but we also call onSuccess to signal admin route
    onSuccess();
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle BG */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(245,158,11,0.06) 0%, transparent 70%)',
      }} />

      <div style={{
        width: '100%', maxWidth: 400, padding: '0 20px', animation: 'fadeUp 0.4s ease',
      }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={28} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, marginBottom: 4 }}>
            Smart<span style={{ color: '#f59e0b' }}>Change</span> Admin
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Accès réservé aux administrateurs</div>
        </div>

        <div className="card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          {error && (
            <div style={{
              background: 'var(--danger-dim)', border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)',
            }}>
              <AlertCircle size={15} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="input-group">
              <label className="input-label">Email administrateur</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="admin@smartchange.tg"
                  style={{ paddingLeft: 44 }} required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input" type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  style={{ paddingLeft: 44, paddingRight: 44 }} required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
              style={{ marginTop: 4, background: '#f59e0b', color: '#0a0f1e', boxShadow: '0 6px 20px rgba(245,158,11,0.35)' }}
            >
              {loading ? <div className="spinner" /> : <><span>Accéder au panneau admin</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
            🔒 Connexion chiffrée et sécurisée
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-dim)' }}>
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Retour au site</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
