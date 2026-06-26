import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LayoutGrid, FileSignature, History, Siren,
  ClipboardList, NotebookPen, Pill, Syringe, Notebook,
  HandHelping, FlaskConical, Settings2, UsersRound,
  Activity, AlertTriangle,
} from 'lucide-react';

const ADMISSION = {
  id: 'IPD-2026-042',
  patient: 'Ramesh Patel', initials: 'RP', age: '34M', blood: 'B+',
  admittedOn: '23 Jun 2026', doctor: 'Dr. Priya Mehta',
  ward: 'General', bed: '4A', days: 3,
  reason: 'Abdominal pain, fever', provisionalDx: 'Acute Appendicitis',
  diet: 'Nil by mouth', esiLevel: '2 — Emergent',
  allergies: 'No known drug allergies',
  status: 'Admitted',
  vitals: { bp: '128/84', pulse: '92', spo2: '98%', temp: '101.2°F', wt: '72 kg' },
};

const C = { text: '#0f172a', muted: '#64748b', subtle: '#94a3b8', bg: '#f8fafc', surface: 'white', subtleBg: '#f1f5f9', primary: '#0891b2', border: 'rgba(15,23,42,0.06)' };

const NAV_SECTIONS = [
  {
    label: null,
    items: [{ id: 'overview', label: 'Overview', icon: LayoutGrid }],
  },
  {
    label: 'Intake forms',
    items: [
      { id: 'consent', label: 'General Consent', icon: FileSignature, dot: false },
      { id: 'past-history', label: 'Past Hx & Allergy', icon: History, dot: true },
      { id: 'triage', label: 'Triage (ESI)', icon: Siren, dot: true },
      { id: 'history', label: 'Hx & Exam', icon: ClipboardList, dot: false },
      { id: 'care-plan', label: 'Care Plan', icon: NotebookPen, dot: false },
    ],
  },
  {
    label: 'Daily records',
    items: [
      { id: 'medications', label: 'Medication Recon.', icon: Pill, count: 4 },
      { id: 'treatment', label: 'Treatment Chart', icon: Syringe, count: 6 },
      { id: 'clinical', label: 'Clinical Notes', icon: Notebook, count: 3 },
      { id: 'nursing', label: 'Nursing Notes', icon: HandHelping, count: 8 },
    ],
  },
  {
    label: 'Investigations',
    items: [
      { id: 'investigations', label: 'Investigations', icon: FlaskConical, count: 5 },
      { id: 'procedures', label: 'Procedures & Eq.', icon: Settings2, count: 2 },
      { id: 'visits', label: 'Record of Visits', icon: UsersRound, count: 1 },
    ],
  },
];

const NAV_ITEM = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
  fontSize: 13, fontWeight: 500, transition: 'background 120ms',
  border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontFamily: 'inherit',
};

function VitalCard({ label, value }) {
  return (
    <div style={{ background: C.subtleBg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.muted, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: C.text }}>{value}</div>
    </div>
  );
}

function EmptyTab({ label }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 48, textAlign: 'center', color: C.muted }}>
      <div style={{ fontSize: 32, opacity: 0.25, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 14 }}>No {label} recorded yet.</div>
      <button className="btn-primary" style={{ marginTop: 16, fontSize: 13 }}>+ Add entry</button>
    </div>
  );
}

