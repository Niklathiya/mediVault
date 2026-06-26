import { useState } from 'react';
import {
  Activity, Search, Filter, UserPlus, BedDouble, FlaskConical,
  Receipt, LogOut, Settings, Pill, AlertTriangle, RefreshCw,
  ChevronDown,
} from 'lucide-react';

const LOGS = [
  { id: 1, ts: '26 Jun 2026, 11:42 AM', type: 'admission', action: 'New IPD admission created', detail: 'Ramesh Patel admitted to General Ward · Bed 4A', user: 'Dr. Priya Mehta', module: 'IPD' },
  { id: 2, ts: '26 Jun 2026, 11:15 AM', type: 'registration', action: 'Patient registered', detail: 'Kiran Desai (PT-0128) added to system', user: 'Reception', module: 'Patients' },
  { id: 3, ts: '26 Jun 2026, 10:58 AM', type: 'lab', action: 'Lab result uploaded', detail: 'HbA1c result for Kiran Desai — 7.2% (High)', user: 'Lab Technician', module: 'Labs' },
  { id: 4, ts: '26 Jun 2026, 10:30 AM', type: 'billing', action: 'Invoice generated', detail: 'INV-2026-0035 · ₹1,200 for Kiran Desai', user: 'Reception', module: 'Billing' },
  { id: 5, ts: '26 Jun 2026, 09:55 AM', type: 'prescription', action: 'Prescription issued', detail: 'Metformin 500mg + Amlodipine 5mg for Kiran Desai', user: 'Dr. Priya Mehta', module: 'Patients' },
  { id: 6, ts: '26 Jun 2026, 09:22 AM', type: 'discharge', action: 'Patient discharged', detail: 'Anita Verma (IPD-2026-041) discharged from ICU', user: 'Dr. Rajan Sinha', module: 'IPD' },
  { id: 7, ts: '25 Jun 2026, 06:10 PM', type: 'alert', action: 'Allergy alert triggered', detail: 'Penicillin allergy flagged for Meena Agarwal', user: 'System', module: 'Patients' },
  { id: 8, ts: '25 Jun 2026, 05:44 PM', type: 'billing', action: 'Payment recorded', detail: 'INV-2026-0020 · ₹800 marked as Paid', user: 'Cashier', module: 'Billing' },
  { id: 9, ts: '25 Jun 2026, 04:30 PM', type: 'lab', action: 'Lab order placed', detail: 'CBC + LFT ordered for Sunita Sharma (IPD-2026-042)', user: 'Dr. Rajan Sinha', module: 'Labs' },
  { id: 10, ts: '25 Jun 2026, 03:15 PM', type: 'admission', action: 'Bed transfer', detail: 'Vijay Kumar moved from ICU Bed 3 to General Bed 6C', user: 'Nurse Station', module: 'IPD' },
  { id: 11, ts: '25 Jun 2026, 02:00 PM', type: 'settings', action: 'Settings updated', detail: 'Hospital working hours changed to 08:00 – 21:00', user: 'Admin', module: 'Settings' },
  { id: 12, ts: '25 Jun 2026, 11:30 AM', type: 'registration', action: 'Patient registered', detail: 'Suresh Rao (PT-0126) added to system', user: 'Reception', module: 'Patients' },
  { id: 13, ts: '25 Jun 2026, 10:05 AM', type: 'prescription', action: 'Prescription issued', detail: 'Azithromycin 500mg for Anjali Shah', user: 'Dr. Neerav Joshi', module: 'Patients' },
  { id: 14, ts: '24 Jun 2026, 07:45 PM', type: 'discharge', action: 'Discharge summary generated', detail: 'Auto-summary created for Priya Joshi (IPD-2026-039)', user: 'System', module: 'IPD' },
  { id: 15, ts: '24 Jun 2026, 05:20 PM', type: 'alert', action: 'Critical lab value flagged', detail: 'Potassium 6.8 mEq/L — critical high for Sunita Sharma', user: 'System', module: 'Labs' },
];

