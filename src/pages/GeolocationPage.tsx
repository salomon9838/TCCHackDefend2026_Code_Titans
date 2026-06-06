import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Phone, Star, Search } from 'lucide-react';
import { mockPartners } from '../data/mockData';

const GeolocationPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showMap, setShowMap] = useState(true);

  const filtered = mockPartners.filter(p =>
    p.nomBoutique.toLowerCase().includes(search.toLowerCase()) ||
    p.adresse.toLowerCase().includes(search.toLowerCase())
  );
  const selectedPartner = mockPartners.find(p => p.id === selected);

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 className="page-title">Partenaires proches</h1>
        <p className="page-subtitle">Récupérez votre monnaie chez un partenaire</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un partenaire..." style={{ paddingLeft: 42 }} />
      </div>

      {/* Mobile: toggle between map and list */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setShowMap(true)} className="btn btn-sm" style={{
          flex: 1, justifyContent: 'center',
          background: showMap ? 'var(--primary-dim)' : 'var(--bg-surface)',
          border: `1px solid ${showMap ? 'var(--primary)' : 'var(--border)'}`,
          color: showMap ? 'var(--primary)' : 'var(--text-muted)',
        }}>🗺️ Carte</button>
        <button onClick={() => setShowMap(false)} className="btn btn-sm" style={{
          flex: 1, justifyContent: 'center',
          background: !showMap ? 'var(--primary-dim)' : 'var(--bg-surface)',
          border: `1px solid ${!showMap ? 'var(--primary)' : 'var(--border)'}`,
          color: !showMap ? 'var(--primary)' : 'var(--text-muted)',
        }}>📋 Liste</button>
      </div>

      {/* Desktop: side-by-side, Mobile: stacked with toggle */}
      <div style={{ display: 'flex', gap: 14, height: 'calc(100vh - 280px)', minHeight: 420 }}>

        {/* List panel */}
        <div style={{
          width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto',
        }} className={`geo-list-panel${!showMap ? " hide" : ""}`}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
            {filtered.length} partenaire{filtered.length > 1 ? 's' : ''}
          </div>
          {filtered.map(partner => (
            <div key={partner.id} onClick={() => setSelected(partner.id === selected ? null : partner.id)} style={{
              background: selected === partner.id ? 'var(--primary-dim)' : 'var(--bg-card)',
              border: `1px solid ${selected === partner.id ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{partner.nomBoutique}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <MapPin size={9} />{partner.adresse}
                  </div>
                </div>
                <div style={{ background: 'var(--success-dim)', color: 'var(--success)', padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {partner.distance} km
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)' }}><Clock size={10} />{partner.horaires}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--warning)' }}><Star size={10} fill="currentColor" />4.8</span>
              </div>
              {selected === partner.id && (
                <div style={{ marginTop: 10, display: 'flex', gap: 7 }}>
                  <a href={`https://maps.google.com/?q=${partner.latitude},${partner.longitude}`} target="_blank" rel="noreferrer"
                    className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
                    <Navigation size={12} /> Itinéraire
                  </a>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                    <Phone size={12} /> Appeler
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Map panel */}
        <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', minHeight: 300 }} className={`geo-map-panel${showMap ? " show" : ""}`}>
          {/* Simulated map */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2744 50%, #0d1b2a 100%)' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 16}%`, height: 1, background: 'rgba(255,255,255,0.03)' }} />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${i * 16}%`, width: 1, background: 'rgba(255,255,255,0.03)' }} />
            ))}
            {[
              { top: '30%', left: '10%', w: '80%' }, { top: '60%', left: '5%', w: '70%' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', top: s.top, left: s.left, width: s.w, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
            ))}
            {filtered.map((partner, i) => {
              const positions = [{ top: '40%', left: '35%' }, { top: '25%', left: '58%' }, { top: '55%', left: '20%' }, { top: '70%', left: '65%' }];
              const pos = positions[i] || { top: '50%', left: '50%' };
              const isSel = selected === partner.id;
              return (
                <div key={partner.id} onClick={() => setSelected(partner.id)} style={{ position: 'absolute', top: pos.top, left: pos.left, transform: 'translate(-50%,-100%)', cursor: 'pointer', zIndex: isSel ? 10 : 1 }}>
                  <div style={{
                    background: isSel ? 'var(--primary)' : 'var(--bg-card)', border: `2px solid ${isSel ? 'var(--primary)' : 'var(--border-bright)'}`,
                    borderRadius: 7, padding: '4px 8px', fontSize: 10, fontWeight: 600,
                    color: isSel ? '#0a0f1e' : 'var(--text)', boxShadow: isSel ? '0 4px 16px var(--primary-glow)' : '0 2px 6px rgba(0,0,0,0.4)',
                    whiteSpace: 'nowrap', transition: 'all 0.2s', transform: isSel ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    <MapPin size={9} style={{ display: 'inline', marginRight: 3 }} />{partner.nomBoutique}
                  </div>
                  <div style={{ width: 6, height: 6, background: isSel ? 'var(--primary)' : 'var(--border-bright)', borderRadius: '50%', margin: '2px auto 0' }} />
                </div>
              );
            })}
            {/* User position */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
              <div style={{ width: 14, height: 14, background: '#3b82f6', borderRadius: '50%', border: '2.5px solid white', boxShadow: '0 0 0 5px rgba(59,130,246,0.2)', animation: 'pulse-glow 2s infinite' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(10,15,30,0.9)', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 10px', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%', border: '1.5px solid white' }} />Lomé
          </div>
          {selectedPartner && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(10,15,30,0.95)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius)', padding: '12px 14px', animation: 'fadeUp 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedPartner.nomBoutique}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{selectedPartner.adresse}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: 'var(--success-dim)', color: 'var(--success)', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{selectedPartner.distance} km</span>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, fontSize: 14 }} onClick={() => setSelected(null)}>✕</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeolocationPage;
