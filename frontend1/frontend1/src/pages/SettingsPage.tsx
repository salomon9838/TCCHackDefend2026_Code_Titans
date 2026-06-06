import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Eye, EyeOff, Lock, CheckCircle, AlertCircle, User, Phone, Mail, Shield } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile fields pre-filled with user data
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notifications
  const [notifSMS, setNotifSMS] = useState(true);
  const [notifTransaction, setNotifTransaction] = useState(true);
  const [notifFraude, setNotifFraude] = useState(true);

  const roleLabels: Record<string, string> = {
    merchant: 'Commerçant', customer: 'Client', partner: 'Partenaire', admin: 'Administrateur',
  };
  const roleColors: Record<string, string> = {
    merchant: '#00d4ff', customer: '#10b981', partner: '#7c3aed', admin: '#f59e0b',
  };
  const roleColor = roleColors[user?.role || 'merchant'];

  const getPasswordStrength = (p: string) => {
    if (p.length === 0) return { score: 0, label: '', color: '' };
    if (p.length < 6) return { score: 1, label: 'Trop court', color: 'var(--danger)' };
    if (p.length < 8) return { score: 2, label: 'Faible', color: 'var(--warning)' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { score: 4, label: 'Fort', color: 'var(--success)' };
    return { score: 3, label: 'Moyen', color: 'var(--warning)' };
  };
  const strength = getPasswordStrength(newPassword);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    await new Promise(r => setTimeout(r, 700));
    updateUser({ nom, prenom, telephone, email });
    setProfileLoading(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) { setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Les mots de passe ne correspondent pas.'); return; }
    setPasswordLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setPasswordLoading(false);
    setPasswordSaved(true);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; color?: string }> = ({ checked, onChange, color = roleColor }) => (
    <button onClick={() => onChange(!checked)} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
      background: checked ? color : 'var(--bg-surface)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      boxShadow: checked ? `0 0 10px ${color}44` : 'none',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3, left: checked ? 23 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profile card */}
      <div style={{ marginBottom: 16 }}>
        {/* Avatar + role */}
        <div className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: `${roleColor}22`, border: `2px solid ${roleColor}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: roleColor,
          }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
              {user?.prenom} {user?.nom}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${roleColor}18`, color: roleColor }}>
                {roleLabels[user?.role || 'merchant']}
              </span>
              <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: 'var(--success-dim)', color: 'var(--success)' }}>
                ● Actif
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-dim)' }}>
            ID: <span style={{ fontFamily: 'var(--font-mono)', color: roleColor }}>{user?.id}</span><br />
            Depuis: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}
          </div>
        </div>

        {/* Profile form */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${roleColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor }}>
              <User size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Informations personnelles</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Modifiez vos informations de profil</div>
            </div>
          </div>

          {profileSaved && (
            <div style={{ background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--success)' }}>
              <CheckCircle size={15} /> Profil mis à jour avec succès !
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div className="input-group">
                <label className="input-label">Prénom</label>
                <input className="input" value={prenom} onChange={e => setPrenom(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Nom</label>
                <input className="input" value={nom} onChange={e => setNom(e.target.value)} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div className="input-group">
                <label className="input-label">Téléphone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" value={telephone} onChange={e => setTelephone(e.target.value)} style={{ paddingLeft: 40 }} required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 40 }} required />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}
              style={{ background: roleColor, color: '#0a0f1e', boxShadow: `0 4px 14px ${roleColor}40` }}>
              {profileLoading ? <div className="spinner" /> : <><Save size={15} /> Sauvegarder le profil</>}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--warning-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <Lock size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Sécurité — Mot de passe</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Modifiez votre mot de passe</div>
            </div>
          </div>

          {passwordError && (
            <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)' }}>
              <AlertCircle size={15} />{passwordError}
            </div>
          )}
          {passwordSaved && (
            <div style={{ background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--success)' }}>
              <CheckCircle size={15} /> Mot de passe mis à jour !
            </div>
          )}

          <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Mot de passe actuel</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type={showCurrent ? 'text' : 'password'} value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••"
                  style={{ paddingLeft: 40, paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type={showNew ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 caractères"
                  style={{ paddingLeft: 40, paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'var(--border)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Confirmer le nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Répétez le nouveau mot de passe"
                  style={{
                    paddingLeft: 40, paddingRight: 40,
                    borderColor: confirmPassword && newPassword !== confirmPassword ? 'var(--danger)' : confirmPassword && newPassword === confirmPassword ? 'var(--success)' : undefined,
                  }} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                {confirmPassword && (
                  <div style={{ position: 'absolute', right: 38, top: '50%', transform: 'translateY(-50%)' }}>
                    {newPassword === confirmPassword
                      ? <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                      : <AlertCircle size={13} style={{ color: 'var(--danger)' }} />}
                  </div>
                )}
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <span style={{ fontSize: 11, color: 'var(--danger)', marginTop: 3 }}>Les mots de passe ne correspondent pas</span>
              )}
            </div>

            <button type="submit" className="btn btn-secondary" disabled={passwordLoading} style={{ width: 'fit-content' }}>
              {passwordLoading ? <div className="spinner" /> : <><Shield size={15} /> Mettre à jour le mot de passe</>}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
              📱
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Notifications</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Choisissez les alertes à recevoir</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Notifications SMS', desc: 'Recevoir les alertes par SMS même sans connexion internet', checked: notifSMS, onChange: setNotifSMS },
              { label: 'Alertes transactions', desc: 'Être notifié à chaque transaction créée ou validée', checked: notifTransaction, onChange: setNotifTransaction },
              { label: 'Alertes de fraude', desc: "Recevoir les alertes de l'IA en cas de transaction suspecte", checked: notifFraude, onChange: setNotifFraude },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <Toggle checked={item.checked} onChange={item.onChange} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
