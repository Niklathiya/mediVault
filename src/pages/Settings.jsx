import { useState } from 'react';
import { Building2, BedDouble, Download, Upload, CheckCircle2, Save } from 'lucide-react';

const INITIAL_WARDS = [
  { name: 'General Ward', beds: 20 },
  { name: 'ICU', beds: 8 },
  { name: 'Surgery', beds: 12 },
  { name: 'Maternity', beds: 10 },
  { name: 'Orthopaedic', beds: 8 },
  { name: 'Paediatric', beds: 10 },
];

const C = {
  text: 'var(--fg-on-light)',
  muted: 'var(--fg-on-light-muted)',
  border: 'var(--border-card)',
  borderStrong: 'var(--border-strong)',
  primary: '#0891b2',
  subtleBg: 'var(--surface-subtle)',
};

const inputStyle = {
  width: '100%', padding: '10px 12px', border: `1px solid ${C.borderStrong}`,
  borderRadius: 8, fontFamily: 'inherit', fontSize: 14, outline: 'none',
  color: C.text, background: 'var(--bg-canvas)', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: C.muted, marginBottom: 5,
};

function SectionIcon({ icon: Icon }) {
  return (
    <div style={{ width: 32, height: 32, background: C.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={16} color="white" />
    </div>
  );
}

function SavedToast({ show }) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0f172a', color: 'white', padding: '12px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, animation: 'mv-toast 200ms ease both', zIndex: 999 }}>
      <CheckCircle2 size={16} color="#4eb374" /> Settings saved
    </div>
  );
}

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'BAPS Pramukh Swami Hospital',
    tagline: 'Arogyam Sarvada',
    address: 'Shahibaug, Ahmedabad, Gujarat 380004',
    phone: '+91 79 2286 0000',
    email: 'contact@bapshospital.org',
  });
  const [wards, setWards] = useState(INITIAL_WARDS);
  const [saved, setSaved] = useState(false);

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const updateWard = (i, field, value) => {
    setWards(ws => ws.map((w, idx) => idx === i ? { ...w, [field]: value } : w));
  };

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>System</div>
        <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: C.text }}>Settings</h1>
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 14 }}>Manage hospital profile, ward configuration and data exports.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hospital Profile */}
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <SectionIcon icon={Building2} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>Hospital Profile</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Hospital Name</span>
                <input style={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Tagline / Motto</span>
                <input style={inputStyle} value={profile.tagline} onChange={e => setProfile(p => ({ ...p, tagline: e.target.value }))} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Address</span>
                <input style={inputStyle} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Phone</span>
                  <input style={inputStyle} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Email</span>
                  <input style={inputStyle} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </label>
              </div>
              <button
                onClick={showSaved}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                <Save size={14} /> Save hospital profile
              </button>
            </div>
          </div>

          {/* Ward Configuration */}
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <SectionIcon icon={BedDouble} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>Ward Configuration</h2>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Edit ward names and total bed counts used for occupancy tracking.</div>
            {wards.map((w, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <input
                  value={w.name}
                  onChange={e => updateWard(i, 'name', e.target.value)}
                  style={{ padding: '9px 12px', border: `1px solid ${C.borderStrong}`, borderRadius: 8, fontFamily: 'inherit', fontSize: 13, outline: 'none', color: C.text, background: 'var(--bg-canvas)', width: '100%' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    value={w.beds}
                    min={1} max={200}
                    onChange={e => updateWard(i, 'beds', parseInt(e.target.value) || 1)}
                    style={{ width: 64, padding: '9px 10px', border: `1px solid ${C.borderStrong}`, borderRadius: 8, fontFamily: 'inherit', fontSize: 13, outline: 'none', textAlign: 'center', color: C.text, background: 'var(--bg-canvas)' }}
                  />
                  <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>beds</span>
                </div>
              </div>
            ))}
            <button
              onClick={showSaved}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              <Save size={14} /> Save ward configuration
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Backup & Restore */}
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <SectionIcon icon={Download} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>Backup & Restore</h2>
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
              Download a full JSON backup of all hospital data including patients, admissions, billing, and staff records.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-primary" style={{ justifyContent: 'center' }}>
                <Download size={14} /> Download full backup
              </button>
              <button
                style={{
                  background: 'transparent', border: `1px solid ${C.borderStrong}`, borderRadius: 8,
                  padding: '10px 18px', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  color: C.muted, fontWeight: 500, transition: 'background 120ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.subtleBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Upload size={14} /> Restore from backup
              </button>
            </div>
            <div style={{ marginTop: 18, padding: '12px 16px', background: C.subtleBg, borderRadius: 10, fontSize: 12, color: C.muted }}>
              Last backup: <strong style={{ color: C.text }}>Today at 06:00 AM</strong> (auto)
            </div>
          </div>

          {/* About */}
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 16 }}>About MediVault</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Version', '1.0.0-beta'],
                ['Build', '2026.06.26'],
                ['Hospital', profile.name],
                ['License', 'Single-site perpetual'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{k}</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SavedToast show={saved} />
    </div>
  );
}
