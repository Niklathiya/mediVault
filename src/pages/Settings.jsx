import { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  ShieldCheck,
  Download,
  Upload,
  CheckCircle2,
  Save,
  Info,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { getHospitalProfile, updateHospitalProfile, getWards, updateWards } from '../firebase/services/settingsService.js';

const INITIAL_WARDS = [
  { name: 'General Ward', beds: 20 },
  { name: 'Semi-Private', beds: 10 },
  { name: 'Private', beds: 8 },
  { name: 'ICU', beds: 4 },
];

// Mock system stats — replace with real data when backend is connected
const STATS = {
  patients: 128,
  admissions: 43,
  labResults: 37,
};

const C = {
  text: 'var(--fg-on-light)',
  muted: 'var(--fg-on-light-muted)',
  border: 'var(--border-card)',
  borderStrong: 'var(--border-strong)',
  primary: '#0891b2',
  subtleBg: 'var(--surface-subtle)',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${C.borderStrong}`,
  borderRadius: 8,
  fontFamily: 'inherit',
  fontSize: 14,
  outline: 'none',
  color: C.text,
  background: 'var(--bg-canvas)',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: C.muted,
  marginBottom: 5,
};

function SectionIcon({ icon: Icon, light = false }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        flexShrink: 0,
        borderRadius: 8,
        background: light ? C.subtleBg : C.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={16} color={light ? C.text : 'white'} />
    </div>
  );
}

function SavedToast({ show }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: '#0f172a',
        color: 'white',
        padding: '12px 18px',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 500,
        animation: 'mv-toast 200ms ease both',
        zIndex: 999,
      }}
    >
      <CheckCircle2 size={16} color="#4eb374" /> Settings saved
    </div>
  );
}

export default function Settings() {
  const [profile, setProfile] = useState({
    name: '', tagline: '', address: '', phone: '', email: '',
  });
  const [wards, setWards] = useState(INITIAL_WARDS);
  const [saved, setSaved] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHospitalProfile(), getWards()]).then(([p, w]) => {
      if (p) setProfile(p);
      if (w && w.length) setWards(w);
      setSettingsLoading(false);
    });
  }, []);

  const showSaved = async () => {
    await Promise.all([
      updateHospitalProfile(profile),
      updateWards(wards),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const updateWard = (i, field, value) =>
    setWards((ws) => ws.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: C.muted,
            fontWeight: 600,
          }}
        >
          System
        </div>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            margin: '8px 0 0',
            color: C.text,
          }}
        >
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 14 }}>
          Manage hospital profile, ward configuration and data exports.
        </p>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}
      >
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hospital Profile */}
          <div
            style={{
              background: 'var(--surface)',
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <SectionIcon icon={Building2} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>
                Hospital Profile
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Hospital Name</span>
                <input
                  style={inputStyle}
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Tagline / Motto</span>
                <input
                  style={inputStyle}
                  value={profile.tagline}
                  onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
                />
              </label>
              <label style={{ display: 'block' }}>
                <span style={labelStyle}>Address</span>
                <input
                  style={inputStyle}
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Phone</span>
                  <input
                    style={inputStyle}
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Email</span>
                  <input
                    style={inputStyle}
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />
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
          <div
            style={{
              background: 'var(--surface)',
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <SectionIcon icon={BedDouble} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>
                Ward Configuration
              </h2>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              Edit ward names and total bed counts used for occupancy tracking.
            </div>
            {wards.map((w, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px',
                  gap: 10,
                  marginBottom: 10,
                  alignItems: 'center',
                }}
              >
                <input
                  value={w.name}
                  onChange={(e) => updateWard(i, 'name', e.target.value)}
                  style={{
                    padding: '9px 12px',
                    border: `1px solid ${C.borderStrong}`,
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    outline: 'none',
                    color: C.text,
                    background: 'var(--bg-canvas)',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    value={w.beds}
                    min={1}
                    max={200}
                    onChange={(e) => updateWard(i, 'beds', parseInt(e.target.value) || 1)}
                    style={{
                      width: 64,
                      padding: '9px 10px',
                      border: `1px solid ${C.borderStrong}`,
                      borderRadius: 8,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      outline: 'none',
                      textAlign: 'center',
                      color: C.text,
                      background: 'var(--bg-canvas)',
                    }}
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

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Backup & Restore */}
          <div
            style={{
              background: 'var(--surface)',
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <SectionIcon icon={ShieldCheck} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>
                Backup &amp; Restore
              </h2>
            </div>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>
              Download a complete backup of all hospital data — patients, IPD files, lab results,
              prescriptions, bills, team records and settings — as a single file. Restore it any
              time to recover your data.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Download sub-section */}
              <div
                style={{
                  background: 'rgba(8,145,178,0.04)',
                  border: '1px solid rgba(8,145,178,0.15)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    📥 Download Full Backup
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                    Saves as medivault_backup_[date].json
                  </div>
                </div>
                <button className="btn-primary" style={{ flexShrink: 0, gap: 6 }}>
                  <Download size={13} /> Download
                </button>
              </div>

              {/* Restore sub-section */}
              <div
                style={{
                  background: 'rgba(45,106,159,0.04)',
                  border: '1px solid rgba(45,106,159,0.15)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                    📤 Restore from Backup
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                    Select a previously downloaded .json backup file
                  </div>
                  <div style={{ fontSize: 11, color: '#d97706', fontWeight: 500, marginTop: 3 }}>
                    ⚠ This will replace current data with the backup
                  </div>
                </div>
                <button
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 16px',
                    background: '#2D6A9F',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <Upload size={13} /> Restore
                </button>
              </div>
            </div>

            {/* Instructions box */}
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                background: C.subtleBg,
                borderRadius: 8,
                fontSize: 11,
                color: C.muted,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: C.text }}>How to use:</strong> Click Download → save the file
              on your computer, pen drive or Google Drive. If you ever lose data or switch to a new
              device, click Restore and select the saved file — all records will come back exactly
              as they were.
            </div>
          </div>

          {/* Export Data */}
          <div
            style={{
              background: 'var(--surface)',
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <SectionIcon icon={FileSpreadsheet} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>
                Export Data
              </h2>
            </div>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>
              Download all hospital data as CSV files. Open in Excel, Google Sheets, or any
              spreadsheet app.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                {
                  title: 'Patients Register',
                  subtitle: `${STATS.patients} patients · ID, name, age, blood group, phone`,
                  icon: FileText,
                },
                {
                  title: 'IPD Admissions',
                  subtitle: `${STATS.admissions} admissions · IP no., ward, doctor, dates, status`,
                  icon: FileText,
                },
                {
                  title: 'Lab Results',
                  subtitle: `${STATS.labResults} records · test name, value, status, date`,
                  icon: FileText,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    style={{
                      background: C.subtleBg,
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={14} style={{ color: C.muted, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ flexShrink: 0, gap: 6, fontSize: 12, padding: '7px 14px' }}
                    >
                      <Download size={12} /> Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Info */}
          <div
            style={{
              background: 'var(--surface)',
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <SectionIcon icon={Info} light />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: C.text }}>
                System Info
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 13 }}>
              {[
                { label: 'System', value: 'MediVault IPD v1.0' },
                { label: 'Total patients', value: `${STATS.patients}` },
                { label: 'Total admissions', value: `${STATS.admissions}` },
                { label: 'Total lab results', value: `${STATS.labResults}` },
                { label: 'Storage', value: 'Browser localStorage', last: true },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 10,
                    paddingBottom: 10,
                    borderBottom: row.last ? 'none' : `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ color: C.muted }}>{row.label}</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{row.value}</span>
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
