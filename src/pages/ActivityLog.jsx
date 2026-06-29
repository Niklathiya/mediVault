import { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  UserPlus,
  BedDouble,
  FlaskConical,
  Receipt,
  LogOut,
  Settings,
  Pill,
  AlertTriangle,
  ChevronDown,
  HardDrive,
  Shield,
  Leaf,
  Users,
  Stethoscope,
  FileText,
  Info,
} from 'lucide-react';
import { subscribeLogs } from '../firebase/services/activityLogService.js';


const TYPE_CONFIG = {
  registration: {
    label: 'Registration',
    dot: '#4eb374',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.10)',
    icon: UserPlus,
  },
  admission: {
    label: 'Admission',
    dot: '#2D6A9F',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    icon: BedDouble,
  },
  discharge: {
    label: 'Discharge',
    dot: '#0891B2',
    color: '#15803d',
    bg: 'rgba(78,179,116,0.10)',
    icon: LogOut,
  },
  lab: {
    label: 'Lab',
    dot: '#2D6A9F',
    color: '#d9a441',
    bg: 'rgba(217,164,65,0.10)',
    icon: FlaskConical,
  },
  billing: {
    label: 'Billing',
    dot: '#2D6A9F',
    color: '#0369a1',
    bg: 'rgba(3,105,161,0.10)',
    icon: Receipt,
  },
  prescription: {
    label: 'Prescription',
    dot: '#4eb374',
    color: '#059669',
    bg: 'rgba(5,150,105,0.10)',
    icon: Pill,
  },
  alert: {
    label: 'Alert',
    dot: '#d95050',
    color: '#d95050',
    bg: 'rgba(217,80,80,0.10)',
    icon: AlertTriangle,
  },
  settings: {
    label: 'Settings',
    dot: '#9CA3AF',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.10)',
    icon: Settings,
  },
};

const MODULE_STYLE = {
  Patients: { bg: '#E0F2FE', color: '#1D4ED8' },
  IPD: { bg: '#EDE9FE', color: '#5B21B6' },
  Labs: { bg: '#F0FDF4', color: '#15803D' },
  Billing: { bg: '#F1F5F9', color: '#475569' },
  Settings: { bg: '#F8FAFC', color: '#475569' },
};

const ALL_TYPES = ['all', ...Object.keys(TYPE_CONFIG)];
const MODULE_OPTIONS = ['All modules', 'Patients', 'IPD', 'Labs', 'Billing', 'Settings'];

