import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientFull, updatePatient, deletePatientSubItem } from '../firebase/services/patientService.js';
import AddVisitModal        from '../components/modals/AddVisitModal.jsx';
import AddPrescriptionModal from '../components/modals/AddPrescriptionModal.jsx';
import AddLabModal          from '../components/modals/AddLabModal.jsx';
import RecordVitalsModal    from '../components/modals/RecordVitalsModal.jsx';
import AddDocumentModal     from '../components/modals/AddDocumentModal.jsx';
import {
  ArrowLeft, FileText, ClipboardList, Pill, FlaskConical,
  Activity, Folder, Clock, Receipt, BedDouble, AlertTriangle,
  Phone, Mail, MapPin, Calendar, User, Heart, Printer, Pencil, Plus,
  AlertOctagon, Shield, X, Check, Trash2, ChevronRight, Eye,
} from 'lucide-react';




const TABS = [
  { id: 'overview',      label: 'Overview',      icon: FileText },
  { id: 'visits',        label: 'Visits',         icon: ClipboardList,  countKey: 'visits' },
  { id: 'prescriptions', label: 'Prescriptions',  icon: Pill,           countKey: 'prescriptions' },
  { id: 'labs',          label: 'Lab Results',    icon: FlaskConical,   countKey: 'labs' },
  { id: 'vitals',        label: 'Vitals',         icon: Activity,       countKey: 'vitals' },
  { id: 'documents',     label: 'Documents',      icon: Folder,         countKey: 'documents' },
  { id: 'timeline',      label: 'History',        icon: Clock },
  { id: 'billing',       label: 'Billing',        icon: Receipt,        countKey: 'billings' },
  { id: 'admissions',    label: 'IPD Admissions', icon: BedDouble,      countKey: 'admissions' },
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

const TODAY = new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) =>
  Math.max(1, Math.floor((new Date(b || TODAY) - new Date(a)) / 86400000) + 1);

const fmtDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const ensureDmyDate = (dStr) => {
  if (!dStr) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dStr)) return dStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
    const [y, m, d] = dStr.split('-');
    return `${d}/${m}/${y}`;
  }
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parts = dStr.replace(/,/g, '').split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const monthIndex = months.indexOf(parts[1].slice(0, 3));
    const year = parts[2];
    if (monthIndex !== -1) {
      const month = String(monthIndex + 1).padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
  }
  return dStr;
};

// ── ICON BUTTONS ─────────────────────────────────────────────────────────────

function ActionBtn({ icon: Icon, onClick, danger, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `1px solid ${danger ? 'rgba(217,80,80,0.30)' : 'var(--border-ui)'}`,
        color: danger ? '#d95050' : C.text,
        width: 30, height: 30, borderRadius: 6,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      <Icon size={13} />
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', columnGap: 12, marginBottom: 10, alignItems: 'start' }}>
      <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
        {Icon && <Icon size={12} color={C.muted} />}
        {label}
      </div>
      <div style={{ fontSize: 13, color: C.text }}>{value}</div>
    </div>
  );
}

// ── EMPTY EDIT FORM ───────────────────────────────────────────────────────────

