import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, ClipboardList, Pill, FlaskConical,
  Activity, Folder, Clock, Receipt, BedDouble, AlertTriangle,
  Phone, Mail, MapPin, Calendar, User, Heart, Printer, Pencil,
  AlertOctagon, Shield, X, Check,
} from 'lucide-react';

// ── DATA ─────────────────────────────────────────────────────────────────────

const PATIENTS = {
  'PT-0128': {
    name: 'Kiran Desai', initials: 'KD', age: 34, sex: 'Male', blood: 'B+',
    phone: '98765 43210', email: 'kiran.desai@email.com',
    address: '12, Nehru Nagar, Ahmedabad',
    registered: '10 Jun 2026', status: 'active',
    hasAllergy: false, allergies: [],
    tags: ['Diabetes', 'Hypertension'],
    insurance: 'Star Health · POL-2024-98765',
    emergency: { name: 'Priya Desai', relation: 'Spouse', phone: '98765 43211' },
    visits: [
      { date: '22 Jun 2026', doctor: 'Dr. Priya Mehta', dept: 'General', notes: 'Blood sugar review, adjusted metformin dose.' },
      { date: '08 Jun 2026', doctor: 'Dr. Priya Mehta', dept: 'General', notes: 'Routine checkup, BP controlled.' },
    ],
    prescriptions: [
      { date: '22 Jun 2026', drug: 'Metformin 500mg', dosage: '1-0-1', duration: '30 days', doctor: 'Dr. Priya Mehta' },
      { date: '22 Jun 2026', drug: 'Amlodipine 5mg', dosage: '1-0-0', duration: '30 days', doctor: 'Dr. Priya Mehta' },
    ],
    labs: [
      { date: '20 Jun 2026', test: 'HbA1c', result: '7.2%', normal: '< 5.7%', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)' },
      { date: '20 Jun 2026', test: 'Fasting Glucose', result: '126 mg/dL', normal: '70–100', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)' },
      { date: '20 Jun 2026', test: 'Creatinine', result: '0.9 mg/dL', normal: '0.6–1.2', status: 'Normal', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.1)' },
    ],
    vitals: [
      { date: '22 Jun 2026', bp: '138/88', pulse: '78', spo2: '98%', temp: '98.4°F', wt: '72 kg' },
      { date: '08 Jun 2026', bp: '142/90', pulse: '82', spo2: '97%', temp: '98.6°F', wt: '73 kg' },
    ],
    billings: [
      { id: 'INV-2026-0035', date: '22 Jun 2026', amount: 1200, paid: 1200, status: 'Paid' },
      { id: 'INV-2026-0020', date: '08 Jun 2026', amount: 800, paid: 800, status: 'Paid' },
    ],
    admissions: [],
  },
  'PT-0127': {
    name: 'Meena Agarwal', initials: 'MA', age: 52, sex: 'Female', blood: 'O+',
    phone: '87654 32109', email: 'meena.agarwal@email.com',
    address: '45, Shastri Nagar, Jaipur',
    registered: '08 Jun 2026', status: 'admitted',
    hasAllergy: true, allergies: ['Penicillin', 'Sulfa drugs'],
    tags: ['Hypertension'],
    insurance: 'HDFC ERGO · POL-2023-54321',
    emergency: { name: 'Rajesh Agarwal', relation: 'Husband', phone: '87654 32110' },
    visits: [
      { date: '08 Jun 2026', doctor: 'Dr. Arjun Rao', dept: 'Cardiology', notes: 'BP elevated, admitted for monitoring.' },
    ],
    prescriptions: [
      { date: '08 Jun 2026', drug: 'Amlodipine 10mg', dosage: '1-0-0', duration: '30 days', doctor: 'Dr. Arjun Rao' },
      { date: '08 Jun 2026', drug: 'Losartan 50mg', dosage: '1-0-0', duration: '30 days', doctor: 'Dr. Arjun Rao' },
    ],
    labs: [
      { date: '09 Jun 2026', test: 'ECG', result: 'Sinus rhythm', normal: 'Normal sinus', status: 'Normal', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.1)' },
    ],
    vitals: [
      { date: '09 Jun 2026', bp: '158/98', pulse: '88', spo2: '96%', temp: '99.1°F', wt: '68 kg' },
    ],
    billings: [
      { id: 'INV-2026-0040', date: '08 Jun 2026', amount: 5500, paid: 0, status: 'Pending' },
    ],
    admissions: [
      { id: 'ADM-0012', ward: 'Semi-Private', bed: 'B-204', admitted: '08 Jun 2026', doctor: 'Dr. Arjun Rao', status: 'Admitted' },
    ],
  },
};

