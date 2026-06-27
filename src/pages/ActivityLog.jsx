import { useState } from 'react';
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

const LOGS = [
  {
    id: 1,
    date: '26 Jun 2026',
    time: '11:42 AM',
    type: 'registration',
    action: 'Registered new patient',
    detail: 'Kiran Desai (PT-0128) · Age 32, Female, Blood A+',
    fullDetail:
      'Reception registered Kiran Desai (PT-0128) · Age 32, Female, Blood Group A+ · Walk-in at OPD · Referred by Dr. Priya Mehta · Contact: 98765-43210',
    user: 'Reception',
    module: 'Patients',
  },
  {
    id: 2,
    date: '26 Jun 2026',
    time: '11:15 AM',
    type: 'admission',
    action: 'New IPD admission created',
    detail: 'Ramesh Patel admitted to General Ward · Bed 4A',
    fullDetail:
      'Dr. Priya Mehta admitted Ramesh Patel (IPD-2026-043) · Ward: General · Bed 4A · Diagnosis: Hypertensive Emergency · Priority: High · Emergency contact notified',
    user: 'Dr. Priya Mehta',
    module: 'IPD',
  },
  {
    id: 3,
    date: '26 Jun 2026',
    time: '10:58 AM',
    type: 'lab',
    action: 'Lab result uploaded',
    detail: 'HbA1c result for Kiran Desai — 7.2% (High)',
    fullDetail:
      'Lab Technician uploaded HbA1c = 7.2% for Kiran Desai (PT-0128) · Reference range: 4.0–5.6% · Marked HIGH · Attending physician Dr. Priya Mehta notified automatically',
    user: 'Lab Technician',
    module: 'Labs',
  },
  {
    id: 4,
    date: '26 Jun 2026',
    time: '10:30 AM',
    type: 'billing',
    action: 'Invoice generated',
    detail: 'INV-2026-0035 · ₹1,200 for Kiran Desai',
    fullDetail:
      'Reception generated invoice INV-2026-0035 for Kiran Desai (PT-0128) · Consultation fee: ₹800 · Lab charges: ₹400 · Total: ₹1,200 · Payment pending',
    user: 'Reception',
    module: 'Billing',
  },
  {
    id: 5,
    date: '26 Jun 2026',
    time: '09:55 AM',
    type: 'prescription',
    action: 'Prescription issued',
    detail: 'Metformin 500mg + Amlodipine 5mg for Kiran Desai',
    fullDetail:
      'Dr. Priya Mehta prescribed Metformin 500mg BD + Amlodipine 5mg OD for Kiran Desai (PT-0128) · Duration: 30 days · Dispensed from pharmacy · 2 refills allowed',
    user: 'Dr. Priya Mehta',
    module: 'Patients',
  },
  {
    id: 6,
    date: '26 Jun 2026',
    time: '09:22 AM',
    type: 'discharge',
    action: 'Patient discharged',
    detail: 'Anita Verma (IPD-2026-041) discharged from ICU',
    fullDetail:
      'Dr. Rajan Sinha discharged Anita Verma (IPD-2026-041) from ICU · Stay: 4 days · Final diagnosis: Acute Myocardial Infarction · Follow-up scheduled in 7 days · Discharge summary auto-generated',
    user: 'Dr. Rajan Sinha',
    module: 'IPD',
  },
  {
    id: 7,
    date: '25 Jun 2026',
    time: '06:10 PM',
    type: 'alert',
    action: 'Allergy alert triggered',
    detail: 'Penicillin allergy flagged for Meena Agarwal',
    fullDetail:
      'System auto-flagged Penicillin allergy for Meena Agarwal (PT-0115) · Triggered when nurse attempted to record Amoxicillin prescription · Attending doctor notified immediately · Prescription blocked',
    user: 'System',
    module: 'Patients',
  },
  {
    id: 8,
    date: '25 Jun 2026',
    time: '05:44 PM',
    type: 'billing',
    action: 'Payment recorded',
    detail: 'INV-2026-0020 · ₹800 marked as Paid',
    fullDetail:
      'Cashier recorded payment for INV-2026-0020 · Patient: Vijay Kumar (PT-0119) · Amount: ₹800 · Payment mode: Cash · Receipt no: RCP-0094 · Balance: ₹0',
    user: 'Cashier',
    module: 'Billing',
  },
  {
    id: 9,
    date: '25 Jun 2026',
    time: '04:30 PM',
    type: 'lab',
    action: 'Lab order placed',
    detail: 'CBC + LFT ordered for Sunita Sharma (IPD-2026-042)',
    fullDetail:
      'Dr. Rajan Sinha ordered CBC + LFT for Sunita Sharma (IPD-2026-042) · Priority: Urgent · Sent to Pathology lab · Expected TAT: 2 hours · Sample collected at bedside',
    user: 'Dr. Rajan Sinha',
    module: 'Labs',
  },
  {
    id: 10,
    date: '25 Jun 2026',
    time: '03:15 PM',
    type: 'admission',
    action: 'Bed transfer',
    detail: 'Vijay Kumar moved from ICU Bed 3 to General Bed 6C',
    fullDetail:
      'Nurse Station transferred Vijay Kumar (IPD-2026-040) from ICU Bed 3 to General Ward Bed 6C · Reason: Condition stabilized · Approved by Dr. Rajan Sinha · Ward nurse notified',
    user: 'Nurse Station',
    module: 'IPD',
  },
  {
    id: 11,
    date: '25 Jun 2026',
    time: '02:00 PM',
    type: 'settings',
    action: 'Settings updated',
    detail: 'Hospital working hours changed to 08:00 – 21:00',
    fullDetail:
      'Admin updated hospital working hours from 08:00–20:00 to 08:00–21:00 · Change effective immediately · All 28 staff members notified via system alert',
    user: 'Admin',
    module: 'Settings',
  },
  {
    id: 12,
    date: '25 Jun 2026',
    time: '11:30 AM',
    type: 'registration',
    action: 'Patient registered',
    detail: 'Suresh Rao (PT-0126) added to system',
    fullDetail:
      'Reception registered Suresh Rao (PT-0126) · Age 58, Male, Blood B+ · Emergency case · Referred from City Clinic, Surat · Contact: 99887-65432',
    user: 'Reception',
    module: 'Patients',
  },
  {
    id: 13,
    date: '25 Jun 2026',
    time: '10:05 AM',
    type: 'prescription',
    action: 'Prescription issued',
    detail: 'Azithromycin 500mg for Anjali Shah',
    fullDetail:
      'Dr. Neerav Joshi prescribed Azithromycin 500mg OD for Anjali Shah (PT-0119) · Duration: 5 days · Diagnosis: Respiratory tract infection · No known drug allergies · Dispensed from pharmacy',
    user: 'Dr. Neerav Joshi',
    module: 'Patients',
  },
  {
    id: 14,
    date: '24 Jun 2026',
    time: '07:45 PM',
    type: 'discharge',
    action: 'Discharge summary generated',
    detail: 'Auto-summary created for Priya Joshi (IPD-2026-039)',
    fullDetail:
      'System auto-generated discharge summary for Priya Joshi (IPD-2026-039) · Length of stay: 6 days · Procedure: Appendectomy (successful) · Post-discharge care instructions included · Copy sent to patient email',
    user: 'System',
    module: 'IPD',
  },
  {
    id: 15,
    date: '24 Jun 2026',
    time: '05:20 PM',
    type: 'alert',
    action: 'Critical lab value flagged',
    detail: 'Potassium 6.8 mEq/L — critical high for Sunita Sharma',
    fullDetail:
      'System flagged critical Potassium = 6.8 mEq/L for Sunita Sharma (IPD-2026-042) · Reference: 3.5–5.0 mEq/L · Marked CRITICAL HIGH · Attending physician Dr. Rajan Sinha notified via system alert · Repeat test ordered',
    user: 'System',
    module: 'Labs',
  },
];

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

const patientCount = LOGS.filter((l) => l.module === 'Patients').length;
const ipdCount = LOGS.filter((l) => l.module === 'IPD').length;
const labCount = LOGS.filter((l) => l.module === 'Labs').length;
const rxCount = LOGS.filter((l) => l.type === 'prescription').length;

const STORAGE = [
  { label: 'Patient Records', count: `${patientCount} files`, color: '#0891b2' },
  { label: 'IPD Case Files', count: `${ipdCount} admissions`, color: '#2d6a9f' },
  { label: 'Lab Reports', count: `${labCount} records`, color: '#5b8a3c' },
  { label: 'Prescriptions', count: `${rxCount} records`, color: '#7c5a9b' },
];

export default function ActivityLog() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('All modules');
  const [moduleOpen, setModuleOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = LOGS.filter((log) => {
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
            Showing {filtered.length} of {LOGS.length} events
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
              {(LOGS.length * 5).toLocaleString()}
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