const KPI = [
  { label: 'Patients', value: 128, icon: Users, color: '#0891b2' },
  { label: 'Admissions', value: 43, icon: BedDouble, color: '#7c3aed' },
  { label: 'OPD Visits', value: 85, icon: Stethoscope, color: '#0891b2' },
  { label: 'Prescriptions', value: 64, icon: Pill, color: '#059669' },
  { label: 'Lab Tests', value: 37, icon: FlaskConical, color: '#d9a441' },
  { label: 'Documents', value: 210, icon: FileText, color: '#64748b' },
];

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeLogs(
      (data) => { setLogs(data); setLogsLoading(false); },
      (err)  => { console.error('logs subscription error:', err); setLogsLoading(false); },
    );
    return unsub;
  }, []);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('All modules');
  const [moduleOpen, setModuleOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const patientCount = logs.filter((l) => l.module === 'Patients').length;
  const ipdCount = logs.filter((l) => l.module === 'IPD').length;
  const labCount = logs.filter((l) => l.module === 'Labs').length;
  const rxCount = logs.filter((l) => l.type === 'prescription').length;

  const STORAGE = [
    { label: 'Patient Records', count: `${patientCount} files`, color: '#0891b2' },
    { label: 'IPD Case Files', count: `${ipdCount} admissions`, color: '#2d6a9f' },
    { label: 'Lab Reports', count: `${labCount} records`, color: '#5b8a3c' },
    { label: 'Prescriptions', count: `${rxCount} records`, color: '#7c5a9b' },
  ];

  if (logsLoading) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
      Loading activity log…
    </div>
  );

  const filtered = logs.filter((log) => {
    const matchType = typeFilter === 'all' || log.type === typeFilter;
    const matchModule = moduleFilter === 'All modules' || log.module === moduleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.detail.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q);
    return matchType && matchModule && matchSearch;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        animation: 'mv-fade 200ms ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--fg-on-light-muted)',
              fontWeight: 600,
            }}
          >
            Audit Trail
          </div>
          <h1
            style={{
              margin: '6px 0 0',
              fontSize: 36,
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'var(--fg-on-light)',
            }}
          >
            Activity Log
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--fg-on-light-muted)' }}>
            Complete record of every action performed in the system — who did what, and when.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(78,179,116,0.08)',
              border: '1px solid rgba(78,179,116,0.20)',
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#4eb374',
                flexShrink: 0,
              }}
            />
            <div>
              <div className="py-1" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}>
                System Active
                <span
                  style={{ fontSize: 12, color: '#2d7a50', opacity: 0.8, marginTop: 2 }}
                  className="ms-2"
                >
                  All records secured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip — 6 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {KPI.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-card)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(8,145,178,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} style={{ color: '#0891b2' }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 300,
                    color: 'var(--fg-on-light)',
                    lineHeight: 1,
                  }}
                >
                  {k.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--fg-on-light-muted)',
                    fontWeight: 600,
                    marginTop: 3,
                  }}
                >
                  {k.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column main layout */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, alignItems: 'start' }}
      >
        {/* Left: Filters + Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Filters — row 1: search + module */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--fg-on-light-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions, users…"
                style={{
                  width: '100%',
                  paddingLeft: 32,
                  paddingRight: 12,
                  paddingTop: 9,
                  paddingBottom: 9,
                  border: '1px solid var(--border-ui)',
                  borderRadius: 8,
                  background: 'var(--surface)',
                  color: 'var(--fg-on-light)',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Filter
                size={13}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--fg-on-light-muted)',
                  pointerEvents: 'none',
                }}
              />
              <select
                value={moduleFilter}
                onMouseDown={() => setModuleOpen((o) => !o)}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setModuleOpen(false);
                }}
                onBlur={() => setModuleOpen(false)}
                style={{
                  paddingLeft: 28,
                  paddingRight: 28,
                  paddingTop: 9,
                  paddingBottom: 9,
                  border: '1px solid var(--border-ui)',
                  borderRadius: 8,
                  background: 'var(--surface)',
                  color: 'var(--fg-on-light)',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                {MODULE_OPTIONS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <ChevronDown
                size={13}
                style={{
                  position: 'absolute',
                  right: 9,
                  top: '50%',
                  transform: `translateY(-50%) rotate(${moduleOpen ? '180deg' : '0deg'})`,
                  transition: 'transform 180ms ease',
                  color: 'var(--fg-on-light-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Filters — row 2: type tab slider */}
          <div style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '3px 1px' }}>
            <div style={{ display: 'flex', gap: 6, width: 'max-content' }}>
              {ALL_TYPES.map((t) => {
                const cfg = TYPE_CONFIG[t];
                const active = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: 'none',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      background: active
                        ? cfg
                          ? cfg.bg
                          : 'rgba(15,23,42,0.08)'
                        : 'var(--surface)',
                      color: active
                        ? cfg
                          ? cfg.color
                          : 'var(--fg-on-light)'
                        : 'var(--fg-on-light-muted)',
                      outline: active
                        ? `1px solid ${cfg ? cfg.color : 'var(--border-ui)'}`
                        : '1px solid var(--border-card)',
                    }}
                  >
                    {t === 'all' ? 'All types' : cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit Trail table */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-card)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Section header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-on-light)' }}>
                  System Audit Trail
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>
                  All staff actions · auto-captured by the system
                </div>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'rgba(78,179,116,0.10)',
                  color: '#2d7a50',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#4eb374',
                    display: 'inline-block',
                  }}
                />
                Live
              </span>
            </div>

            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 90px 80px',
                padding: '9px 20px',
                background: 'var(--surface-subtle)',
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--fg-on-light-muted)',
                fontWeight: 600,
              }}
            >
              <div>Action</div>
              <div>Performed by</div>
              <div>Module</div>
              <div>Date &amp; Time</div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-on-light-muted)' }}>
                <Activity size={28} style={{ opacity: 0.25, marginBottom: 10 }} />
                <div style={{ fontSize: 14 }}>No activity matches your filters.</div>
              </div>
            ) : (
              filtered.map((log, i) => {
                const cfg = TYPE_CONFIG[log.type];
                const modStyle = MODULE_STYLE[log.module] || { bg: '#F1F5F9', color: '#475569' };
                const isExpanded = expandedId === log.id;
                return (
                  <div key={log.id}>
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 130px 90px 80px',
                        padding: '13px 20px',
                        borderTop: i === 0 ? 'none' : '1px solid var(--border-card)',
                        alignItems: 'center',
                        transition: 'background 120ms',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(8,145,178,0.03)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.background = 'var(--surface-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Action with colored dot */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: cfg.dot,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)' }}>
                          {log.action}
                        </div>
                      </div>

                      {/* Performed by */}
                      <div
                        style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-on-light-muted)' }}
                      >
                        {log.user}
                      </div>

                      {/* Module badge */}
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 8,
                            fontSize: 10,
                            fontWeight: 600,
                            background: modStyle.bg,
                            color: modStyle.color,
                          }}
                        >
                          {log.module}
                        </span>
                      </div>

                      {/* Date & Time with expand chevron */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--fg-on-light-muted)',
                              lineHeight: 1.35,
                            }}
                          >
                            {log.date}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--fg-on-light-muted)',
                              lineHeight: 1.35,
                            }}
                          >
                            {log.time}
                          </div>
                        </div>
                        <ChevronDown
                          size={13}
                          style={{
                            color: 'var(--fg-on-light-muted)',
                            transform: `rotate(${isExpanded ? '180deg' : '0deg'})`,
                            transition: 'transform 180ms ease',
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: '10px 20px 13px 37px',
                          background: 'rgba(8,145,178,0.03)',
                          borderTop: '1px solid rgba(8,145,178,0.08)',
                          fontSize: 12,
                          color: 'var(--fg-on-light)',
                          lineHeight: 1.7,
                        }}
                      >
                        {log.fullDetail}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', textAlign: 'right' }}>
            Showing {filtered.length} of {logs.length} events
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Digital Storage */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-card)',
              borderRadius: 12,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <HardDrive size={15} style={{ color: '#0891b2' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)' }}>
                Digital Storage
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {STORAGE.map((s) => (
                <div key={s.label}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>{s.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-on-light)' }}>
                      {s.count}
                    </div>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: 'var(--surface-subtle)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${s.pct}%`,
                        borderRadius: 3,
                        background: s.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 14,
                paddingTop: 12,
                borderTop: '1px solid var(--border-card)',
                fontSize: 11,
                color: 'var(--fg-on-light-muted)',
              }}
            >
              <Shield size={12} />
              All data encrypted &amp; stored securely
            </div>
          </div>

          {/* System Info */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-card)',
              borderRadius: 12,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Info size={15} style={{ color: '#0891b2' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)' }}>
                System Info
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'System', value: 'MediVault IPD v1.0' },
                { label: 'Hospital', value: 'BAPS PSH, Surat' },
                { label: 'Deployed on', value: '01 June 2026' },
                { label: 'Total staff', value: '25' },
                { label: 'Last backup', value: 'Today, 06:00 AM', highlight: true },
              ].map((item, idx, arr) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: idx === 0 ? 0 : 10,
                    paddingBottom: 10,
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--border-card)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: item.highlight ? '#2d7a50' : 'var(--fg-on-light)',
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paper Eliminated */}
          <div
            style={{
              background: '#0891b20a',
              border: '1px solid #0891b226',
              borderRadius: 12,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Leaf size={15} style={{ color: '#0891b2' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)' }}>
                Paper Eliminated
              </div>
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 300,
                color: '#0891b2',
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {(logs.length * 5).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', lineHeight: 1.6 }}>
              Estimated paper forms eliminated since go-live. Every digital record replaces an
              average of 4–6 physical forms.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
