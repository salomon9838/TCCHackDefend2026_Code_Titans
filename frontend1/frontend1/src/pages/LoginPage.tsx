import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { Eye, EyeOff, Smartphone, Lock, ArrowRight, Zap, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, register, logout } = useAuth();
  const [step, setStep] = useState<'login' | 'register' | 'otp'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register state
  const [role, setRole] = useState<UserRole>('merchant');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('+228');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [_pendingUser, setPendingUser] = useState<{ email: string; password: string } | null>(null);

  const roles: { id: UserRole; label: string; color: string; desc: string }[] = [
    { id: 'merchant', label: 'Commerçant', color: '#00d4ff', desc: 'Créer des transactions' },
    { id: 'customer', label: 'Client', color: '#10b981', desc: 'Gérer mon crédit' },
    { id: 'partner', label: 'Partenaire', color: '#7c3aed', desc: 'Scanner QR Codes' },
  ];

  const roleColor = roles.find(r => r.id === role)?.color || '#00d4ff';
  const currentColor = step === 'login' ? '#00d4ff' : roleColor;

  // Password strength
  const getPasswordStrength = (p: string) => {
    if (p.length === 0) return { score: 0, label: '', color: '' };
    if (p.length < 6) return { score: 1, label: 'Trop court', color: 'var(--danger)' };
    if (p.length < 8) return { score: 2, label: 'Faible', color: 'var(--warning)' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { score: 4, label: 'Fort', color: 'var(--success)' };
    return { score: 3, label: 'Moyen', color: 'var(--warning)' };
  };
  const strength = getPasswordStrength(password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) { setLoginError('Veuillez saisir votre email ou téléphone.'); return; }
    if (!loginPassword) { setLoginError('Veuillez saisir votre mot de passe.'); return; }
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!result.success) {
      setLoginError(result.error || 'Erreur de connexion.');
    } else if (result.role === 'admin') {
      // Admin accounts cannot log in from the public login page
      logout();
      setLoginError('Ce compte n\'est pas accessible depuis cette page.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!nom.trim() || !prenom.trim()) { setRegisterError('Nom et prénom obligatoires.'); return; }
    if (!telephone.trim()) { setRegisterError('Numéro de téléphone obligatoire.'); return; }
    if (!email.trim()) { setRegisterError('Email obligatoire.'); return; }
    if (password.length < 6) { setRegisterError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirmPassword) { setRegisterError('Les mots de passe ne correspondent pas.'); return; }
    setRegisterLoading(true);
    // Go to OTP step first
    await new Promise(r => setTimeout(r, 600));
    setRegisterLoading(false);
    setPendingUser({ email, password });
    setStep('otp');
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    if (next.every(v => v)) setTimeout(() => handleOtpValidate(next.join('')), 200);
  };

  const handleOtpValidate = async (_code: string) => {
    setOtpLoading(true);
    const result = await register({ nom, prenom, telephone, email, password, role });
    setOtpLoading(false);
    if (!result.success) {
      setRegisterError(result.error || 'Erreur.');
      setStep('register');
    }
  };


  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated BG */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 60% at 20% 50%, ${currentColor}08 0%, transparent 60%),
                     radial-gradient(ellipse 60% 80% at 80% 80%, rgba(124,58,237,0.06) 0%, transparent 60%)`
      }} />

      {/* Left panel */}
      <div className="login-left-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 60px', maxWidth: 540, overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${currentColor}, ${currentColor}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: '#0a0f1e',
            boxShadow: `0 8px 24px ${currentColor}40`, transition: 'all 0.3s',
          }}>S</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>
              SmartChange <span style={{ color: currentColor }}>AI</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>La monnaie ne doit plus freiner le commerce.</div>
          </div>
        </div>

        {/* LOGIN FORM */}
        {step === 'login' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Bienvenue</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>Connectez-vous à votre espace SmartChange</p>

            {loginError && (
              <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)' }}>
                <AlertCircle size={15} />{loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Email ou téléphone</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" type="text" value={loginEmail}
                    onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                    placeholder="email@exemple.com ou +228..." style={{ paddingLeft: 44 }} required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" type={showLoginPass ? 'text' : 'password'}
                    value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                    placeholder="••••••••" style={{ paddingLeft: 44, paddingRight: 44 }} required />
                  <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                    {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loginLoading}
                style={{ marginTop: 4, background: '#00d4ff', color: '#0a0f1e', boxShadow: '0 6px 20px rgba(0,212,255,0.4)' }}>
                {loginLoading ? <div className="spinner" /> : <><span>Se connecter</span><ArrowRight size={18} /></>}
              </button>
            </form>


            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
              Pas encore de compte ?{' '}
              <button onClick={() => { setStep('register'); setLoginError(''); }} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                S'inscrire
              </button>
            </div>
          </div>
        )}

        {/* REGISTER FORM */}
        {step === 'register' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Créer un compte</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Rejoignez le réseau SmartChange AI</p>

            {/* Role selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Type de compte</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
                {roles.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)} style={{
                    padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${role === r.id ? r.color + '66' : 'var(--border)'}`,
                    background: role === r.id ? `${r.color}12` : 'var(--bg-surface)',
                    color: role === r.id ? r.color : 'var(--text-muted)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {registerError && (
              <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)' }}>
                <AlertCircle size={15} />{registerError}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group">
                  <label className="input-label">Nom</label>
                  <input className="input" value={nom} onChange={e => setNom(e.target.value)} placeholder="Koumedjina" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Prénom</label>
                  <input className="input" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Salomon" required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Téléphone</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" value={telephone} onFocus={e => e.target.select()}
                onChange={e => {
                  let val = e.target.value;
                  if (!val.startsWith('+228')) val = '+228' + val.replace(/^\+?228?/, '');
                  setTelephone(val);
                }} placeholder="+228 90 00 00 00" style={{ paddingLeft: 44 }} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" style={{ paddingLeft: 44 }} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères" style={{ paddingLeft: 44, paddingRight: 44 }} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'var(--border)', transition: 'background 0.2s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Confirmer le mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    style={{
                      paddingLeft: 44, paddingRight: 44,
                      borderColor: confirmPassword && password !== confirmPassword ? 'var(--danger)' : confirmPassword && password === confirmPassword ? 'var(--success)' : undefined,
                    }} required />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {confirmPassword && (
                    <div style={{ position: 'absolute', right: 42, top: '50%', transform: 'translateY(-50%)' }}>
                      {password === confirmPassword
                        ? <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                        : <AlertCircle size={14} style={{ color: 'var(--danger)' }} />}
                    </div>
                  )}
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Les mots de passe ne correspondent pas</span>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={registerLoading}
                style={{ marginTop: 4, background: roleColor, color: '#0a0f1e', boxShadow: `0 6px 20px ${roleColor}40` }}>
                {registerLoading ? <div className="spinner" /> : <><span>Créer mon compte</span><ArrowRight size={18} /></>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
              Déjà un compte ?{' '}
              <button onClick={() => { setStep('login'); setRegisterError(''); }} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)' }}>
                Se connecter
              </button>
            </div>
          </div>
        )}

        {/* OTP STEP */}
        {step === 'otp' && (
          <div style={{ animation: 'fadeUp 0.4s ease' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${roleColor}20`, border: `2px solid ${roleColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: roleColor }}>
              <Smartphone size={24} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Vérification SMS</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 14 }}>
              Code envoyé au numéro <strong style={{ color: 'var(--text)' }}>{telephone}</strong>
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 28 }}>
              (Pour la démo, saisissez n'importe quel code à 6 chiffres)
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {otp.map((v, i) => (
                <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={v}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                  style={{
                    width: 48, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
                    fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)',
                    border: `1px solid ${v ? roleColor + '66' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)', color: v ? roleColor : 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
                  }} />
              ))}
            </div>

            <button onClick={() => handleOtpValidate(otp.join(''))} className="btn btn-primary btn-lg btn-full"
              disabled={otpLoading || otp.some(v => !v)}
              style={{ background: roleColor, color: '#0a0f1e', boxShadow: `0 6px 20px ${roleColor}40` }}>
              {otpLoading ? <div className="spinner" /> : <><span>Valider</span><Zap size={18} /></>}
            </button>

            <button onClick={() => setStep('register')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: 14, fontSize: 14, display: 'block', width: '100%', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
              ← Retour
            </button>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="login-right-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 380, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px', background: `linear-gradient(135deg, ${currentColor}22, ${currentColor}08)`, border: `1px solid ${currentColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, animation: 'float 3s ease-in-out infinite' }}>💱</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>La monnaie digitale pour tous</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24, fontSize: 13 }}>
            SmartChange AI transforme la monnaie non disponible en crédit numérique sécurisé utilisable dans tout le réseau de partenaires.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { emoji: '🔐', text: 'QR Code sécurisé & unique' },
              { emoji: '📍', text: 'Géolocalisation des partenaires' },
              { emoji: '🤖', text: 'IA de détection de fraude' },
              { emoji: '📱', text: 'Notifications SMS sans internet' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'left' }}>
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