export default function AdmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const adm = ADMISSION;

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={() => navigate('/admissions')} style={{ background: 'transparent', border: '1px solid rgba(15,23,42,0.12)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>Case file</div>
        </div>
      </div>

      {/* Admission header card */}
      <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(8,145,178,0.10)', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
            {adm.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: C.text }}>{adm.patient}</h2>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: 'rgba(8,145,178,0.10)', color: C.primary, fontWeight: 500 }}>{adm.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: C.muted }}>
              <span>{adm.age} · {adm.blood}</span>
              <span>{adm.id}</span>
              <span>Dr: {adm.doctor}</span>
              <span>Ward: <strong style={{ color: C.text }}>{adm.ward} · {adm.bed}</strong></span>
              <span>Admitted: {adm.admittedOn}</span>
              <span>Day <strong style={{ color: C.text }}>{adm.days}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout: sidebar nav + content */}
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 16, alignItems: 'start' }}>

        {/* Sidebar nav */}
        <nav style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 10, position: 'sticky', top: 0 }}>
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div style={{ padding: '12px 12px 4px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, fontWeight: 700 }}>{section.label}</div>
              )}
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      ...NAV_ITEM,
                      background: isActive ? '#f1f5f9' : 'transparent',
                      color: isActive ? C.text : C.muted,
                      fontWeight: isActive ? 600 : 500,
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon size={15} style={{ flexShrink: 0, color: isActive ? C.primary : C.subtle }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {item.count != null && <span style={{ fontSize: 11, opacity: 0.55 }}>{item.count}</span>}
                    {item.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Content area */}
        <div style={{ animation: 'mv-fade 180ms ease both' }} key={activeTab}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Admission summary */}
              <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 16 }}>Admission summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Reason for admission', value: adm.reason },
                    { label: 'Provisional diagnosis', value: adm.provisionalDx },
                    { label: 'Diet order', value: adm.diet },
                    { label: 'ESI triage level', value: adm.esiLevel },
                    { label: 'Known allergies', value: adm.allergies },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 13, color: C.text }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest vitals */}
              <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Activity size={15} color={C.muted} />
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>Latest vitals (from triage)</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                  <VitalCard label="BP" value={adm.vitals.bp} />
                  <VitalCard label="Pulse" value={adm.vitals.pulse} />
                  <VitalCard label="SpO₂" value={adm.vitals.spo2} />
                  <VitalCard label="Temp" value={adm.vitals.temp} />
                  <VitalCard label="Weight" value={adm.vitals.wt} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'triage' && (
            <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 20 }}>ESI Triage Assessment</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[['Arrival mode', 'Walking'], ['Chief complaint', adm.reason], ['ESI level', adm.esiLevel], ['Time triaged', '09:15 AM']].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 13, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: 12 }}>Vitals at triage</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                <VitalCard label="BP" value={adm.vitals.bp} />
                <VitalCard label="Pulse" value={adm.vitals.pulse} />
                <VitalCard label="SpO₂" value={adm.vitals.spo2} />
                <VitalCard label="Temp" value={adm.vitals.temp} />
                <VitalCard label="Weight" value={adm.vitals.wt} />
              </div>
            </div>
          )}

          {activeTab === 'past-history' && (
            <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>Past History & Allergies</div>
              <div style={{ padding: '12px 16px', background: 'rgba(78,179,116,0.07)', borderLeft: '3px solid #4eb374', borderRadius: '0 8px 8px 0', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d', marginBottom: 4 }}>Allergies</div>
                <div style={{ fontSize: 13, color: C.text }}>{adm.allergies}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[['Diabetes', 'No'], ['Hypertension', 'Yes'], ['Cardiac disease', 'No'], ['Previous surgeries', 'Appendectomy (2018)'], ['Family history', 'Father – Hypertension'], ['Smoking/Alcohol', 'Non-smoker, occasional alcohol']].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 13, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'consent' && (
            <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>General Consent Form</div>
              <div style={{ padding: '16px 20px', background: C.subtleBg, borderRadius: 10, fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
                I, <strong style={{ color: C.text }}>{adm.patient}</strong>, hereby give consent to the medical staff of BAPS Pramukh Swami Hospital to perform necessary examinations, investigations, and treatments as deemed appropriate by the attending physician.
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, color: C.muted }}>
                <div><span style={{ fontWeight: 600, color: C.text }}>Signed by:</span> {adm.patient}</div>
                <div><span style={{ fontWeight: 600, color: C.text }}>Date:</span> {adm.admittedOn}</div>
              </div>
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(78,179,116,0.08)', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#15803d' }}>
                <span>✓</span> Consent obtained and witnessed
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 16 }}>History & Examination</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>Presenting complaints</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>Patient presents with severe abdominal pain in right iliac fossa for 2 days, associated with fever and nausea. No vomiting. Bowel habits normal.</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginBottom: 8 }}>Systemic examination</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['CNS', 'Conscious, oriented'], ['CVS', 'S1, S2 heard, no murmur'], ['Respiratory', 'NVBS, clear'], ['Abdomen', 'Guarding, tenderness at McBurney\'s point']].map(([s, v]) => (
                    <div key={s} style={{ padding: '10px 14px', background: C.subtleBg, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}>{s}</div>
                      <div style={{ fontSize: 13, color: C.text }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {['care-plan', 'medications', 'treatment', 'clinical', 'nursing', 'investigations', 'procedures', 'visits'].includes(activeTab) && (
            <EmptyTab label={NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === activeTab)?.label ?? activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