const TYPE_CONFIG = {
  registration: { label: 'Registration', color: '#0891b2', bg: 'rgba(8,145,178,0.10)', icon: UserPlus },
  admission:    { label: 'Admission',    color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', icon: BedDouble },
  discharge:    { label: 'Discharge',    color: '#15803d', bg: 'rgba(78,179,116,0.10)', icon: LogOut },
  lab:          { label: 'Lab',          color: '#d9a441', bg: 'rgba(217,164,65,0.10)', icon: FlaskConical },
  billing:      { label: 'Billing',      color: '#0369a1', bg: 'rgba(3,105,161,0.10)',  icon: Receipt },
  prescription: { label: 'Prescription', color: '#059669', bg: 'rgba(5,150,105,0.10)',  icon: Pill },
  alert:        { label: 'Alert',        color: '#d95050', bg: 'rgba(217,80,80,0.10)',   icon: AlertTriangle },
  settings:     { label: 'Settings',     color: '#64748b', bg: 'rgba(100,116,139,0.10)', icon: Settings },
};

const ALL_TYPES = ['all', ...Object.keys(TYPE_CONFIG)];
const MODULE_OPTIONS = ['All modules', 'Patients', 'IPD', 'Labs', 'Billing', 'Settings'];

const KPI = [
  { label: 'Total events today', value: 10, color: '#0891b2' },
  { label: 'Registrations', value: 2, color: '#0891b2' },
  { label: 'Admissions / Discharges', value: 3, color: '#7c3aed' },
  { label: 'Alerts triggered', value: 2, color: '#d95050' },
];

export default function ActivityLog() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('All modules');
  const [moduleOpen, setModuleOpen] = useState(false);

  const filtered = LOGS.filter(log => {
    const matchType = typeFilter === 'all' || log.type === typeFilter;
    const matchModule = moduleFilter === 'All modules' || log.module === moduleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || log.action.toLowerCase().includes(q) || log.detail.toLowerCase().includes(q) || log.user.toLowerCase().includes(q);
    return matchType && matchModule && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'mv-fade 200ms ease both' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>Reports</div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--fg-on-light)' }}>Activity Log</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--fg-on-light-muted)' }}>All actions performed across the hospital system.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border-ui)', background: 'var(--surface)', color: 'var(--fg-on-light-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {KPI.map(k => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-on-light-muted)', fontWeight: 600, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 300, color: k.color, lineHeight: 1 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-on-light-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actions, users…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid var(--border-ui)', borderRadius: 8, background: 'var(--surface)', color: 'var(--fg-on-light)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Type filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ALL_TYPES.map(t => {
            const cfg = TYPE_CONFIG[t];
            const active = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: active ? (cfg ? cfg.bg : 'rgba(15,23,42,0.08)') : 'var(--surface)',
                  color: active ? (cfg ? cfg.color : 'var(--fg-on-light)') : 'var(--fg-on-light-muted)',
                  outline: active ? `1px solid ${cfg ? cfg.color : 'var(--border-ui)'}` : '1px solid var(--border-card)',
                }}
              >
                {t === 'all' ? 'All types' : cfg.label}
              </button>
            );
          })}
        </div>

        {/* Module filter */}
        <div style={{ position: 'relative' }}>
          <Filter size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-on-light-muted)', pointerEvents: 'none' }} />
          <select
            value={moduleFilter}
            onMouseDown={() => setModuleOpen(o => !o)}
            onChange={e => { setModuleFilter(e.target.value); setModuleOpen(false); }}
            onBlur={() => setModuleOpen(false)}
            style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--border-ui)', borderRadius: 8, background: 'var(--surface)', color: 'var(--fg-on-light)', fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none' }}
          >
            {MODULE_OPTIONS.map(m => <option key={m}>{m}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 9, top: '50%', transform: `translateY(-50%) rotate(${moduleOpen ? '180deg' : '0deg'})`, transition: 'transform 180ms ease', color: 'var(--fg-on-light-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Log table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 110px 1fr 160px 100px', padding: '11px 20px', background: 'var(--surface-subtle)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
          <div>Timestamp</div>
          <div>Type</div>
          <div>Action / Detail</div>
          <div>Performed by</div>
          <div>Module</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-on-light-muted)' }}>
            <Activity size={28} style={{ opacity: 0.25, marginBottom: 10 }} />
            <div style={{ fontSize: 14 }}>No activity matches your filters.</div>
          </div>
        ) : (
          filtered.map((log, i) => {
            const cfg = TYPE_CONFIG[log.type];
            const Icon = cfg.icon;
            return (
              <div
                key={log.id}
                style={{ display: 'grid', gridTemplateColumns: '160px 110px 1fr 160px 100px', padding: '13px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-card)', alignItems: 'center', transition: 'background 100ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', lineHeight: 1.5 }}>{log.ts}</div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 8px', borderRadius: 10, background: cfg.bg, color: cfg.color, fontWeight: 500 }}>
                    <Icon size={10} />
                    {cfg.label}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)', marginBottom: 2 }}>{log.action}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', lineHeight: 1.4 }}>{log.detail}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>{log.user}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>{log.module}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer count */}
      <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', textAlign: 'right' }}>
        Showing {filtered.length} of {LOGS.length} events
      </div>
    </div>
  );
}
