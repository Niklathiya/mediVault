import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, ClipboardList, Pill, FlaskConical,
  Activity, Folder, Clock, Receipt, BedDouble, AlertTriangle,
  Phone, Mail, MapPin, Calendar, User, Heart,
} from 'lucide-react';

const PATIENTS = {
  'PT-0128': {
    name: 'Kiran Desai', initials: 'KD', age: 34, sex: 'Male', blood: 'B+',
    phone: '98765 43210', email: 'kiran.desai@email.com', address: '12, Nehru Nagar, Ahmedabad',
    registered: '10 Jun 2026', status: 'active', hasAllergy: false,
    emergency: { name: 'Priya Desai', relation: 'Spouse', phone: '98765 43211' },
    allergies: [],
    tags: ['Diabetes', 'Hypertension'],
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
};

const DEFAULT_PATIENT = {
  name: 'Patient', initials: 'PT', age: 0, sex: '-', blood: '-',
  phone: '-', email: '-', address: '-', registered: '-', status: 'active',
  hasAllergy: false, emergency: { name: '-', relation: '-', phone: '-' },
  allergies: [], tags: [], visits: [], prescriptions: [], labs: [], vitals: [], billings: [], admissions: [],
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'visits', label: 'Visits', icon: ClipboardList, countKey: 'visits' },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill, countKey: 'prescriptions' },
  { id: 'labs', label: 'Lab Results', icon: FlaskConical, countKey: 'labs' },
  { id: 'vitals', label: 'Vitals', icon: Activity, countKey: 'vitals' },
  { id: 'documents', label: 'Documents', icon: Folder },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'billing', label: 'Billing', icon: Receipt, countKey: 'billings' },
  { id: 'admissions', label: 'IPD Admissions', icon: BedDouble, countKey: 'admissions' },
];

const C = {
  text: 'var(--fg-on-light)', muted: 'var(--fg-on-light-muted)', subtle: 'var(--fg-on-light-muted)',
  bg: 'var(--bg-canvas)', surface: 'var(--surface)', subtleBg: 'var(--surface-subtle)',
  primary: '#0891b2', border: 'var(--border-card)',
};

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
      {Icon && <Icon size={14} color={C.subtle} style={{ marginTop: 2, flexShrink: 0 }} />}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.text }}>{value}</div>
      </div>
    </div>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const patient = PATIENTS[id] ?? { ...DEFAULT_PATIENT, name: id };

  const fmt = n => '₹' + n.toLocaleString('en-IN');

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => navigate('/patients')}
          style={{ background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>Patient record</div>
        </div>
      </div>

      {/* Patient header card */}
      <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.subtleBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: C.text, flexShrink: 0 }}>
            {patient.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: C.text }}>{patient.name}</h2>
              {patient.hasAllergy && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#d95050', background: 'rgba(217,80,80,0.1)', padding: '2px 8px', borderRadius: 10 }}><AlertTriangle size={11} /> Allergies</span>}
              {patient.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: C.subtleBg, color: C.muted, borderRadius: 10 }}>{t}</span>)}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: C.muted }}>{patient.age} yrs, {patient.sex}</span>
              <span style={{ fontSize: 13, color: C.muted }}>Blood: <strong style={{ color: C.text }}>{patient.blood}</strong></span>
              <span style={{ fontSize: 13, color: C.muted }}>{id}</span>
              <span style={{ fontSize: 13, color: C.muted }}>Reg: {patient.registered}</span>
            </div>
          </div>
          <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 10, background: 'rgba(78,179,116,0.1)', color: '#15803d', fontWeight: 500 }}>
            {patient.status === 'active' ? 'Active' : 'Archived'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ overflowX: 'auto' }}>
        {TABS.map(t => {
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
      <div style={{ animation: 'mv-fade 180ms ease both' }} key={tab}>
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Demographics */}
            <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 16 }}>Demographics</div>
              <InfoRow label="Full name" value={patient.name} icon={User} />
              <InfoRow label="Age / Sex" value={`${patient.age} yrs, ${patient.sex}`} icon={User} />
              <InfoRow label="Blood group" value={patient.blood} icon={Heart} />
              <InfoRow label="Phone" value={patient.phone} icon={Phone} />
              <InfoRow label="Email" value={patient.email} icon={Mail} />
              <InfoRow label="Address" value={patient.address} icon={MapPin} />
              <InfoRow label="Registered on" value={patient.registered} icon={Calendar} />
            </div>
            {/* Emergency & Allergies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 16 }}>Emergency contact</div>
                <InfoRow label="Name" value={patient.emergency.name} />
                <InfoRow label="Relation" value={patient.emergency.relation} />
                <InfoRow label="Phone" value={patient.emergency.phone} icon={Phone} />
              </div>
              <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 12 }}>Allergies</div>
                {patient.allergies.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>No known allergies recorded.</div>
                ) : patient.allergies.map(a => (
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
            {patient.visits.length === 0
              ? <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>No visits recorded.</div>
              : patient.visits.map((v, i) => (
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
            {patient.prescriptions.map((rx, i) => (
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
            {patient.labs.map((lab, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.7fr', padding: '13px 20px', borderTop: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{lab.test}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{lab.date}</div>
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{lab.result}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{lab.normal}</div>
                <div><span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: lab.statusBg, color: lab.statusColor, fontWeight: 500 }}>{lab.status}</span></div>
              </div>
            ))}
          </div>
        )}

        {tab === 'vitals' && (
          <div style={{ background: 'var(--surface)', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
              <div>Date</div><div>BP</div><div>Pulse</div><div>SpO₂</div><div>Temp</div><div>Weight</div>
            </div>
            {patient.vitals.map((v, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', padding: '13px 20px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.muted }}>{v.date}</div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{v.bp}</div>
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
            {patient.billings.length === 0
              ? <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No bills on record.</div>
              : patient.billings.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.8fr', padding: '13px 20px', borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, color: C.muted }}>{b.id}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{b.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{fmt(b.amount)}</div>
                  <div><span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: 'rgba(78,179,116,0.1)', color: '#15803d', fontWeight: 500 }}>{b.status}</span></div>
                </div>
              ))}
          </div>
        )}

        {['documents', 'timeline', 'admissions'].includes(tab) && (
          <div style={{ textAlign: 'center', padding: 64, color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>
              {tab === 'documents' ? '📁' : tab === 'timeline' ? '⏱' : '🛏'}
            </div>
            <div style={{ fontSize: 14 }}>No {tab} records found for this patient.</div>
          </div>
        )}
      </div>
    </div>
  );
}