const DEFAULT_PATIENT = {
  name: 'Patient', initials: 'PT', age: 0, sex: '-', blood: '-',
  phone: '-', email: '-', address: '-', registered: '-',
  status: 'active', hasAllergy: false, allergies: [], tags: [],
  insurance: '', emergency: { name: '-', relation: '-', phone: '-' },
  visits: [], prescriptions: [], labs: [], vitals: [], billings: [], admissions: [],
};

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: FileText },
  { id: 'visits',        label: 'Visits',         icon: ClipboardList, countKey: 'visits' },
  { id: 'prescriptions', label: 'Prescriptions',  icon: Pill,          countKey: 'prescriptions' },
  { id: 'labs',          label: 'Lab Results',    icon: FlaskConical,  countKey: 'labs' },
  { id: 'vitals',        label: 'Vitals',         icon: Activity,      countKey: 'vitals' },
  { id: 'documents',     label: 'Documents',      icon: Folder },
  { id: 'timeline',      label: 'Timeline',       icon: Clock },
  { id: 'billing',       label: 'Billing',        icon: Receipt,       countKey: 'billings' },
  { id: 'admissions',    label: 'IPD Admissions', icon: BedDouble,     countKey: 'admissions' },
];

const STATUS_BADGE = {
  active:     { label: 'Active',     color: '#15803d', bg: 'rgba(78,179,116,0.12)' },
  admitted:   { label: 'Admitted',   color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  discharged: { label: 'Discharged', color: '#995f2f', bg: 'rgba(153,95,47,0.12)' },
  archived:   { label: 'Archived',   color: 'var(--fg-on-light-muted)', bg: 'var(--surface-subtle)' },
};

const C = {
  text: 'var(--fg-on-light)', muted: 'var(--fg-on-light-muted)',
  surface: 'var(--surface)', subtleBg: 'var(--surface-subtle)',
  primary: '#0891b2', border: 'var(--border-card)',
};

const inp = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 6, fontFamily: 'inherit', fontSize: 14, outline: 'none',
  background: 'var(--bg-canvas)', color: 'var(--fg-on-light)', boxSizing: 'border-box',
};

const lbl = {
  display: 'block', fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--fg-on-light-muted)', marginBottom: 4,
};

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
      {Icon && <Icon size={14} color={C.muted} style={{ marginTop: 2, flexShrink: 0 }} />}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: C.text }}>{value}</div>
      </div>
    </div>
  );
}

// ── EMPTY EDIT FORM (never null — keeps React Compiler safe) ─────────────────