const EMPTY_EDIT = {
  name: '', age: '', sex: 'Male', blood: 'O+', phone: '', email: '',
  address: '', allergies: '', tags: '',
  emergencyName: '', emergencyRelation: '', emergencyPhone: '', insurance: '',
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('overview');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen]               = useState(false);
  const [editForm, setEditForm]               = useState(null);
  const [visitModal, setVisitModal]           = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [labModal, setLabModal]               = useState(false);
  const [vitalsModal, setVitalsModal]         = useState(false);
  const [documentModal, setDocumentModal]     = useState(false);

  useEffect(() => {
    setLoading(true);
    getPatientFull(id).then((data) => {
      setPatient(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !patient) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
      {loading ? 'Loading patient…' : 'Patient not found.'}
    </div>
  );

  const patientAllergies = patient.allergies ?? [];
  const patientTags      = patient.tags ?? [];
  const statusBadge      = STATUS_BADGE[patient.status] ?? STATUS_BADGE.active;
  const ef               = editForm !== null ? editForm : EMPTY_EDIT;
  const isEditOpen       = editOpen;

  const openEdit = () => {
    setEditForm({
      name: patient.name, age: String(patient.age), sex: patient.sex, blood: patient.blood,
      phone: patient.phone, email: patient.email, address: patient.address,
      allergies: patientAllergies.join(', '), tags: patientTags.join(', '),
      emergencyName: patient.emergency?.name || '', emergencyRelation: patient.emergency?.relation || '',
      emergencyPhone: patient.emergency?.phone || '', insurance: patient.insurance || '',
    });
    setEditOpen(true);
  };

  const closeEdit = () => { setEditOpen(false); setEditForm(null); };
  const setField  = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  const saveEdit = async () => {
    if (!editForm || !patient) return;
    const newAllergies = editForm.allergies.split(',').map((s) => s.trim()).filter(Boolean);
    const updates = {
      name: editForm.name || patient.name,
      age: parseInt(editForm.age) || patient.age,
      sex: editForm.sex, blood: editForm.blood,
      phone: editForm.phone, email: editForm.email, address: editForm.address,
      allergies: newAllergies, hasAllergy: newAllergies.length > 0,
      tags: editForm.tags.split(',').map((s) => s.trim()).filter(Boolean),
      emergency: { name: editForm.emergencyName, relation: editForm.emergencyRelation, phone: editForm.emergencyPhone },
      insurance: editForm.insurance,
    };
    await updatePatient(id, updates);
    setPatient((prev) => ({ ...prev, ...updates }));
    closeEdit();
  };

  const removeItem = (key, itemId) => {
    deletePatientSubItem(id, key, itemId);
    setPatient((prev) => ({ ...prev, [key]: (prev[key] || []).filter((i) => i.id !== itemId) }));
  };

  const addItem = (subcol, item) =>
    setPatient((prev) => ({ ...prev, [subcol]: [item, ...(prev[subcol] || [])] }));

  const fmt = (n) => '₹' + n.toLocaleString('en-IN');

  // ── TIMELINE ──────────────────────────────────────────────────────────────
  const timeline = [
    ...patient.visits.map((v) => ({ date: v.date, label: ensureDmyDate(v.date || v.dateLabel), time: v.time || '09:30 AM', type: 'Visit', icon: ClipboardList, color: '#0891b2', bg: 'rgba(8,145,178,0.10)', title: `OPD Visit — ${v.dept}`, detail: `${v.doctor} · ${v.complaint}` })),
    ...patient.prescriptions.map((p) => ({ date: p.date && p.date.includes('/') ? p.date.split('/').reverse().join('-') : '2026-06-20', label: ensureDmyDate(p.date), time: p.time || '11:15 AM', type: 'Prescription', icon: Pill, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', title: `Prescribed — ${p.drug}`, detail: `${p.dosage} · ${p.duration} · ${p.doctor}` })),
    ...patient.labs.map((l) => ({ date: l.date && l.date.includes('/') ? l.date.split('/').reverse().join('-') : '2026-06-20', label: ensureDmyDate(l.date), time: l.time || '02:30 PM', type: 'Lab', icon: FlaskConical, color: '#d9a441', bg: 'rgba(217,164,65,0.10)', title: `Lab — ${l.test}`, detail: `Result: ${l.result} (Normal: ${l.normal}) · ${l.status}` })),
    ...patient.admissions.map((a) => ({ date: a.admittedOn, label: ensureDmyDate(a.admittedOn), time: a.admittedTime || '04:45 PM', type: 'IPD Admission', icon: BedDouble, color: '#C2410C', bg: 'rgba(194,65,12,0.10)', title: `Admitted — ${a.ward} Ward · ${a.ipNo}`, detail: `${a.admittingDoctor} · Status: ${a.status}${a.dischargedOn ? ' · Discharged: ' + ensureDmyDate(a.dischargedOn) : ''}` })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const printPatient = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Patient — ${patient.name}</title>
    <style>body{font-family:sans-serif;padding:32px;color:#0f172a;max-width:960px;margin:0 auto;}
    h1{font-size:22px;margin:0 0 4px;}h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin:24px 0 8px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;}
    table{width:100%;border-collapse:collapse;font-size:13px;}th{text-align:left;padding:7px 10px;background:#f1f5f9;font-size:11px;text-transform:uppercase;color:#64748b;}
    td{padding:8px 10px;border-top:1px solid #e2e8f0;}.muted{color:#64748b;}</style></head><body>
    <h1>${patient.name}</h1>
    <p class="muted">${id} · ${patient.age} yrs, ${patient.sex} · Blood ${patient.blood} · ${patient.phone} · Reg ${patient.registered}</p>
    ${patientAllergies.length ? `<p style="color:#a13030;font-weight:600;">⚠ ALLERGIES: ${patientAllergies.join(', ')}</p>` : ''}
    <h2>Visits</h2><table><tr><th>Date</th><th>Doctor</th><th>Complaint</th><th>Diagnosis</th></tr>
    ${patient.visits.map((v) => `<tr><td>${v.dateLabel}</td><td>${v.doctor}</td><td>${v.complaint}</td><td>${v.diagnosis}</td></tr>`).join('')}</table>
    <h2>Prescriptions</h2><table><tr><th>Drug</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Doctor</th></tr>
    ${patient.prescriptions.map((r) => `<tr><td>${r.drug}</td><td>${r.dosage}</td><td>${r.frequency}</td><td>${r.duration}</td><td>${r.doctor}</td></tr>`).join('')}</table>
    <h2>Lab Results</h2><table><tr><th>Test</th><th>Result</th><th>Normal Range</th><th>Status</th><th>Date</th></tr>
    ${patient.labs.map((l) => `<tr><td>${l.test}</td><td>${l.result}</td><td>${l.normal}</td><td>${l.status}</td><td>${l.date}</td></tr>`).join('')}</table>
    <h2>Vitals</h2><table><tr><th>Date</th><th>BP</th><th>Pulse</th><th>SpO₂</th><th>Temp</th><th>Weight</th></tr>
    ${patient.vitals.map((v) => `<tr><td>${v.date}</td><td>${v.bp}</td><td>${v.pulse} bpm</td><td>${v.spo2}%</td><td>${v.temp}°F</td><td>${v.wt} kg</td></tr>`).join('')}</table>
    <h2>IPD Admissions</h2><table><tr><th>IP No.</th><th>Admitted</th><th>Doctor</th><th>Ward/Bed</th><th>Status</th></tr>
    ${patient.admissions.map((a) => `<tr><td>${a.ipNo}</td><td>${fmtDate(a.admittedOn)}</td><td>${a.admittingDoctor}</td><td>${a.ward} · ${a.bedNo}</td><td>${a.status}</td></tr>`).join('')}</table>
    <script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  };

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/patients')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
        >
          <ArrowLeft size={13} color={C.primary} />
          <span style={{ color: C.primary }}>All patients</span>
          <span style={{ color: C.muted, margin: '0 2px' }}>/</span>
          <span style={{ color: C.text, fontWeight: 500 }}>{patient.name}</span>
        </button>
      </div>

      {/* Header card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 300, color: 'white', flexShrink: 0 }}>
            {patient.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: C.text }}>{patient.name}</h2>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: statusBadge.bg, color: statusBadge.color, fontWeight: 500 }}>{statusBadge.label}</span>
              {patient.hasAllergy && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#d95050', background: 'rgba(217,80,80,0.10)', padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>
                  <AlertTriangle size={11} /> Allergy
                </span>
              )}
              {patientTags.map((t) => (
                <span key={t} style={{ fontSize: 11, padding: '3px 8px', background: C.subtleBg, color: C.muted, borderRadius: 10 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: C.muted }}>
              <span>{id}</span>
              <span>{patient.age} yrs, {patient.sex}</span>
              <span>Blood <strong style={{ color: C.text }}>{patient.blood}</strong></span>
              <span>{patient.phone}</span>
              <span>Reg {patient.registered}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={printPatient} style={{ background: 'transparent', color: C.text, border: `1px solid ${C.border}`, padding: '8px 14px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={openEdit} style={{ background: 'transparent', color: C.text, border: `1px solid ${C.border}`, padding: '8px 14px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Allergy banner */}
      {patientAllergies.length > 0 && (
        <div style={{ background: 'rgba(217,80,80,0.06)', border: '1px solid rgba(217,80,80,0.28)', borderLeft: '4px solid #d95050', borderRadius: 8, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertOctagon size={20} color="#d95050" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#a13030', letterSpacing: '0.04em' }}>ALLERGY ALERT</div>
            <div style={{ fontSize: 13, color: '#7a2424', marginTop: 2 }}>{patientAllergies.join(' · ')}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar" style={{ overflowX: 'auto', marginBottom: 20, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map((t) => {
          const Icon  = t.icon;
          const count = t.countKey ? patient[t.countKey]?.length : null;
          return (
            <button key={t.id} className={`tab-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon size={14} /> {t.label}
              {count != null && <span style={{ opacity: 0.55 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <div key={tab} style={{ animation: 'mv-fade 180ms ease both' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
                <SectionTitle>Demographics</SectionTitle>
                <InfoRow label="Full name"   value={patient.name}                           icon={User} />
                <InfoRow label="Age / Sex"   value={`${patient.age} yrs, ${patient.sex}`}   icon={User} />
                <InfoRow label="Blood group" value={patient.blood}                           icon={Heart} />
                <InfoRow label="Phone"       value={patient.phone}                           icon={Phone} />
                <InfoRow label="Email"       value={patient.email}                           icon={Mail} />
                <InfoRow label="Address"     value={patient.address}                         icon={MapPin} />
                <InfoRow label="Registered"  value={patient.registered}                      icon={Calendar} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
                  <SectionTitle>Emergency contact</SectionTitle>
                  <InfoRow label="Name"     value={patient.emergency.name} />
                  <InfoRow label="Relation" value={patient.emergency.relation} />
                  <InfoRow label="Phone"    value={patient.emergency.phone} icon={Phone} />
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22 }}>
                  <SectionTitle>Insurance &amp; Allergies</SectionTitle>
                  <InfoRow label="Insurance" value={patient.insurance || '—'} icon={Shield} />
                  <InfoRow
                    label="Allergies"
                    value={patientAllergies.length ? patientAllergies.join(', ') : 'No known allergies'}
                  />
                </div>
              </div>
            </div>

            {/* IPD Admissions summary banner */}
            <div
              onClick={() => setTab('admissions')}
              style={{ background: 'linear-gradient(135deg,rgba(8,145,178,0.06),rgba(8,145,178,0.02))', border: '1.5px solid rgba(8,145,178,0.25)', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20, transition: 'all 120ms' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0891b2'; e.currentTarget.style.background = 'rgba(8,145,178,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(8,145,178,0.25)'; e.currentTarget.style.background = 'linear-gradient(135deg,rgba(8,145,178,0.06),rgba(8,145,178,0.02))'; }}
            >
              <div style={{ width: 44, height: 44, background: 'rgba(8,145,178,0.10)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BedDouble size={22} color="#0891b2" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>IPD Admissions</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {patient.admissions.length} admission(s) on record · click to view full IPD history &amp; case files
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {patient.admissions.length > 0 && (
                  <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 10, background: 'rgba(8,145,178,0.10)', color: '#0891b2', fontWeight: 600 }}>
                    {patient.admissions[0].status === 'admitted' ? 'Currently admitted' : 'Last: ' + fmtDate(patient.admissions[0].admittedOn)}
                  </span>
                )}
                <ChevronRight size={16} color={C.muted} />
              </div>
            </div>
          </div>
        )}

        {/* ── VISITS ── */}
        {tab === 'visits' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: C.muted }}>Chronological clinical visit history</div>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setVisitModal(true)}>
                <Plus size={14} /> Add visit
              </button>
            </div>
            {patient.visits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: C.muted, background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
                <ClipboardList size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 14, marginTop: 8 }}>No visits recorded yet.</div>
              </div>
            ) : patient.visits.map((v) => (
              <div key={v.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 12, display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>{v.dateMonth}</div>
                  <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.01em', color: C.text, marginTop: 2 }}>{v.dateBig}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{v.doctor}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{v.dept}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 4 }}>Chief complaint</div>
                  <div style={{ fontSize: 14, color: C.text, marginBottom: 12 }}>{v.complaint}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 4 }}>Diagnosis</div>
                      <div style={{ fontSize: 13, color: C.text }}>{v.diagnosis}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 4 }}>Treatment</div>
                      <div style={{ fontSize: 13, color: C.text }}>{v.treatment}</div>
                    </div>
                  </div>
                  {v.notes && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.muted, fontStyle: 'italic' }}>{v.notes}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <ActionBtn icon={Printer} title="Print" />
                  <ActionBtn icon={Pencil}  title="Edit" />
                  <ActionBtn icon={Trash2}  title="Delete" danger onClick={() => removeItem('visits', v.id)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PRESCRIPTIONS ── */}
        {tab === 'prescriptions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: C.muted }}>All medications prescribed to this patient</div>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setPrescriptionModal(true)}><Plus size={14} /> Add prescription</button>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1fr 0.8fr 1.2fr 76px', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
                <div>Drug</div><div>Dosage</div><div>Frequency</div><div>Duration</div><div>Prescribed by</div><div></div>
              </div>
              {patient.prescriptions.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 14 }}>No prescriptions on record.</div>
              ) : patient.prescriptions.map((rx) => (
                <div key={rx.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1fr 0.8fr 1.2fr 76px', padding: '14px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{rx.drug}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{rx.date}</div>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>{rx.dosage}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{rx.frequency}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{rx.duration}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{rx.doctor}</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <ActionBtn icon={Printer} title="Print" />
                    <ActionBtn icon={Pencil}  title="Edit" />
                    <ActionBtn icon={Trash2}  title="Delete" danger onClick={() => removeItem('prescriptions', rx.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LABS ── */}
        {tab === 'labs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: C.muted }}>Diagnostic lab tests and reports</div>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setLabModal(true)}><Plus size={14} /> Add lab result</button>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 0.8fr 76px', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
                <div>Test</div><div>Result</div><div>Normal Range</div><div>Doctor</div><div>Status</div><div></div>
              </div>
              {patient.labs.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 14 }}>
                  No lab results on record. Lab investigations ordered during IPD admission appear in IPD Admissions → Investigations.
                </div>
              ) : patient.labs.map((lab) => (
                <div key={lab.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 0.8fr 76px', padding: '14px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{lab.test}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{lab.date}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: lab.status === 'High' ? '#d9a441' : C.text }}>{lab.result}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{lab.normal}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{lab.doctor}</div>
                  <div>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: lab.statusBg, color: lab.statusColor, fontWeight: 500 }}>{lab.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <ActionBtn icon={Printer} title="Print" />
                    <ActionBtn icon={Pencil}  title="Edit" />
                    <ActionBtn icon={Trash2}  title="Delete" danger onClick={() => removeItem('labs', lab.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VITALS ── */}
        {tab === 'vitals' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: C.muted }}>Recorded vital signs over time</div>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setVitalsModal(true)}><Plus size={14} /> Record vitals</button>
            </div>
            {/* BP trend chart */}
            {patient.vitals.length > 0 && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>Blood pressure trend</div>
                    <div style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', color: C.text, marginTop: 2 }}>{patient.vitals[0].bp} <span style={{ fontSize: 12, color: C.muted }}>mmHg</span></div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Latest reading · {patient.vitals[0].date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted }}><span style={{ width: 8, height: 8, background: '#0891b2', borderRadius: '50%', display: 'inline-block' }}></span>Systolic</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted }}><span style={{ width: 8, height: 8, background: '#2D6A9F', borderRadius: '50%', display: 'inline-block' }}></span>Diastolic</div>
                  </div>
                </div>
                {(() => {
                  const vs = [...patient.vitals].reverse();
                  const allSys = vs.map((v) => v.bpSys);
                  const allDia = vs.map((v) => v.bpDia);
                  const minV = Math.min(...allSys, ...allDia) - 10;
                  const maxV = Math.max(...allSys, ...allDia) + 10;
                  const range = maxV - minV;
                  const W = 600, H = 160;
                  const pts = (arr) => arr.map((v, i) => {
                    const x = vs.length === 1 ? W / 2 : (i / (vs.length - 1)) * W;
                    const y = H - ((v - minV) / range) * H;
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 160 }}>
                      {[0.25, 0.5, 0.75].map((f) => (
                        <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="rgba(15,23,42,0.06)" strokeDasharray="4 4" />
                      ))}
                      <polyline points={pts(allSys)} fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points={pts(allDia)} fill="none" stroke="#2D6A9F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      {vs.map((v, i) => {
                        const x = vs.length === 1 ? W / 2 : (i / (vs.length - 1)) * W;
                        const sy = H - ((v.bpSys - minV) / range) * H;
                        const dy = H - ((v.bpDia - minV) / range) * H;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={sy} r="4" fill="#0891b2" />
                            <circle cx={x} cy={dy} r="4" fill="#2D6A9F" />
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            )}
            {/* Vitals table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 76px', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
                <div>Date</div><div>BP (mmHg)</div><div>Pulse</div><div>Temp</div><div>Weight</div><div>SpO₂</div><div></div>
              </div>
              {patient.vitals.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No vitals recorded.</div>
              ) : patient.vitals.map((v) => (
                <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 0.7fr 0.7fr 0.7fr 76px', padding: '14px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: C.muted }}>{v.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{v.bp}</div>
                  <div style={{ fontSize: 13, color: C.text }}>{v.pulse} bpm</div>
                  <div style={{ fontSize: 13, color: C.text }}>{v.temp}°F</div>
                  <div style={{ fontSize: 13, color: C.text }}>{v.wt} kg</div>
                  <div style={{ fontSize: 13, color: C.text }}>{v.spo2}%</div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <ActionBtn icon={Printer} title="Print" />
                    <ActionBtn icon={Pencil}  title="Edit" />
                    <ActionBtn icon={Trash2}  title="Delete" danger onClick={() => removeItem('vitals', v.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === 'documents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: C.muted }}>Scanned reports, X-rays, consent forms, etc.</div>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setDocumentModal(true)}><Plus size={14} /> Add document</button>
            </div>
            {patient.documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: C.muted, background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
                <Folder size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 14, marginTop: 8 }}>No documents attached.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {patient.documents.map((doc) => (
                  <div key={doc.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, display: 'flex', gap: 14 }}>
                    <div style={{ width: 44, height: 54, background: C.subtleBg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} color={C.muted} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text, wordBreak: 'break-word' }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{doc.type} · {doc.date}</div>
                      {doc.notes && <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontStyle: 'italic' }}>{doc.notes}</div>}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button style={{ background: 'transparent', border: `1px solid ${C.border}`, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, color: C.text, fontFamily: 'inherit' }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => removeItem('documents', doc.id)} style={{ background: 'transparent', border: '1px solid rgba(217,80,80,0.30)', color: '#d95050', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TIMELINE ── */}
        {tab === 'timeline' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Complete Patient Record History</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>All visits, prescriptions, lab results, vitals and admissions — in one chronological view</div>
            </div>
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 14, marginTop: 8 }}>No records yet for this patient.</div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 119, top: 0, bottom: 0, width: 2, background: 'var(--border-strong, #ccc)', opacity: 0.6 }} />
                {timeline.map((ti, i) => {
                  const Icon = ti.icon;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 0, marginBottom: 4, alignItems: 'flex-start' }}>
                      <div style={{ width: 110, flexShrink: 0, textAlign: 'right', paddingRight: 16, paddingTop: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{ti.label}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{ti.time}</div>
                      </div>
                      <div style={{ width: 20, flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 18, position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid white', background: ti.color, boxShadow: `0 0 0 2px ${ti.color}44` }} />
                      </div>
                      <div style={{ flex: 1, marginLeft: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: ti.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={15} color={ti.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{ti.title}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 8, background: ti.bg, color: ti.color }}>{ti.type}</span>
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{ti.detail}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BILLING ── */}
        {tab === 'billing' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Bills for this patient</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <div style={{ color: C.muted }}>Total billed: <strong style={{ color: C.primary }}>{fmt(patient.billings.reduce((s, b) => s + b.amount, 0))}</strong></div>
                <div style={{ color: C.muted }}>Outstanding: <strong style={{ color: '#991b1b' }}>{fmt(patient.billings.reduce((s, b) => s + (b.amount - b.paid), 0))}</strong></div>
              </div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 80px 100px 100px 90px 100px', padding: '10px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
                <div>Bill No.</div><div>Type</div><div>Total</div><div>Paid</div><div>Status</div><div style={{ textAlign: 'right' }}>Action</div>
              </div>
              {patient.billings.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No bills on record.</div>
              ) : patient.billings.map((b) => {
                const isPaid = b.status === 'paid';
                const isPartial = b.status === 'partial';
                const statusColor = isPaid ? '#15803d' : isPartial ? '#d9a441' : '#d95050';
                const statusBg = isPaid ? 'rgba(78,179,116,0.10)' : isPartial ? 'rgba(217,164,65,0.10)' : 'rgba(217,80,80,0.10)';
                const statusLabel = isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending';
                return (
                  <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '140px 80px 100px 100px 90px 100px', padding: '12px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: C.primary, fontSize: 12 }}>{b.id}</div>
                    <div><span style={{ background: C.subtleBg, color: C.muted, padding: '2px 8px', borderRadius: 8, fontSize: 11 }}>{b.type}</span></div>
                    <div style={{ fontWeight: 600 }}>{fmt(b.amount)}</div>
                    <div style={{ color: '#15803d', fontWeight: 500 }}>{fmt(b.paid)}</div>
                    <div><span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: statusBg, color: statusColor, fontWeight: 500 }}>{statusLabel}</span></div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <ActionBtn icon={Pencil} title="Edit" />
                      <button style={{ background: C.primary, color: 'white', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── IPD ADMISSIONS ── */}
        {tab === 'admissions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>IPD Admission History</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>All in-patient admissions for {patient.name}</div>
              </div>
              <button className="btn-primary" style={{ fontSize: 13 }}><Plus size={14} /> Admit patient</button>
            </div>
            {patient.admissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 64, color: C.muted, background: C.surface, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
                <BedDouble size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 14, marginTop: 8 }}>No IPD admissions recorded for this patient.</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Click "Admit patient" to create the first admission.</div>
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 1fr 110px 80px 130px 110px', padding: '11px 18px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
                  <div>IP No.</div><div>Admitted</div><div>Doctor</div><div>Ward / Bed</div><div>Days</div><div>Discharged</div><div>Status</div>
                </div>
                {patient.admissions.map((a) => {
                  const days  = daysBetween(a.admittedOn, a.dischargedOn);
                  const isAdm = a.status === 'admitted';
                  return (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/admissions/${a.id}`)}
                      style={{ display: 'grid', gridTemplateColumns: '130px 130px 1fr 110px 80px 130px 110px', padding: '13px 18px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: 13, cursor: 'pointer', transition: 'background 120ms' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.subtleBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontWeight: 600, color: C.primary, fontSize: 12 }}>{a.ipNo}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{fmtDate(a.admittedOn)}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{a.admittedTime}</div>
                      </div>
                      <div style={{ fontSize: 12, color: C.text }}>{a.admittingDoctor}</div>
                      <div style={{ fontSize: 12 }}>{a.ward} · {a.bedNo}</div>
                      <div style={{ fontSize: 12 }}>{days}d</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{fmtDate(a.dischargedOn)}</div>
                        {a.dischargedTime && <div style={{ fontSize: 10, color: C.muted }}>{a.dischargedTime}</div>}
                      </div>
                      <div>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 500, background: isAdm ? 'rgba(8,145,178,0.10)' : 'rgba(78,179,116,0.10)', color: isAdm ? '#0891b2' : '#15803d' }}>
                          {isAdm ? 'Admitted' : 'Discharged'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add modals */}
      <AddVisitModal
        open={visitModal}
        patientId={id}
        onAdd={(item) => addItem('visits', item)}
        onClose={() => setVisitModal(false)}
      />
      <AddPrescriptionModal
        open={prescriptionModal}
        patientId={id}
        onAdd={(item) => addItem('prescriptions', item)}
        onClose={() => setPrescriptionModal(false)}
      />
      <AddLabModal
        open={labModal}
        patientId={id}
        onAdd={(item) => addItem('labs', item)}
        onClose={() => setLabModal(false)}
      />
      <RecordVitalsModal
        open={vitalsModal}
        patientId={id}
        onAdd={(item) => addItem('vitals', item)}
        onClose={() => setVitalsModal(false)}
      />
      <AddDocumentModal
        open={documentModal}
        patientId={id}
        onAdd={(item) => addItem('documents', item)}
        onClose={() => setDocumentModal(false)}
      />

      {/* Edit modal */}
      {isEditOpen && createPortal(
        <div className="modal-backdrop" onClick={closeEdit} style={{ alignItems: 'flex-start', paddingTop: 32 }}>
          <div className="modal-panel" style={{ maxWidth: 620, maxHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Edit Patient</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{patient.name}</div>
              </div>
              <button onClick={closeEdit} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color={C.muted} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <label><span style={lbl}>Full Name *</span><input style={inp} value={ef.name} onChange={(e) => setField('name', e.target.value)} /></label>
                <label><span style={lbl}>Age</span><input style={inp} type="number" value={ef.age} onChange={(e) => setField('age', e.target.value)} /></label>
                <label><span style={lbl}>Sex</span>
                  <select style={inp} value={ef.sex} onChange={(e) => setField('sex', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label><span style={lbl}>Phone</span><input style={inp} value={ef.phone} onChange={(e) => setField('phone', e.target.value)} /></label>
                <label><span style={lbl}>Email</span><input style={inp} type="email" value={ef.email} onChange={(e) => setField('email', e.target.value)} /></label>
                <label><span style={lbl}>Blood Group</span>
                  <select style={inp} value={ef.blood} onChange={(e) => setField('blood', e.target.value)}>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </label>
              </div>
              <label><span style={lbl}>Address</span><input style={inp} value={ef.address} onChange={(e) => setField('address', e.target.value)} /></label>
              <label><span style={lbl}>Allergies (comma separated)</span><input style={inp} placeholder="e.g. Penicillin, Latex" value={ef.allergies} onChange={(e) => setField('allergies', e.target.value)} /></label>
              <label><span style={lbl}>Tags (comma separated)</span><input style={inp} placeholder="e.g. Chronic, Diabetes" value={ef.tags} onChange={(e) => setField('tags', e.target.value)} /></label>
              <div>
                <div style={lbl}>Emergency Contact</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <input style={inp} placeholder="Name" value={ef.emergencyName} onChange={(e) => setField('emergencyName', e.target.value)} />
                  <input style={inp} placeholder="Relation" value={ef.emergencyRelation} onChange={(e) => setField('emergencyRelation', e.target.value)} />
                  <input style={inp} placeholder="Phone" value={ef.emergencyPhone} onChange={(e) => setField('emergencyPhone', e.target.value)} />
                </div>
              </div>
              <label><span style={lbl}>Insurance</span><input style={inp} placeholder="Provider · Policy #" value={ef.insurance} onChange={(e) => setField('insurance', e.target.value)} /></label>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: C.subtleBg, flexShrink: 0 }}>
              <button onClick={closeEdit} style={{ background: 'transparent', color: C.text, border: '1px solid var(--border-strong)', padding: '9px 16px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveEdit} className="btn-primary"><Check size={15} /> Save Changes</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