const EMPTY_EDIT = {
  name: '', age: '', sex: 'Male', blood: 'O+', phone: '', email: '',
  address: '', allergies: '', tags: '',
  emergencyName: '', emergencyRelation: '', emergencyPhone: '', insurance: '',
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [patient, setPatient] = useState(PATIENTS[id] ?? { ...DEFAULT_PATIENT, name: id });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // React Compiler safe: pre-compute ALL derived values before any JSX.
  // ef is always an object (never null) so the compiler can safely hoist ef.* accesses.
  const patientAllergies = patient.allergies ?? [];
  const patientTags = patient.tags ?? [];
  const statusBadge = STATUS_BADGE[patient.status] ?? STATUS_BADGE.active;
  const ef = editForm !== null ? editForm : EMPTY_EDIT;
  const isEditOpen = editOpen;

  const openEdit = () => {
    setEditForm({
      name: patient.name,
      age: String(patient.age),
      sex: patient.sex,
      blood: patient.blood,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      allergies: patientAllergies.join(', '),
      tags: patientTags.join(', '),
      emergencyName: patient.emergency.name,
      emergencyRelation: patient.emergency.relation,
      emergencyPhone: patient.emergency.phone,
      insurance: patient.insurance || '',
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditForm(null);
  };

  const setField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  const saveEdit = () => {
    if (!editForm) return;
    const newAllergies = editForm.allergies.split(',').map((s) => s.trim()).filter(Boolean);
    setPatient((prev) => ({
      ...prev,
      name: editForm.name || prev.name,
      age: parseInt(editForm.age) || prev.age,
      sex: editForm.sex,
      blood: editForm.blood,
      phone: editForm.phone,
      email: editForm.email,
      address: editForm.address,
      allergies: newAllergies,
      hasAllergy: newAllergies.length > 0,
      tags: editForm.tags.split(',').map((s) => s.trim()).filter(Boolean),
      emergency: {
        name: editForm.emergencyName,
        relation: editForm.emergencyRelation,
        phone: editForm.emergencyPhone,
      },
      insurance: editForm.insurance,
    }));
    closeEdit();
  };

  const fmt = (n) => '₹' + n.toLocaleString('en-IN');

  const printPatient = () => {
    const fmtLocal = (n) => '₹' + n.toLocaleString('en-IN');
    const visitsHtml = patient.visits.length === 0
      ? '<p class="empty">No visits recorded.</p>'
      : patient.visits.map((v) => `<div class="item"><div class="item-hd"><strong>${v.date}</strong><span class="muted">${v.doctor} &middot; ${v.dept}</span></div><p class="muted" style="margin:4px 0 0;">${v.notes}</p></div>`).join('');
    const rxHtml = patient.prescriptions.length === 0
      ? '<p class="empty">No prescriptions.</p>'
      : `<table><tr><th>Drug</th><th>Dosage</th><th>Duration</th><th>Prescribed by</th><th>Date</th></tr>${patient.prescriptions.map((r) => `<tr><td>${r.drug}</td><td>${r.dosage}</td><td>${r.duration}</td><td>${r.doctor}</td><td>${r.date}</td></tr>`).join('')}</table>`;
    const labsHtml = patient.labs.length === 0
      ? '<p class="empty">No lab results.</p>'
      : `<table><tr><th>Test</th><th>Result</th><th>Normal Range</th><th>Status</th><th>Date</th></tr>${patient.labs.map((l) => `<tr><td>${l.test}</td><td>${l.result}</td><td>${l.normal}</td><td>${l.status}</td><td>${l.date}</td></tr>`).join('')}</table>`;
    const vitalsHtml = patient.vitals.length === 0
      ? '<p class="empty">No vitals recorded.</p>'
      : `<table><tr><th>Date</th><th>BP</th><th>Pulse</th><th>SpO2</th><th>Temp</th><th>Weight</th></tr>${patient.vitals.map((v) => `<tr><td>${v.date}</td><td>${v.bp}</td><td>${v.pulse} bpm</td><td>${v.spo2}</td><td>${v.temp}</td><td>${v.wt}</td></tr>`).join('')}</table>`;
    const billHtml = patient.billings.length === 0
      ? '<p class="empty">No billing records.</p>'
      : `<table><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Paid</th><th>Status</th></tr>${patient.billings.map((b) => `<tr><td>${b.id}</td><td>${b.date}</td><td>${fmtLocal(b.amount)}</td><td>${fmtLocal(b.paid)}</td><td>${b.status}</td></tr>`).join('')}</table>`;
    const admHtml = patient.admissions.length === 0
      ? '<p class="empty">No admissions on record.</p>'
      : `<table><tr><th>ID</th><th>Ward</th><th>Bed</th><th>Admitted</th><th>Doctor</th><th>Status</th></tr>${patient.admissions.map((a) => `<tr><td>${a.id}</td><td>${a.ward}</td><td>${a.bed}</td><td>${a.admitted}</td><td>${a.doctor}</td><td>${a.status}</td></tr>`).join('')}</table>`;

    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Patient Record – ${patient.name}</title><style>
      *{box-sizing:border-box;}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:32px;color:#0f172a;max-width:960px;margin:0 auto;}
      h1{font-size:22px;margin:0 0 4px;font-weight:600;}
      .meta{font-size:13px;color:#64748b;display:flex;gap:16px;flex-wrap:wrap;margin:4px 0 20px;}
      h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin:24px 0 8px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;}
      .demo{display:grid;grid-template-columns:140px 1fr;row-gap:6px;font-size:13px;margin-bottom:8px;}
      .demo-lbl{color:#64748b;}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:4px;}
      th{text-align:left;padding:7px 10px;background:#f1f5f9;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;font-weight:600;}
      td{padding:8px 10px;border-top:1px solid #e2e8f0;}
      .item{margin-bottom:10px;padding:12px;border:1px solid #e2e8f0;border-radius:6px;}
      .item-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:13px;}
      .muted{color:#64748b;font-size:13px;}
      .empty{color:#64748b;font-size:13px;margin:4px 0;}
      .allergy-banner{background:rgba(217,80,80,0.06);border:1px solid rgba(217,80,80,0.28);border-left:4px solid #d95050;border-radius:0 6px 6px 0;padding:10px 14px;margin-bottom:20px;}
      @media print{body{padding:16px;}@page{margin:16mm;}}
    </style></head><body>
      <h1>${patient.name}</h1>
      <div class="meta">
        <span>${id}</span><span>${patient.age} yrs, ${patient.sex}</span>
        <span>Blood ${patient.blood}</span><span>${patient.phone}</span>
        <span>Reg ${patient.registered}</span>
      </div>
      ${patientAllergies.length > 0 ? `<div class="allergy-banner"><strong style="font-size:13px;color:#a13030;letter-spacing:0.04em;">ALLERGY ALERT</strong><div style="font-size:13px;color:#7a2424;margin-top:3px;">${patientAllergies.join(' &middot; ')}</div></div>` : ''}

      <h2>Demographics</h2>
      <div class="demo">
        <span class="demo-lbl">Full name</span><span>${patient.name}</span>
        <span class="demo-lbl">Age / Sex</span><span>${patient.age} yrs, ${patient.sex}</span>
        <span class="demo-lbl">Blood group</span><span>${patient.blood}</span>
        <span class="demo-lbl">Phone</span><span>${patient.phone}</span>
        <span class="demo-lbl">Email</span><span>${patient.email}</span>
        <span class="demo-lbl">Address</span><span>${patient.address}</span>
        ${patient.insurance ? `<span class="demo-lbl">Insurance</span><span>${patient.insurance}</span>` : ''}
        <span class="demo-lbl">Emergency</span><span>${patient.emergency.name} (${patient.emergency.relation}) &ndash; ${patient.emergency.phone}</span>
      </div>

      <h2>Visits</h2>${visitsHtml}
      <h2>Prescriptions</h2>${rxHtml}
      <h2>Lab Results</h2>${labsHtml}
      <h2>Vitals</h2>${vitalsHtml}
      <h2>Billing</h2>${billHtml}
      <h2>IPD Admissions</h2>${admHtml}
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Breadcrumb back button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/patients')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--surface)', border: '1px solid var(--border-card)',
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
            fontSize: 13, color: C.primary, fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={13} />
          <span style={{ color: C.primary }}>All patients</span>
          <span style={{ color: 'var(--fg-on-light-muted)', margin: '0 2px' }}>/</span>
          <span style={{ color: 'var(--fg-on-light)', fontWeight: 500 }}>{patient.name}</span>
        </button>
      </div>

      {/* Header card */}
      <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 300, color: 'white', flexShrink: 0 }}>
            {patient.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: C.text }}>{patient.name}</h2>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: statusBadge.bg, color: statusBadge.color, fontWeight: 500 }}>
                {statusBadge.label}
              </span>
              {patient.hasAllergy && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#d95050', background: 'rgba(217,80,80,0.10)', padding: '3px 8px', borderRadius: 10 }}>
                  <AlertTriangle size={11} /> Allergies
                </span>
              )}
              {patientTags.map((t) => (
                <span key={t} style={{ fontSize: 11, padding: '3px 8px', background: C.subtleBg, color: C.muted, borderRadius: 10 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: C.muted }}>{id}</span>
              <span style={{ fontSize: 13, color: C.muted }}>{patient.age} yrs, {patient.sex}</span>
              <span style={{ fontSize: 13, color: C.muted }}>Blood <strong style={{ color: C.text }}>{patient.blood}</strong></span>
              <span style={{ fontSize: 13, color: C.muted }}>{patient.phone}</span>
              <span style={{ fontSize: 13, color: C.muted }}>Reg {patient.registered}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={printPatient} style={{ background: 'transparent', color: C.text, border: '1px solid var(--border-strong)', padding: '8px 14px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={openEdit} style={{ background: 'transparent', color: C.text, border: '1px solid var(--border-strong)', padding: '8px 14px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Allergy alert banner */}
      {patientAllergies.length > 0 && (
        <div style={{ background: 'rgba(217,80,80,0.06)', border: '1px solid rgba(217,80,80,0.28)', borderLeft: '4px solid #d95050', borderRadius: 8, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertOctagon size={20} color="#d95050" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#a13030', letterSpacing: '0.04em' }}>ALLERGY ALERT</div>
            <div style={{ fontSize: 13, color: '#7a2424', marginTop: 2 }}>{patientAllergies.join(' · ')}</div>
          </div>
        </div>
      )}

      {/* Tabs — hidden scrollbar */}
      <div className="tab-bar" style={{ overflowX: 'auto', marginBottom: 20, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = t.countKey ? patient[t.countKey]?.length : null;
          return (
            <button key={t.id} className={`tab-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={14} />
              {t.label}
              {count != null && <span style={{ opacity: 0.55 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div key={tab} style={{ animation: 'mv-fade 180ms ease both' }}>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 16 }}>Demographics</div>
              <InfoRow label="Full name"   value={patient.name}                          icon={User} />
              <InfoRow label="Age / Sex"   value={`${patient.age} yrs, ${patient.sex}`}  icon={User} />
              <InfoRow label="Blood group" value={patient.blood}                          icon={Heart} />
              <InfoRow label="Phone"       value={patient.phone}                          icon={Phone} />
              <InfoRow label="Email"       value={patient.email}                          icon={Mail} />
              <InfoRow label="Address"     value={patient.address}                        icon={MapPin} />
              <InfoRow label="Registered"  value={patient.registered}                     icon={Calendar} />
              {patient.insurance && <InfoRow label="Insurance" value={patient.insurance} icon={Shield} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 16 }}>Emergency contact</div>
                <InfoRow label="Name"     value={patient.emergency.name} />
                <InfoRow label="Relation" value={patient.emergency.relation} />
                <InfoRow label="Phone"    value={patient.emergency.phone} icon={Phone} />
              </div>
              <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 12 }}>Allergies</div>
                {patientAllergies.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>No known allergies recorded.</div>
                ) : patientAllergies.map((a) => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(217,80,80,0.06)', borderLeft: '3px solid #d95050', borderRadius: '0 6px 6px 0', marginBottom: 8 }}>
                    <AlertTriangle size={13} color="#d95050" />
                    <span style={{ fontSize: 13, color: C.text }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'visits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {patient.visits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>No visits recorded.</div>
            ) : patient.visits.map((v, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v.date}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{v.doctor} · {v.dept}</div>
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{v.notes}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'prescriptions' && (
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.6fr 1fr', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
              <div>Drug</div><div>Dosage</div><div>Duration</div><div>Prescribed by</div>
            </div>
            {patient.prescriptions.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No prescriptions on record.</div>
            ) : patient.prescriptions.map((rx, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 0.6fr 1fr', padding: '13px 20px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{rx.drug}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{rx.dosage}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{rx.duration}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{rx.doctor} · {rx.date}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'labs' && (
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.7fr', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
              <div>Test</div><div>Result</div><div>Normal Range</div><div>Status</div>
            </div>
            {patient.labs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No lab results on record.</div>
            ) : patient.labs.map((lab, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.7fr', padding: '13px 20px', borderTop: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{lab.test}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{lab.date}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{lab.result}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{lab.normal}</div>
                <div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: lab.statusBg, color: lab.statusColor, fontWeight: 500 }}>
                    {lab.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'vitals' && (
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
              <div>Date</div><div>BP</div><div>Pulse</div><div>SpO₂</div><div>Temp</div><div>Weight</div>
            </div>
            {patient.vitals.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No vitals recorded.</div>
            ) : patient.vitals.map((v, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted }}>{v.date}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{v.bp}</div>
                <div style={{ fontSize: 13, color: C.text }}>{v.pulse} bpm</div>
                <div style={{ fontSize: 13, color: C.text }}>{v.spo2}</div>
                <div style={{ fontSize: 13, color: C.text }}>{v.temp}</div>
                <div style={{ fontSize: 13, color: C.text }}>{v.wt}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'billing' && (
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.8fr', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
              <div>Invoice</div><div>Date</div><div>Amount</div><div>Status</div>
            </div>
            {patient.billings.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No bills on record.</div>
            ) : patient.billings.map((b, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.8fr', padding: '13px 20px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted }}>{b.id}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{b.date}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{fmt(b.amount)}</div>
                <div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, fontWeight: 500, background: b.status === 'Paid' ? 'rgba(78,179,116,0.1)' : 'rgba(217,164,65,0.1)', color: b.status === 'Paid' ? '#15803d' : '#854d0e' }}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'admissions' && (
          patient.admissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🛏</div>
              <div style={{ fontSize: 14 }}>No admissions on record.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patient.admissions.map((a, i) => (
                <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 4 }}>{a.id}</div>
                      <div style={{ fontSize: 13, color: C.muted }}>Ward: {a.ward} · Bed: {a.bed}</div>
                      <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Admitted {a.admitted} · {a.doctor}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'rgba(8,145,178,0.12)', color: '#0891b2', fontWeight: 500 }}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {['documents', 'timeline'].includes(tab) && (
          <div style={{ textAlign: 'center', padding: 64, color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>{tab === 'documents' ? '📁' : '⏱'}</div>
            <div style={{ fontSize: 14 }}>No {tab} records found for this patient.</div>
          </div>
        )}
      </div>

      {/* Edit modal — ef is always non-null so React Compiler can never hoist a null deref */}
      {isEditOpen && createPortal(
        <div className="modal-backdrop" onClick={closeEdit} style={{ alignItems: 'flex-start', paddingTop: 32 }}>
          <div
            className="modal-panel"
            style={{ maxWidth: 620, maxHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>Edit Patient</div>
                <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>{patient.name}</div>
              </div>
              <button onClick={closeEdit} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-on-light-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Full Name *</span>
                  <input style={inp} value={ef.name} onChange={(e) => setField('name', e.target.value)} placeholder="Patient full name" />
                </label>
                <label>
                  <span style={lbl}>Age</span>
                  <input style={inp} type="number" value={ef.age} onChange={(e) => setField('age', e.target.value)} />
                </label>
                <label>
                  <span style={lbl}>Sex</span>
                  <select style={inp} value={ef.sex} onChange={(e) => setField('sex', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Phone</span>
                  <input style={inp} value={ef.phone} onChange={(e) => setField('phone', e.target.value)} />
                </label>
                <label>
                  <span style={lbl}>Email</span>
                  <input style={inp} type="email" value={ef.email} onChange={(e) => setField('email', e.target.value)} />
                </label>
                <label>
                  <span style={lbl}>Blood Group</span>
                  <select style={inp} value={ef.blood} onChange={(e) => setField('blood', e.target.value)}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </label>
              </div>

              <label>
                <span style={lbl}>Address</span>
                <input style={inp} value={ef.address} onChange={(e) => setField('address', e.target.value)} />
              </label>

              <label>
                <span style={lbl}>Allergies (comma separated)</span>
                <input style={inp} placeholder="e.g. Penicillin, Latex" value={ef.allergies} onChange={(e) => setField('allergies', e.target.value)} />
              </label>

              <label>
                <span style={lbl}>Tags (comma separated)</span>
                <input style={inp} placeholder="e.g. Chronic, Diabetes" value={ef.tags} onChange={(e) => setField('tags', e.target.value)} />
              </label>

              <div>
                <div style={lbl}>Emergency Contact</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <input style={inp} placeholder="Name" value={ef.emergencyName} onChange={(e) => setField('emergencyName', e.target.value)} />
                  <input style={inp} placeholder="Relation" value={ef.emergencyRelation} onChange={(e) => setField('emergencyRelation', e.target.value)} />
                  <input style={inp} placeholder="Phone" value={ef.emergencyPhone} onChange={(e) => setField('emergencyPhone', e.target.value)} />
                </div>
              </div>

              <label>
                <span style={lbl}>Insurance</span>
                <input style={inp} placeholder="Provider · Policy #" value={ef.insurance} onChange={(e) => setField('insurance', e.target.value)} />
              </label>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--surface-subtle)' }}>
              <button onClick={closeEdit} style={{ background: 'transparent', color: 'var(--fg-on-light)', border: '1px solid var(--border-strong)', padding: '9px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEdit} className="btn-primary">
                <Check size={15} /> Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
