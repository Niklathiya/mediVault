import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAdmission,
  dischargeAdmission,
  updateAdmission,
} from '../firebase/services/admissionService.js';
import {
  ArrowLeft,
  LayoutGrid,
  FileSignature,
  History,
  Siren,
  ClipboardList,
  NotebookPen,
  Pill,
  Syringe,
  Notebook,
  HandHelping,
  FlaskConical,
  Settings2,
  UsersRound,
  FileText,
  User,
  Printer,
  LogOut,
  LogIn,
  AlertOctagon,
  Check,
  X,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

const fmtDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const daysCount = (admittedOn, dischargedOn) =>
  Math.max(1, Math.floor((new Date(dischargedOn || TODAY) - new Date(admittedOn)) / 86400000) + 1);

const C = {
  text: 'var(--fg-on-light)',
  muted: 'var(--fg-on-light-muted)',
  surface: 'var(--surface)',
  subtleBg: 'var(--surface-subtle)',
  border: 'var(--border-card)',
  primary: '#0891b2',
};

const NAV_SECTIONS = [
  { label: null, items: [{ id: 'overview', label: 'Overview', icon: LayoutGrid }] },
  {
    label: 'Intake forms',
    items: [
      { id: 'consent', label: 'General Consent', icon: FileSignature, dotKey: 'consent' },
      { id: 'past-history', label: 'Past Hx & Allergy', icon: History, dotKey: 'pastHistory' },
      { id: 'triage', label: 'Triage (ESI)', icon: Siren, dotKey: 'triageDone' },
      { id: 'history', label: 'Hx & Exam', icon: ClipboardList, dotKey: 'history' },
      { id: 'care-plan', label: 'Care Plan', icon: NotebookPen, dotKey: 'carePlan' },
    ],
  },
  {
    label: 'Daily records',
    items: [
      { id: 'medications', label: 'Medication Recon.', icon: Pill, countKey: 'medications' },
      { id: 'treatment', label: 'Treatment Chart', icon: Syringe, countKey: 'treatment' },
      { id: 'clinical', label: 'Clinical Notes', icon: Notebook, countKey: 'clinical' },
      { id: 'nursing', label: 'Nursing Notes', icon: HandHelping, countKey: 'nursing' },
    ],
  },
  {
    label: 'Investigations',
    items: [
      {
        id: 'investigations',
        label: 'Investigations',
        icon: FlaskConical,
        countKey: 'investigations',
      },
      { id: 'procedures', label: 'Procedures & Eq.', icon: Settings2, countKey: 'procedures' },
      { id: 'visits', label: 'Record of Visits', icon: UsersRound, countKey: 'visits' },
    ],
  },
];

const NAV_ITEM = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 12px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  transition: 'background 120ms',
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'inherit',
  marginBottom: 2,
};

const FORM_PROGRESS = [
  { id: 'consent', label: 'General Consent', icon: FileSignature, dotKey: 'consent' },
  { id: 'past-history', label: 'Past Hx & Allergy', icon: History, dotKey: 'pastHistory' },
  { id: 'triage', label: 'Triage (ESI)', icon: Siren, dotKey: 'triageDone' },
  { id: 'history', label: 'Hx & Exam', icon: ClipboardList, dotKey: 'history' },
  { id: 'care-plan', label: 'Care Plan', icon: NotebookPen, dotKey: 'carePlan' },
  { id: 'medications', label: 'Medications', icon: Pill, countKey: 'medications' },
  { id: 'investigations', label: 'Investigations', icon: FlaskConical, countKey: 'investigations' },
  { id: 'procedures', label: 'Procedures', icon: Settings2, countKey: 'procedures' },
];

function VitalCard({ label, value, unit }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '14px 10px',
        background: C.subtleBg,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: C.muted,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 400, color: C.text }}>{value || '—'}</div>
      {unit && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{unit}</div>}
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: C.muted,
        marginBottom: 14,
      }}
    >
      {title}
    </div>
  );
}

function DischargeSummaryOverlay({ adm, onClose, onPrint }) {
  const cf = adm.casefile || {};
  const totalDays = daysCount(adm.admittedOn, adm.dischargedOn);
  const plan = cf.carePlan?.plan || {};

  const allInvestigations = [
    ...(cf.pathology || []).map((p) => `${p.investigation} — Pathology`),
    ...(cf.radiology || []).map((r) => `${r.investigation} — Radiology`),
    ...(cf.cardiology || []).map((c) => `${c.investigation} — Cardiology`),
  ];

  const allProcedures = [
    ...(cf.dressing || []).map((d) => d.procedure),
    ...(cf.traction || []).map((t) => t.procedure),
  ];

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ alignItems: 'flex-start', paddingTop: 32 }}
    >
      <div
        className="modal-panel"
        style={{
          maxWidth: 700,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 64px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Discharge Summary</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {adm.ipNo} · {adm.patientName} · {adm.ward} Ward
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onPrint} className="btn-primary" style={{ fontSize: 13 }}>
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: `1px solid ${C.border}`,
                width: 34,
                height: 34,
                borderRadius: 8,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={C.muted} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Patient info */}
          <div style={{ background: C.subtleBg, borderRadius: 10, padding: '16px 18px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 120px 1fr',
                gap: '9px 20px',
              }}
            >
              {[
                ['Patient', adm.patientName],
                ['IP No.', adm.ipNo],
                ['MR No.', adm.mrNo],
                ['Age / Sex', `${adm.age} yrs / ${adm.sex}`],
                ['Blood Group', adm.blood],
                ['Ward / Bed', `${adm.ward} · Bed ${adm.bedNo}`],
                ['Admitting Dr.', adm.admittingDoctor],
                ['Admitted', `${fmtDate(adm.admittedOn)} · ${adm.admittedTime}`],
                ['Discharged', adm.dischargedOn ? fmtDate(adm.dischargedOn) : 'Not yet discharged'],
                ['Total stay', `${totalDays} day${totalDays !== 1 ? 's' : ''}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Allergy alert */}
          {adm.hasAllergy && adm.allergies && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(217,80,80,0.06)',
                border: '1px solid rgba(217,80,80,0.28)',
                borderLeft: '4px solid #d95050',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertOctagon size={15} color="#d95050" style={{ flexShrink: 0 }} />
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#a13030',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Allergy Alert
                </div>
                <div style={{ fontSize: 13, color: '#7a2424', marginTop: 1 }}>{adm.allergies}</div>
              </div>
            </div>
          )}

          {/* Diagnosis & complaint */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ borderTop: `3px solid ${C.primary}`, paddingTop: 12 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: C.primary,
                  marginBottom: 6,
                }}
              >
                Diagnosis
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {adm.provisionalDx}
              </div>
            </div>
            <div style={{ borderTop: '3px solid var(--border-card)', paddingTop: 12 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: C.muted,
                  marginBottom: 6,
                }}
              >
                Reason for admission
              </div>
              <div style={{ fontSize: 13, color: C.text }}>{adm.reason}</div>
            </div>
          </div>

          {/* Vitals at triage */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: C.muted,
                marginBottom: 8,
              }}
            >
              Vitals at admission (triage)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {[
                ['BP', adm.triage.bp, 'mmHg'],
                ['Pulse', adm.triage.pulse, '/min'],
                ['SpO₂', adm.triage.spo2, '%'],
                ['Temp', adm.triage.temp, '°F'],
                ['RR', adm.triage.rr, '/min'],
                ['RBS', adm.triage.rbs, 'mg/dL'],
              ].map(([l, v, u]) => (
                <div
                  key={l}
                  style={{
                    padding: '10px 8px',
                    background: C.subtleBg,
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{v}</div>
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{u}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Investigations */}
          {allInvestigations.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: C.muted,
                  marginBottom: 8,
                }}
              >
                Investigations performed
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {allInvestigations.map((inv, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 13,
                      color: C.text,
                    }}
                  >
                    <Check size={11} color="#16a34a" style={{ flexShrink: 0 }} /> {inv}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medications */}
          {(cf.medications || []).length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: C.muted,
                  marginBottom: 10,
                }}
              >
                Medications at discharge
              </div>
              <div
                style={{
                  background: C.subtleBg,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '34px 2fr 80px 72px 130px',
                    padding: '8px 14px',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: C.muted,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div>#</div>
                  <div>Drug</div>
                  <div>Dose</div>
                  <div>Route</div>
                  <div>Frequency</div>
                </div>
                {(cf.medications || []).map((m) => (
                  <div
                    key={m.sr}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '34px 2fr 80px 72px 130px',
                      padding: '9px 14px',
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 13,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ color: C.muted, fontSize: 11 }}>{m.sr}</div>
                    <div style={{ fontWeight: 500, color: C.text }}>{m.drug}</div>
                    <div style={{ color: C.muted }}>{m.dose}</div>
                    <div style={{ color: C.muted }}>{m.route}</div>
                    <div style={{ color: C.muted }}>{m.frequency}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Procedures */}
          {allProcedures.filter(Boolean).length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: C.muted,
                  marginBottom: 8,
                }}
              >
                Procedures performed
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {allProcedures.filter(Boolean).map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: C.text,
                    }}
                  >
                    <Check size={11} color={C.primary} style={{ flexShrink: 0 }} /> {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discharge instructions */}
          <div
            style={{
              background: 'rgba(8,145,178,0.04)',
              border: '1px solid rgba(8,145,178,0.18)',
              borderRadius: 10,
              padding: '14px 18px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: C.primary,
                marginBottom: 10,
              }}
            >
              Discharge instructions & follow-up
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                [
                  'Follow-up',
                  plan.dischargeNeeds || 'Report to OPD after 7 days or earlier if symptoms worsen',
                ],
                plan.diet && ['Diet', plan.diet],
                plan.physiotherapy && ['Physiotherapy', plan.physiotherapy],
                ['Signed by', adm.admittingDoctor],
              ]
                .filter(Boolean)
                .map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.muted,
                        minWidth: 110,
                        paddingTop: 1,
                        flexShrink: 0,
                      }}
                    >
                      {l}
                    </div>
                    <div style={{ color: C.text }}>{v}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AdmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDS, setShowDS] = useState(false);
  const [entryModal, setEntryModal] = useState(null);
  const [invSubTab, setInvSubTab] = useState('pathology');
  const [procSubTab, setProcSubTab] = useState('equipment');
  const [treatView, setTreatView] = useState('list');
  const [adm, setAdm] = useState(null);
  const [loading, setLoading] = useState(true);

  // Adjust state during render when id changes to avoid synchronous setState inside useEffect
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setLoading(true);
    setAdm(null);
  }

  useEffect(() => {
    getAdmission(id).then((data) => {
      setAdm(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !adm)
    return (
      <div
        style={{
          padding: 60,
          textAlign: 'center',
          color: 'var(--fg-on-light-muted)',
          fontSize: 14,
        }}
      >
        {loading ? 'Loading admission…' : 'Admission not found.'}
      </div>
    );

  const days = daysCount(adm.admittedOn, adm.dischargedOn);
  const cf = adm.casefile || {};

  const iconBtnSm = {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    width: 26,
    height: 26,
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: C.muted,
    flexShrink: 0,
    padding: 0,
  };
  const tblHeader = {
    display: 'grid',
    padding: '10px 18px',
    background: C.subtleBg,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: C.muted,
    borderBottom: `1px solid ${C.border}`,
  };
  const tblRow = {
    display: 'grid',
    padding: '12px 18px',
    borderBottom: `1px solid ${C.border}`,
    alignItems: 'center',
    fontSize: 13,
  };

  const isAdmitted = adm.status === 'admitted';
  const statusBadge = isAdmitted
    ? { color: '#0891b2', bg: 'rgba(8,145,178,0.10)', label: 'Admitted' }
    : { color: '#15803d', bg: 'rgba(78,179,116,0.10)', label: 'Discharged' };

  const handleSaveEntry = async (updates) => {
    const updatedAdm = { ...adm };

    if (updates.casefile) {
      updatedAdm.casefile = {
        ...cf,
        ...updates.casefile,
      };

      // Update count metrics
      if (updates.casefile.medications) {
        updatedAdm.medications = updates.casefile.medications.length;
      }
      if (updates.casefile.clinicalNotes) {
        updatedAdm.clinical = updates.casefile.clinicalNotes.length;
      }
      if (updates.casefile.nursingNotes) {
        updatedAdm.nursing = updates.casefile.nursingNotes.length;
      }
      if (updates.casefile.pathology || updates.casefile.radiology || updates.casefile.cardiology) {
        const pathLen = (updates.casefile.pathology || cf.pathology || []).length;
        const radLen = (updates.casefile.radiology || cf.radiology || []).length;
        const cardLen = (updates.casefile.cardiology || cf.cardiology || []).length;
        updatedAdm.investigations = pathLen + radLen + cardLen;
      }
      if (updates.casefile.equipment || updates.casefile.dressing || updates.casefile.traction) {
        const eqLen = (updates.casefile.equipment || cf.equipment || []).length;
        const dressLen = (updates.casefile.dressing || cf.dressing || []).length;
        const tracLen = (updates.casefile.traction || cf.traction || []).length;
        updatedAdm.procedures = eqLen + dressLen + tracLen;
      }
      if (updates.casefile.rounds) {
        updatedAdm.visits = updates.casefile.rounds.length;
      }
    }

    Object.keys(updates).forEach((k) => {
      if (k !== 'casefile') {
        updatedAdm[k] = updates[k];
      }
    });

    await updateAdmission(id, updatedAdm);
    setAdm(updatedAdm);
    setEntryModal(null);
  };

  const printAdmission = () => {
    const w = window.open('', '_blank');
    w.document
      .write(`<html><head><title>${adm.ipNo} Case File</title></head><body style="font-family:sans-serif;padding:24px;">
      <h2 style="margin:0">${adm.patientName}</h2>
      <p style="color:#666">${adm.ipNo} · ${adm.ward} · Bed ${adm.bedNo} · Admitted ${fmtDate(adm.admittedOn)}</p>
      <p><b>Doctor:</b> ${adm.admittingDoctor} | <b>Diagnosis:</b> ${adm.provisionalDx}</p>
      <p><b>Reason:</b> ${adm.reason} | <b>Status:</b> ${adm.status}</p>
      <hr/>
      <p><b>Vitals at triage:</b> BP ${adm.triage.bp} mmHg · Pulse ${adm.triage.pulse}/min · SpO₂ ${adm.triage.spo2}% · Temp ${adm.triage.temp}°F</p>
      </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '9px 14px',
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <button
          onClick={() => navigate('/admissions')}
          style={{
            background: 'transparent',
            border: 'none',
            color: C.primary,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 500,
            padding: 0,
          }}
        >
          <ArrowLeft size={13} /> All admissions
        </button>
        <span style={{ color: C.muted }}>/</span>
        <span style={{ color: C.text, fontWeight: 500 }}>
          {adm.ipNo} · {adm.patientName}
        </span>
      </div>

      {/* Admission header card */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 22,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'rgba(8,145,178,0.12)',
              color: C.primary,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {adm.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                marginBottom: 8,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: C.text,
                }}
              >
                {adm.patientName}
              </h2>
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 10,
                  background: statusBadge.bg,
                  color: statusBadge.color,
                  fontWeight: 600,
                }}
              >
                {statusBadge.label}
              </span>
              {adm.hasAllergy && (
                <span
                  style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    background: 'rgba(217,80,80,0.10)',
                    color: '#a13030',
                    borderRadius: 10,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <AlertOctagon size={11} /> Allergy
                </span>
              )}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, auto)',
                gap: '10px 24px',
                fontSize: 12,
              }}
            >
              {[
                { label: 'IP No.', value: adm.ipNo, color: C.primary },
                { label: 'MR No.', value: adm.mrNo },
                { label: 'Ward / Bed', value: `${adm.ward} · ${adm.bedNo}` },
                { label: 'Admitting Dr.', value: adm.admittingDoctor },
                { label: 'Admitted', value: `${fmtDate(adm.admittedOn)} · ${adm.admittedTime}` },
                {
                  label: 'Age / Sex / Blood',
                  value: `${adm.age} yrs / ${adm.sex === 'Male' ? 'M' : 'F'} / ${adm.blood}`,
                },
              ].map((f) => (
                <div key={f.label}>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 2,
                    }}
                  >
                    {f.label}
                  </div>
                  <div style={{ fontWeight: 500, color: f.color || C.text }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => setShowDS(true)}
            style={{
              background: C.primary,
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <FileText size={13} /> Discharge Summary
          </button>
          <button
            onClick={() => navigate(`/patients/${adm.mrNo}`)}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              padding: '8px 12px',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 500,
              color: C.text,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <User size={13} /> Patient profile
          </button>
          <button
            onClick={printAdmission}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              padding: '8px 12px',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 500,
              color: C.text,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Printer size={13} /> Print
          </button>
          <button
            onClick={() => {
              const now = new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              if (isAdmitted) {
                dischargeAdmission(id, TODAY, now).then(() =>
                  setAdm((prev) => ({
                    ...prev,
                    status: 'discharged',
                    dischargedOn: TODAY,
                    dischargedTime: now,
                  })),
                );
              } else {
                updateAdmission(id, {
                  status: 'admitted',
                  dischargedOn: null,
                  dischargedTime: null,
                }).then(() =>
                  setAdm((prev) => ({
                    ...prev,
                    status: 'admitted',
                    dischargedOn: null,
                    dischargedTime: null,
                  })),
                );
              }
            }}
            style={{
              background: isAdmitted ? '#d95050' : '#15803d',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {isAdmitted ? (
              <>
                <LogOut size={13} /> Mark Discharged
              </>
            ) : (
              <>
                <LogIn size={13} /> Re-admit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Allergy banner */}
      {adm.hasAllergy && adm.allergies && (
        <div
          style={{
            background: 'rgba(217,80,80,0.06)',
            border: '1px solid rgba(217,80,80,0.28)',
            borderLeft: '4px solid #d95050',
            borderRadius: 8,
            padding: '12px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <AlertOctagon size={18} color="#d95050" style={{ flexShrink: 0 }} />
          <div>
            <div
              style={{ fontSize: 12, fontWeight: 700, color: '#a13030', letterSpacing: '0.04em' }}
            >
              ALLERGY ALERT
            </div>
            <div style={{ fontSize: 12, color: '#7a2424', marginTop: 1 }}>{adm.allergies}</div>
          </div>
        </div>
      )}

      {/* Two-column: left rail + right pane */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 16, alignItems: 'start' }}
      >
        {/* Left rail */}
        <nav
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 10,
            position: 'sticky',
            top: 0,
          }}
        >
          <div
            style={{
              padding: '8px 12px 6px',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: C.muted,
              fontWeight: 700,
            }}
          >
            Case file
          </div>
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div
                  style={{
                    padding: '12px 12px 4px',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: C.muted,
                    fontWeight: 700,
                  }}
                >
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const filled = item.dotKey ? !!adm[item.dotKey] : false;
                const count = item.countKey ? adm[item.countKey] : null;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      ...NAV_ITEM,
                      background: isActive ? C.subtleBg : 'transparent',
                      color: isActive ? C.text : C.muted,
                      fontWeight: isActive ? 600 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = C.subtleBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon
                      size={14}
                      style={{ flexShrink: 0, color: isActive ? C.primary : C.muted }}
                    />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {count != null && <span style={{ fontSize: 11, opacity: 0.55 }}>{count}</span>}
                    {item.dotKey && (
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: filled ? '#16a34a' : 'rgba(15,23,42,0.15)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Right pane */}
        <div key={activeTab} style={{ animation: 'mv-fade 150ms ease both' }}>
          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Admission summary */}
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <SectionHeader title="Admission summary" />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      rowGap: 9,
                      fontSize: 13,
                    }}
                  >
                    {[
                      ['Reason', adm.reason],
                      ['Provisional Dx', adm.provisionalDx],
                      ['Diet', adm.diet],
                      ['ESI Level', `Level ${adm.esiLevel} · ${adm.esiColor}`],
                      ['Allergies', adm.allergies || 'No known allergies'],
                      ['Days admitted', `${days} day${days !== 1 ? 's' : ''}`],
                    ].map(([k, v]) => (
                      <React.Fragment key={k}>
                        <div style={{ color: C.muted, fontSize: 12 }}>{k}</div>
                        <div
                          style={{ color: k === 'Allergies' && adm.allergies ? '#a13030' : C.text }}
                        >
                          {v}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Latest vitals */}
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <SectionHeader title="Latest vitals (triage)" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    <VitalCard label="BP" value={adm.triage.bp} unit="mmHg" />
                    <VitalCard label="Pulse" value={adm.triage.pulse} unit="/min" />
                    <VitalCard label="SpO₂" value={adm.triage.spo2} unit="%" />
                    <VitalCard label="Temp" value={adm.triage.temp} unit="°F" />
                    <VitalCard label="RR" value={adm.triage.rr} unit="/min" />
                    <VitalCard label="RBS" value={adm.triage.rbs} unit="mg/dL" />
                  </div>
                </div>
              </div>

              {/* Case file progress */}
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <SectionHeader title="Case file progress" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {FORM_PROGRESS.map((fp) => {
                    const Icon = fp.icon;
                    const isDone = fp.dotKey
                      ? !!adm[fp.dotKey]
                      : fp.countKey
                        ? (adm[fp.countKey] || 0) > 0
                        : false;
                    const count = fp.countKey ? adm[fp.countKey] : null;
                    return (
                      <div
                        key={fp.id}
                        onClick={() => setActiveTab(fp.id)}
                        style={{
                          border: `1px solid ${isDone ? 'rgba(22,163,74,0.30)' : C.border}`,
                          borderRadius: 10,
                          padding: '14px 12px',
                          cursor: 'pointer',
                          transition: 'all 120ms',
                          background: isDone ? 'rgba(22,163,74,0.04)' : 'transparent',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.primary)}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = isDone
                            ? 'rgba(22,163,74,0.30)'
                            : C.border)
                        }
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
                        >
                          <Icon size={15} color={isDone ? '#16a34a' : C.muted} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>
                            {fp.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: isDone ? '#16a34a' : C.muted }}>
                          {isDone
                            ? count != null
                              ? `${count} entries`
                              : '✓ Completed'
                            : 'Not filled'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── CONSENT ─── */}
          {activeTab === 'consent' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                    General Consent Form
                  </h2>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    Admission consent · signed on admission
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {adm.consent ? (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '4px 10px',
                        background: 'rgba(22,163,74,0.10)',
                        color: '#15803d',
                        borderRadius: 10,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Check size={11} /> Obtained
                    </span>
                  ) : (
                    <button
                      onClick={() => setEntryModal('consent')}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      <Plus size={13} /> Sign Consent
                    </button>
                  )}
                  {adm.consent && (
                    <button
                      onClick={() => setEntryModal('consent')}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        padding: '5px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                      className="w-8 h-8"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div
                style={{
                  padding: '14px 18px',
                  background: C.subtleBg,
                  borderRadius: 10,
                  fontSize: 13,
                  color: C.muted,
                  lineHeight: 1.7,
                  marginBottom: 18,
                }}
              >
                I, <strong style={{ color: C.text }}>{adm.patientName}</strong>, hereby give consent
                to the medical staff to perform necessary examinations, investigations, and
                treatments as deemed appropriate by the attending physician.
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 180px 1fr',
                  gap: '10px 20px',
                  fontSize: 13,
                }}
              >
                {[
                  ['Consent given by', adm.patientName],
                  ['Ward selected', adm.ward],
                  ['Signed on', fmtDate(adm.admittedOn)],
                  ['Witnessend by', adm.admittingDoctor],
                ].map(([k, v]) => (
                  <React.Fragment key={k}>
                    <div style={{ color: C.muted, fontSize: 12 }}>{k}</div>
                    <div>{v}</div>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    color: C.muted,
                    marginBottom: 10,
                  }}
                >
                  Acknowledgements
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Voluntary consent for treatment / minor procedures',
                    'Will pay all bills & vacate room on discharge',
                    'Consent for photography / video (medical/educational)',
                    'Permission to access medical records',
                    'Abide by hospital rules & regulations',
                  ].map((ack) => (
                    <div
                      key={ack}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: C.text,
                      }}
                    >
                      <Check size={13} color="#16a34a" style={{ flexShrink: 0 }} /> {ack}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── PAST HISTORY ─── */}
          {activeTab === 'past-history' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Past History & Drug Allergy Declaration
                </h2>
                <button
                  onClick={() => setEntryModal('past-history')}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  <Pencil size={13} /> Edit History
                </button>
              </div>
              {adm.allergies ? (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '12px 14px',
                    background: 'rgba(217,80,80,0.06)',
                    borderLeft: '3px solid #d95050',
                    borderRadius: '0 8px 8px 0',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: '#a13030',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Allergies
                  </div>
                  <div style={{ fontSize: 13, color: '#7a2424', marginTop: 2 }}>
                    {adm.allergies}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '10px 14px',
                    background: 'rgba(78,179,116,0.08)',
                    borderLeft: '3px solid #4eb374',
                    borderRadius: '0 8px 8px 0',
                    fontSize: 13,
                    color: '#15803d',
                  }}
                >
                  No known drug or food allergies
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Diabetes', cf.pastHistoryDetails?.diabetes ?? 'Type II — under medication'],
                  ['Hypertension', cf.pastHistoryDetails?.hypertension ?? 'Yes, since 5 years'],
                  ['Cardiac disease', cf.pastHistoryDetails?.cardiac ?? 'No'],
                  [
                    'Previous surgeries',
                    cf.pastHistoryDetails?.surgeries ??
                      (adm.id === 'IPD-2026-042' ? 'Appendectomy (2018)' : 'None'),
                  ],
                  ['Family history', cf.pastHistoryDetails?.family ?? 'Father — Hypertension'],
                  [
                    'Smoking / Alcohol',
                    cf.pastHistoryDetails?.smokingAlcohol ?? 'Non-smoker, occasional alcohol',
                  ],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    style={{ padding: '10px 14px', background: C.subtleBg, borderRadius: 8 }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: C.muted,
                        marginBottom: 3,
                      }}
                    >
                      {l}
                    </div>
                    <div style={{ fontSize: 13, color: C.text }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TRIAGE ─── */}
          {activeTab === 'triage' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Emergency Severity Index (ESI) — Triage
                </h2>
                <button
                  onClick={() => setEntryModal('triage')}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  <Pencil size={13} /> Edit Triage
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20 }}>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Vital signs at triage
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 10,
                      padding: '14px',
                      background: C.subtleBg,
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      ['BP (mmHg)', adm.triage.bp],
                      ['Pulse', adm.triage.pulse],
                      ['RR', adm.triage.rr],
                      ['SpO₂ (%)', adm.triage.spo2],
                      ['RBS (mg/dL)', adm.triage.rbs],
                      ['Temp (°F)', adm.triage.temp],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase' }}>
                          {l}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginTop: 2 }}>
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 14,
                      fontSize: 13,
                    }}
                  >
                    {[
                      ['Chief complaint', adm.reason],
                      ['Time triaged', adm.admittedTime],
                      ['Mode of arrival', 'Walking'],
                      ['Triage by', 'Nurse on duty'],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: C.muted,
                            marginBottom: 3,
                          }}
                        >
                          {l}
                        </div>
                        <div style={{ color: C.text }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    background:
                      adm.esiLevel === '1'
                        ? '#b91c1c'
                        : adm.esiLevel === '2'
                          ? '#d97706'
                          : '#0891b2',
                    color: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.85,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    ESI Level
                  </div>
                  <div style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, margin: '4px 0' }}>
                    {adm.esiLevel}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {adm.esiColor}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── HISTORY ─── */}
          {activeTab === 'history' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Patient History & Clinical Examination
                </h2>
                <button
                  onClick={() => setEntryModal('history')}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  <Pencil size={13} /> Edit Exam
                </button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: C.muted,
                    marginBottom: 6,
                  }}
                >
                  Presenting complaints
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: C.text,
                    lineHeight: 1.7,
                    padding: '10px 14px',
                    background: C.subtleBg,
                    borderRadius: 8,
                  }}
                >
                  Patient presents with: {adm.reason}.{' '}
                  {cf.presentingComplaintsExtra ??
                    'Associated with fever and nausea for the past 2 days.'}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: C.muted,
                    marginBottom: 8,
                  }}
                >
                  Systemic examination
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    ['CNS', cf.systemicExam?.cns ?? 'Conscious, oriented'],
                    ['CVS', cf.systemicExam?.cvs ?? 'S1, S2 heard, no murmur'],
                    ['Respiratory', cf.systemicExam?.respiratory ?? 'NVBS, clear'],
                    ['Abdomen', cf.systemicExam?.abdomen ?? 'Tenderness noted, guarding present'],
                  ].map(([s, v]) => (
                    <div
                      key={s}
                      style={{ padding: '10px 14px', background: C.subtleBg, borderRadius: 8 }}
                    >
                      <div
                        style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}
                      >
                        {s}
                      </div>
                      <div style={{ fontSize: 13, color: C.text }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── CARE PLAN ─── */}
          {activeTab === 'care-plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                    Care Plan
                  </h2>
                  <button
                    onClick={() => setEntryModal('care-plan')}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    <Pencil size={13} /> Edit Care Plan
                  </button>
                </div>
                <SectionHeader title="Systemic Examination" />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {[
                    ['RS', cf.carePlan?.systemicExam?.rs],
                    ['CVS', cf.carePlan?.systemicExam?.cvs],
                    ['P/A', cf.carePlan?.systemicExam?.pa],
                    ['CNS', cf.carePlan?.systemicExam?.cns],
                    ['GCS', cf.carePlan?.systemicExam?.gcs],
                    ['Pupils', cf.carePlan?.systemicExam?.pupils],
                    ['Reflexes', cf.carePlan?.systemicExam?.reflexes],
                    ['LOC', cf.carePlan?.systemicExam?.loc],
                  ].map(([l, v]) => (
                    <div
                      key={l}
                      style={{ padding: '10px 12px', background: C.subtleBg, borderRadius: 8 }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: C.muted,
                          marginBottom: 3,
                        }}
                      >
                        {l}
                      </div>
                      <div style={{ fontSize: 13, color: C.text }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(8,145,178,0.06)',
                    border: '1px solid rgba(8,145,178,0.2)',
                    borderLeft: '4px solid #0891b2',
                    borderRadius: 8,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: C.primary,
                      marginBottom: 4,
                    }}
                  >
                    Provisional Diagnosis
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.text }}>
                    {adm.provisionalDx}
                  </div>
                </div>
                <SectionHeader title="Management Plan" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    ['Conservative management', cf.carePlan?.plan?.conservative],
                    ['Operative management', cf.carePlan?.plan?.operative],
                    ['Surgery', cf.carePlan?.plan?.surgery],
                    ['Other', cf.carePlan?.plan?.other],
                    ['Investigation – Radiology', cf.carePlan?.plan?.investigationRadiology],
                    ['Investigation – Pathology', cf.carePlan?.plan?.investigationPathology],
                    ['Reference Doctor', cf.carePlan?.plan?.referenceDoctor],
                    ['Diet', cf.carePlan?.plan?.diet],
                    ['Physiotherapy', cf.carePlan?.plan?.physiotherapy],
                    ['Discharge needs', cf.carePlan?.plan?.dischargeNeeds],
                  ]
                    .filter(([, v]) => v)
                    .map(([l, v]) => (
                      <div
                        key={l}
                        style={{ padding: '10px 14px', background: C.subtleBg, borderRadius: 8 }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: C.muted,
                            marginBottom: 3,
                          }}
                        >
                          {l}
                        </div>
                        <div style={{ fontSize: 13, color: C.text }}>{v}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── MEDICATIONS ─── */}
          {activeTab === 'medications' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Medication Reconciliation
                </h2>
                <button
                  onClick={() => setEntryModal('medications')}
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                >
                  <Plus size={13} /> Add medication
                </button>
              </div>
              <div
                style={{
                  ...tblHeader,
                  gridTemplateColumns: '46px 2.2fr 90px 90px 130px 70px 72px',
                }}
              >
                <div>Sr</div>
                <div>Drug Name</div>
                <div>Dose</div>
                <div>Route</div>
                <div>Frequency</div>
                <div>Qty</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>
              {(cf.medications || []).length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  No medications recorded.
                </div>
              ) : (
                (cf.medications || []).map((m) => (
                  <div
                    key={m.sr}
                    style={{
                      ...tblRow,
                      gridTemplateColumns: '46px 2.2fr 90px 90px 130px 70px 72px',
                    }}
                  >
                    <div style={{ color: C.muted, fontSize: 12 }}>{m.sr}</div>
                    <div style={{ fontWeight: 500, color: C.text }}>{m.drug}</div>
                    <div style={{ color: C.text }}>{m.dose}</div>
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: C.subtleBg,
                          color: C.muted,
                          fontWeight: 500,
                        }}
                      >
                        {m.route}
                      </span>
                    </div>
                    <div style={{ color: C.text }}>{m.frequency}</div>
                    <div style={{ color: C.muted }}>{m.qty}</div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button style={iconBtnSm}>
                        <Pencil size={11} />
                      </button>
                      <button
                        style={{
                          ...iconBtnSm,
                          border: '1px solid rgba(217,80,80,0.3)',
                          color: '#d95050',
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── TREATMENT CHART ─── */}
          {activeTab === 'treatment' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Treatment Chart
                </h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['list', 'grid'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTreatView(v)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 20,
                        border: `1px solid ${treatView === v ? C.primary : C.border}`,
                        background: treatView === v ? 'rgba(8,145,178,0.08)' : 'transparent',
                        color: treatView === v ? C.primary : C.muted,
                        fontSize: 12,
                        fontWeight: treatView === v ? 600 : 400,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textTransform: 'capitalize',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {treatView === 'list' ? (
                <>
                  <div style={{ ...tblHeader, gridTemplateColumns: '2.2fr 90px 90px 130px' }}>
                    <div>Drug</div>
                    <div>Dose</div>
                    <div>Route</div>
                    <div>Frequency</div>
                  </div>
                  {(cf.treatmentList || []).length === 0 ? (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: C.muted,
                        fontSize: 13,
                      }}
                    >
                      No treatment recorded.
                    </div>
                  ) : (
                    (cf.treatmentList || []).map((t, i) => (
                      <div
                        key={i}
                        style={{ ...tblRow, gridTemplateColumns: '2.2fr 90px 90px 130px' }}
                      >
                        <div style={{ fontWeight: 500, color: C.text }}>{t.drug}</div>
                        <div>{t.dose}</div>
                        <div>
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 10,
                              background: C.subtleBg,
                              color: C.muted,
                            }}
                          >
                            {t.route}
                          </span>
                        </div>
                        <div>{t.freq}</div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 'max-content', padding: '0 0 8px' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `220px 80px 80px ${(cf.treatmentDates || []).map(() => '86px').join(' ')}`,
                        padding: '10px 18px',
                        background: C.subtleBg,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: C.muted,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <div>Drug</div>
                      <div>Route</div>
                      <div>Freq</div>
                      {(cf.treatmentDates || []).map((d) => {
                        const [, m, day] = d.split('-');
                        const mo = [
                          'Jan',
                          'Feb',
                          'Mar',
                          'Apr',
                          'May',
                          'Jun',
                          'Jul',
                          'Aug',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Dec',
                        ][+m - 1];
                        return (
                          <div key={d} style={{ textAlign: 'center' }}>
                            {+day} {mo}
                          </div>
                        );
                      })}
                    </div>
                    {(cf.treatmentList || []).map((t, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `220px 80px 80px ${(cf.treatmentDates || []).map(() => '86px').join(' ')}`,
                          padding: '10px 18px',
                          borderBottom: `1px solid ${C.border}`,
                          alignItems: 'center',
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontWeight: 500, color: C.text, fontSize: 12 }}>{t.drug}</div>
                        <div style={{ fontSize: 11 }}>
                          <span
                            style={{
                              padding: '2px 7px',
                              background: C.subtleBg,
                              borderRadius: 8,
                              color: C.muted,
                            }}
                          >
                            {t.route}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t.freq}</div>
                        {(cf.treatmentDates || []).map((d) => {
                          const st = t.cells?.[d];
                          const isOn = st === 'ON';
                          return (
                            <div key={d} style={{ display: 'flex', justifyContent: 'center' }}>
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: isOn
                                    ? 'rgba(8,145,178,0.12)'
                                    : st === 'OFF'
                                      ? 'rgba(217,80,80,0.08)'
                                      : 'transparent',
                                  color: isOn ? C.primary : st === 'OFF' ? '#d95050' : C.muted,
                                }}
                              >
                                {st || '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── CLINICAL NOTES ─── */}
          {activeTab === 'clinical' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Clinical Notes
                </h2>
                <button
                  onClick={() => setEntryModal('clinical')}
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                >
                  <Plus size={13} /> Add note
                </button>
              </div>
              {(cf.clinicalNotes || []).length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  No clinical notes recorded.
                </div>
              ) : (
                (cf.clinicalNotes || []).map((n) => {
                  const [y, m, d] = n.date.split('-');
                  const mo = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ][+m - 1];
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '130px 1fr 80px',
                        padding: '16px 20px',
                        borderBottom: `1px solid ${C.border}`,
                        gap: 16,
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div
                          style={{ fontSize: 22, fontWeight: 300, color: C.text, lineHeight: 1 }}
                        >
                          {d}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
                          {mo} {y}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{n.time}</div>
                        <div
                          style={{ fontSize: 11, color: C.primary, marginTop: 6, fontWeight: 500 }}
                        >
                          {n.doctor}
                        </div>
                      </div>
                      <div
                        style={{
                          borderLeft: `3px solid ${C.primary}`,
                          paddingLeft: 14,
                          lineHeight: 1.7,
                          fontSize: 13,
                          color: C.text,
                        }}
                      >
                        {n.note}
                      </div>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button style={iconBtnSm} title="Print">
                          <Printer size={11} />
                        </button>
                        <button style={iconBtnSm} title="Edit">
                          <Pencil size={11} />
                        </button>
                        <button
                          style={{
                            ...iconBtnSm,
                            border: '1px solid rgba(217,80,80,0.3)',
                            color: '#d95050',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ─── NURSING NOTES ─── */}
          {activeTab === 'nursing' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Nursing Notes
                </h2>
                <button
                  onClick={() => setEntryModal('nursing')}
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                >
                  <Plus size={13} /> Add note
                </button>
              </div>
              <div style={{ ...tblHeader, gridTemplateColumns: '170px 1fr 160px 72px' }}>
                <div>Date & Time</div>
                <div>Note</div>
                <div>Signed by</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>
              {(cf.nursingNotes || []).length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  No nursing notes recorded.
                </div>
              ) : (
                (cf.nursingNotes || []).map((n) => (
                  <div
                    key={n.id}
                    style={{
                      ...tblRow,
                      gridTemplateColumns: '170px 1fr 160px 72px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                      {n.dateTime}
                    </div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{n.note}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                      {n.sign}
                    </div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button style={iconBtnSm}>
                        <Pencil size={11} />
                      </button>
                      <button
                        style={{
                          ...iconBtnSm,
                          border: '1px solid rgba(217,80,80,0.3)',
                          color: '#d95050',
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── INVESTIGATIONS ─── */}
          {activeTab === 'investigations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                    Investigations
                  </h2>
                  <button
                    onClick={() => setEntryModal(invSubTab)}
                    className="btn-primary"
                    style={{ fontSize: 12 }}
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
                <div
                  style={{
                    padding: '12px 20px',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex',
                    gap: 6,
                  }}
                >
                  {[
                    { id: 'pathology', label: 'Pathology' },
                    { id: 'radiology', label: 'Radiology' },
                    { id: 'cardiology', label: 'Cardiology' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setInvSubTab(t.id)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 20,
                        border: `1px solid ${invSubTab === t.id ? C.primary : C.border}`,
                        background: invSubTab === t.id ? 'rgba(8,145,178,0.08)' : 'transparent',
                        color: invSubTab === t.id ? C.primary : C.muted,
                        fontSize: 12,
                        fontWeight: invSubTab === t.id ? 600 : 400,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {invSubTab === 'pathology' && (
                  <>
                    <div style={{ ...tblHeader, gridTemplateColumns: '130px 90px 1fr 140px 72px' }}>
                      <div>Date</div>
                      <div>Time</div>
                      <div>Investigation</div>
                      <div>Signed by</div>
                      <div style={{ textAlign: 'right' }}>Actions</div>
                    </div>
                    {(cf.pathology || []).length === 0 ? (
                      <div
                        style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: C.muted,
                          fontSize: 13,
                        }}
                      >
                        No pathology investigations.
                      </div>
                    ) : (
                      (cf.pathology || []).map((p, i) => (
                        <div
                          key={i}
                          style={{ ...tblRow, gridTemplateColumns: '130px 90px 1fr 140px 72px' }}
                        >
                          <div style={{ fontSize: 12, color: C.muted }}>{p.date}</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{p.time}</div>
                          <div style={{ fontWeight: 500, color: C.text }}>{p.investigation}</div>
                          <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                            {p.sign}
                          </div>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button style={iconBtnSm}>
                              <Pencil size={11} />
                            </button>
                            <button
                              style={{
                                ...iconBtnSm,
                                border: '1px solid rgba(217,80,80,0.3)',
                                color: '#d95050',
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {invSubTab === 'radiology' && (
                  <>
                    <div
                      style={{
                        ...tblHeader,
                        gridTemplateColumns: '120px 80px 1fr 74px 64px 110px 72px 72px',
                      }}
                    >
                      <div>Date</div>
                      <div>Time</div>
                      <div>Investigation</div>
                      <div>Portable</div>
                      <div>RT-ER</div>
                      <div>Plate No.</div>
                      <div>Sign</div>
                      <div style={{ textAlign: 'right' }}>Actions</div>
                    </div>
                    {(cf.radiology || []).length === 0 ? (
                      <div
                        style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: C.muted,
                          fontSize: 13,
                        }}
                      >
                        No radiology investigations.
                      </div>
                    ) : (
                      (cf.radiology || []).map((r, i) => (
                        <div
                          key={i}
                          style={{
                            ...tblRow,
                            gridTemplateColumns: '120px 80px 1fr 74px 64px 110px 72px 72px',
                          }}
                        >
                          <div style={{ fontSize: 12, color: C.muted }}>{r.date}</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{r.time}</div>
                          <div style={{ fontWeight: 500, color: C.text }}>{r.investigation}</div>
                          <div style={{ textAlign: 'center' }}>
                            {r.portable ? (
                              <Check size={13} color="#16a34a" />
                            ) : (
                              <X size={13} color={C.muted} />
                            )}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            {r.rtEr ? (
                              <Check size={13} color="#16a34a" />
                            ) : (
                              <X size={13} color={C.muted} />
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted }}>{r.plateNo}</div>
                          <div style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>
                            {r.sign}
                          </div>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button style={iconBtnSm}>
                              <Pencil size={11} />
                            </button>
                            <button
                              style={{
                                ...iconBtnSm,
                                border: '1px solid rgba(217,80,80,0.3)',
                                color: '#d95050',
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {invSubTab === 'cardiology' && (
                  <>
                    <div
                      style={{ ...tblHeader, gridTemplateColumns: '120px 90px 1fr 1fr 140px 72px' }}
                    >
                      <div>Date</div>
                      <div>Time</div>
                      <div>Investigation</div>
                      <div>Doctor</div>
                      <div>Signed by</div>
                      <div style={{ textAlign: 'right' }}>Actions</div>
                    </div>
                    {(cf.cardiology || []).length === 0 ? (
                      <div
                        style={{
                          padding: '40px 20px',
                          textAlign: 'center',
                          color: C.muted,
                          fontSize: 13,
                        }}
                      >
                        No cardiology investigations.
                      </div>
                    ) : (
                      (cf.cardiology || []).map((c, i) => (
                        <div
                          key={i}
                          style={{
                            ...tblRow,
                            gridTemplateColumns: '120px 90px 1fr 1fr 140px 72px',
                          }}
                        >
                          <div style={{ fontSize: 12, color: C.muted }}>{c.date}</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{c.time}</div>
                          <div style={{ fontWeight: 500, color: C.text }}>{c.investigation}</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{c.doctor}</div>
                          <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                            {c.sign}
                          </div>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button style={iconBtnSm}>
                              <Pencil size={11} />
                            </button>
                            <button
                              style={{
                                ...iconBtnSm,
                                border: '1px solid rgba(217,80,80,0.3)',
                                color: '#d95050',
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ─── PROCEDURES & EQUIPMENT ─── */}
          {activeTab === 'procedures' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Procedures & Equipment
                </h2>
                <button
                  onClick={() => setEntryModal(procSubTab)}
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>
              <div
                style={{
                  padding: '12px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  gap: 6,
                }}
              >
                {[
                  { id: 'equipment', label: 'Equipment' },
                  { id: 'dressing', label: 'Dressing / C-Arm' },
                  { id: 'traction', label: 'Traction' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setProcSubTab(t.id)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 20,
                      border: `1px solid ${procSubTab === t.id ? C.primary : C.border}`,
                      background: procSubTab === t.id ? 'rgba(8,145,178,0.08)' : 'transparent',
                      color: procSubTab === t.id ? C.primary : C.muted,
                      fontSize: 12,
                      fontWeight: procSubTab === t.id ? 600 : 400,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {procSubTab === 'equipment' && (
                <>
                  <div
                    style={{
                      ...tblHeader,
                      gridTemplateColumns: '110px 1.4fr 100px 100px 100px 100px 100px 72px',
                    }}
                  >
                    <div>ON Date</div>
                    <div>Equipment type</div>
                    <div>ON Time</div>
                    <div>Sign (ON)</div>
                    <div>OFF Date</div>
                    <div>OFF Time</div>
                    <div>Sign (OFF)</div>
                    <div style={{ textAlign: 'right' }}>Act.</div>
                  </div>
                  {(cf.equipment || []).length === 0 ? (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: C.muted,
                        fontSize: 13,
                      }}
                    >
                      No equipment recorded.
                    </div>
                  ) : (
                    (cf.equipment || []).map((eq, i) => (
                      <div
                        key={i}
                        style={{
                          ...tblRow,
                          gridTemplateColumns: '110px 1.4fr 100px 100px 100px 100px 100px 72px',
                        }}
                      >
                        <div style={{ fontSize: 12, color: C.muted }}>{eq.onDate}</div>
                        <div style={{ fontWeight: 500, color: C.text, fontSize: 12 }}>
                          {eq.type}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>{eq.onTime}</div>
                        <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                          {eq.sign}
                        </div>
                        <div style={{ fontSize: 12, color: eq.offDate ? C.muted : C.border }}>
                          {eq.offDate || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: eq.offTime ? C.muted : C.border }}>
                          {eq.offTime || '—'}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: eq.offSign ? C.muted : C.border,
                            fontStyle: 'italic',
                          }}
                        >
                          {eq.offSign || '—'}
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button style={iconBtnSm}>
                            <Pencil size={11} />
                          </button>
                          <button
                            style={{
                              ...iconBtnSm,
                              border: '1px solid rgba(217,80,80,0.3)',
                              color: '#d95050',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {procSubTab === 'dressing' && (
                <>
                  <div
                    style={{ ...tblHeader, gridTemplateColumns: '120px 90px 1fr 1fr 140px 72px' }}
                  >
                    <div>Date</div>
                    <div>Time</div>
                    <div>Procedure</div>
                    <div>Doctor</div>
                    <div>Signed by</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>
                  {(cf.dressing || []).length === 0 ? (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: C.muted,
                        fontSize: 13,
                      }}
                    >
                      No dressing procedures recorded.
                    </div>
                  ) : (
                    (cf.dressing || []).map((d, i) => (
                      <div
                        key={i}
                        style={{ ...tblRow, gridTemplateColumns: '120px 90px 1fr 1fr 140px 72px' }}
                      >
                        <div style={{ fontSize: 12, color: C.muted }}>{d.date}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{d.time}</div>
                        <div style={{ fontWeight: 500, color: C.text, fontSize: 12 }}>
                          {d.procedure}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted }}>{d.doctor}</div>
                        <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                          {d.sign}
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button style={iconBtnSm}>
                            <Pencil size={11} />
                          </button>
                          <button
                            style={{
                              ...iconBtnSm,
                              border: '1px solid rgba(217,80,80,0.3)',
                              color: '#d95050',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {procSubTab === 'traction' && (
                <>
                  <div
                    style={{
                      ...tblHeader,
                      gridTemplateColumns: '120px 90px 1fr 120px 90px 140px 72px',
                    }}
                  >
                    <div>Start Date</div>
                    <div>Start Time</div>
                    <div>Procedure</div>
                    <div>End Date</div>
                    <div>End Time</div>
                    <div>Signed by</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>
                  {(cf.traction || []).length === 0 ? (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: C.muted,
                        fontSize: 13,
                      }}
                    >
                      No traction procedures recorded.
                    </div>
                  ) : (
                    (cf.traction || []).map((t, i) => (
                      <div
                        key={i}
                        style={{
                          ...tblRow,
                          gridTemplateColumns: '120px 90px 1fr 120px 90px 140px 72px',
                        }}
                      >
                        <div style={{ fontSize: 12, color: C.muted }}>{t.startDate}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t.startTime}</div>
                        <div style={{ fontWeight: 500, color: C.text, fontSize: 12 }}>
                          {t.procedure}
                        </div>
                        <div style={{ fontSize: 12, color: t.endDate ? C.muted : C.border }}>
                          {t.endDate || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: t.endTime ? C.muted : C.border }}>
                          {t.endTime || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                          {t.sign}
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button style={iconBtnSm}>
                            <Pencil size={11} />
                          </button>
                          <button
                            style={{
                              ...iconBtnSm,
                              border: '1px solid rgba(217,80,80,0.3)',
                              color: '#d95050',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── RECORD OF VISITS ─── */}
          {activeTab === 'visits' && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.text }}>
                  Record of Visits
                </h2>
                <button
                  onClick={() => setEntryModal('rounds')}
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                >
                  <Plus size={13} /> Add visit
                </button>
              </div>
              <div
                style={{
                  ...tblHeader,
                  gridTemplateColumns: '120px 56px 68px 80px 84px 1fr 140px 72px',
                }}
              >
                <div>Date</div>
                <div>First</div>
                <div>Routine</div>
                <div>Day Spcl.</div>
                <div>Night Spcl.</div>
                <div>Consultant</div>
                <div>Signature</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>
              {(cf.rounds || []).length === 0 ? (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: C.muted,
                    fontSize: 13,
                  }}
                >
                  No visits recorded.
                </div>
              ) : (
                (cf.rounds || []).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      ...tblRow,
                      gridTemplateColumns: '120px 56px 68px 80px 84px 1fr 140px 72px',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{r.date}</div>
                    <div style={{ textAlign: 'center' }}>
                      {r.first ? (
                        <Check size={14} color="#16a34a" />
                      ) : (
                        <span style={{ color: C.border }}>—</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {r.routine ? (
                        <Check size={14} color={C.primary} />
                      ) : (
                        <span style={{ color: C.border }}>—</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {r.daySpcl ? (
                        <Check size={14} color="#d97706" />
                      ) : (
                        <span style={{ color: C.border }}>—</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {r.nightSpcl ? (
                        <Check size={14} color="#7c3aed" />
                      ) : (
                        <span style={{ color: C.border }}>—</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: C.text }}>{r.consultant}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                      {r.signature}
                    </div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button style={iconBtnSm}>
                        <Pencil size={11} />
                      </button>
                      <button
                        style={{
                          ...iconBtnSm,
                          border: '1px solid rgba(217,80,80,0.3)',
                          color: '#d95050',
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Discharge Summary overlay */}
      {showDS && (
        <DischargeSummaryOverlay
          adm={adm}
          onClose={() => setShowDS(false)}
          onPrint={() => {
            setShowDS(false);
            printAdmission();
          }}
        />
      )}

      {entryModal && (
        <CaseFileEntryModal
          type={entryModal}
          adm={adm}
          onClose={() => setEntryModal(null)}
          onSave={handleSaveEntry}
        />
      )}
    </div>
  );
}

// ── ENTRY MODAL FOR CASE FILE SECTIONS ────────────────────────────────────────

function CaseFileEntryModal({ type, adm, onClose, onSave }) {
  const cf = adm.casefile || {};
  const [fields, setFields] = useState(() => {
    if (type === 'consent') {
      return { consent: !!adm.consent };
    }
    if (type === 'past-history') {
      return {
        allergies: adm.allergies || '',
        diabetes: cf.pastHistoryDetails?.diabetes ?? 'Type II — under medication',
        hypertension: cf.pastHistoryDetails?.hypertension ?? 'Yes, since 5 years',
        cardiac: cf.pastHistoryDetails?.cardiac ?? 'No',
        surgeries:
          cf.pastHistoryDetails?.surgeries ??
          (adm.id === 'IPD-2026-042' ? 'Appendectomy (2018)' : 'None'),
        family: cf.pastHistoryDetails?.family ?? 'Father — Hypertension',
        smokingAlcohol: cf.pastHistoryDetails?.smokingAlcohol ?? 'Non-smoker, occasional alcohol',
      };
    }
    if (type === 'triage') {
      return {
        bp: adm.triage?.bp || '',
        pulse: adm.triage?.pulse || '',
        rr: adm.triage?.rr || '',
        spo2: adm.triage?.spo2 || '',
        rbs: adm.triage?.rbs || '',
        temp: adm.triage?.temp || '',
        esiLevel: adm.esiLevel || '3',
        esiColor: adm.esiColor || 'Yellow',
      };
    }
    if (type === 'history') {
      return {
        reason: adm.reason || '',
        presentingComplaintsExtra:
          cf.presentingComplaintsExtra ?? 'Associated with fever and nausea for the past 2 days.',
        cns: cf.systemicExam?.cns ?? 'Conscious, oriented',
        cvs: cf.systemicExam?.cvs ?? 'S1, S2 heard, no murmur',
        respiratory: cf.systemicExam?.respiratory ?? 'NVBS, clear',
        abdomen: cf.systemicExam?.abdomen ?? 'Tenderness noted, guarding present',
      };
    }
    if (type === 'care-plan') {
      return {
        rs: cf.carePlan?.systemicExam?.rs || '',
        cvs: cf.carePlan?.systemicExam?.cvs || '',
        pa: cf.carePlan?.systemicExam?.pa || '',
        cns: cf.carePlan?.systemicExam?.cns || '',
        gcs: cf.carePlan?.systemicExam?.gcs || '',
        pupils: cf.carePlan?.systemicExam?.pupils || '',
        reflexes: cf.carePlan?.systemicExam?.reflexes || '',
        loc: cf.carePlan?.systemicExam?.loc || '',
        provisionalDx: adm.provisionalDx || '',
        conservative: cf.carePlan?.plan?.conservative || '',
        operative: cf.carePlan?.plan?.operative || '',
        surgery: cf.carePlan?.plan?.surgery || '',
        other: cf.carePlan?.plan?.other || '',
        investigationRadiology: cf.carePlan?.plan?.investigationRadiology || '',
        investigationPathology: cf.carePlan?.plan?.investigationPathology || '',
        referenceDoctor: cf.carePlan?.plan?.referenceDoctor || '',
        diet: cf.carePlan?.plan?.diet || '',
        physiotherapy: cf.carePlan?.plan?.physiotherapy || '',
        dischargeNeeds: cf.carePlan?.plan?.dischargeNeeds || '',
      };
    }
    if (type === 'medications') {
      return { drug: '', dose: '', route: 'Oral', frequency: 'BD', qty: '10' };
    }
    if (type === 'clinical') {
      return { note: '', doctor: adm.admittingDoctor || '' };
    }
    if (type === 'nursing') {
      return { note: '', sign: 'Nurse on duty' };
    }
    if (type === 'pathology') {
      return { investigation: '', sign: adm.admittingDoctor || '' };
    }
    if (type === 'radiology') {
      return {
        investigation: '',
        portable: false,
        rtEr: false,
        plateNo: '',
        sign: adm.admittingDoctor || '',
      };
    }
    if (type === 'cardiology') {
      return {
        investigation: '',
        doctor: adm.admittingDoctor || '',
        sign: adm.admittingDoctor || '',
      };
    }
    if (type === 'equipment') {
      return {
        type: '',
        onDate: TODAY,
        onTime: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        sign: 'Nurse on duty',
        offDate: '',
        offTime: '',
        offSign: '',
      };
    }
    if (type === 'dressing') {
      return { procedure: '', doctor: adm.admittingDoctor || '', sign: 'Nurse on duty' };
    }
    if (type === 'traction') {
      return {
        procedure: '',
        startDate: TODAY,
        startTime: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        endDate: '',
        endTime: '',
        sign: adm.admittingDoctor || '',
      };
    }
    if (type === 'rounds') {
      return {
        date: TODAY,
        first: false,
        routine: true,
        daySpcl: false,
        nightSpcl: false,
        consultant: adm.admittingDoctor || '',
        signature: adm.admittingDoctor || '',
      };
    }
    return {};
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {};
      if (type === 'consent') {
        updates.consent = fields.consent;
      } else if (type === 'past-history') {
        updates.allergies = fields.allergies;
        updates.hasAllergy = !!fields.allergies;
        updates.casefile = {
          pastHistoryDetails: {
            diabetes: fields.diabetes,
            hypertension: fields.hypertension,
            cardiac: fields.cardiac,
            surgeries: fields.surgeries,
            family: fields.family,
            smokingAlcohol: fields.smokingAlcohol,
          },
        };
      } else if (type === 'triage') {
        updates.triage = {
          bp: fields.bp,
          pulse: fields.pulse,
          rr: fields.rr,
          spo2: fields.spo2,
          rbs: fields.rbs,
          temp: fields.temp,
        };
        updates.triageDone = true;
        updates.esiLevel = fields.esiLevel;
        const colors = { 1: 'Red', 2: 'Orange', 3: 'Yellow', 4: 'Green', 5: 'Blue' };
        updates.esiColor = colors[fields.esiLevel] || 'Yellow';
      } else if (type === 'history') {
        updates.reason = fields.reason;
        updates.history = true;
        updates.casefile = {
          presentingComplaintsExtra: fields.presentingComplaintsExtra,
          systemicExam: {
            cns: fields.cns,
            cvs: fields.cvs,
            respiratory: fields.respiratory,
            abdomen: fields.abdomen,
          },
        };
      } else if (type === 'care-plan') {
        updates.provisionalDx = fields.provisionalDx;
        updates.carePlan = true;
        updates.casefile = {
          carePlan: {
            systemicExam: {
              rs: fields.rs,
              cvs: fields.cvs,
              pa: fields.pa,
              cns: fields.cns,
              gcs: fields.gcs,
              pupils: fields.pupils,
              reflexes: fields.reflexes,
              loc: fields.loc,
            },
            plan: {
              conservative: fields.conservative,
              operative: fields.operative,
              surgery: fields.surgery,
              other: fields.other,
              investigationRadiology: fields.investigationRadiology,
              investigationPathology: fields.investigationPathology,
              referenceDoctor: fields.referenceDoctor,
              diet: fields.diet,
              physiotherapy: fields.physiotherapy,
              dischargeNeeds: fields.dischargeNeeds,
            },
          },
        };
      } else if (type === 'medications') {
        const list = cf.medications || [];
        const newItem = {
          sr: list.length + 1,
          drug: fields.drug,
          dose: fields.dose,
          route: fields.route,
          frequency: fields.frequency,
          qty: parseInt(fields.qty) || 0,
        };
        updates.casefile = { medications: [...list, newItem] };
      } else if (type === 'clinical') {
        const list = cf.clinicalNotes || [];
        const newItem = {
          id: 'CN-' + Date.now(),
          date: TODAY,
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          note: fields.note,
          doctor: fields.doctor,
        };
        updates.casefile = { clinicalNotes: [...list, newItem] };
      } else if (type === 'nursing') {
        const list = cf.nursingNotes || [];
        const newItem = {
          id: 'NN-' + Date.now(),
          dateTime:
            fmtDate(TODAY) +
            ' ' +
            new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
          note: fields.note,
          sign: fields.sign,
        };
        updates.casefile = { nursingNotes: [...list, newItem] };
      } else if (type === 'pathology') {
        const list = cf.pathology || [];
        const newItem = {
          date: fmtDate(TODAY),
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          investigation: fields.investigation,
          sign: fields.sign,
        };
        updates.casefile = { pathology: [...list, newItem] };
      } else if (type === 'radiology') {
        const list = cf.radiology || [];
        const newItem = {
          date: fmtDate(TODAY),
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          investigation: fields.investigation,
          portable: fields.portable,
          rtEr: fields.rtEr,
          plateNo: fields.plateNo,
          sign: fields.sign,
        };
        updates.casefile = { radiology: [...list, newItem] };
      } else if (type === 'cardiology') {
        const list = cf.cardiology || [];
        const newItem = {
          date: fmtDate(TODAY),
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          investigation: fields.investigation,
          doctor: fields.doctor,
          sign: fields.sign,
        };
        updates.casefile = { cardiology: [...list, newItem] };
      } else if (type === 'equipment') {
        const list = cf.equipment || [];
        const newItem = {
          type: fields.type,
          onDate: fmtDate(fields.onDate),
          onTime: fields.onTime,
          sign: fields.sign,
          offDate: fields.offDate ? fmtDate(fields.offDate) : '',
          offTime: fields.offTime,
          offSign: fields.offSign,
        };
        updates.casefile = { equipment: [...list, newItem] };
      } else if (type === 'dressing') {
        const list = cf.dressing || [];
        const newItem = {
          date: fmtDate(TODAY),
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          procedure: fields.procedure,
          doctor: fields.doctor,
          sign: fields.sign,
        };
        updates.casefile = { dressing: [...list, newItem] };
      } else if (type === 'traction') {
        const list = cf.traction || [];
        const newItem = {
          procedure: fields.procedure,
          startDate: fmtDate(fields.startDate),
          startTime: fields.startTime,
          endDate: fields.endDate ? fmtDate(fields.endDate) : '',
          endTime: fields.endTime,
          sign: fields.sign,
        };
        updates.casefile = { traction: [...list, newItem] };
      } else if (type === 'rounds') {
        const list = cf.rounds || [];
        const newItem = {
          date: fmtDate(fields.date),
          first: fields.first,
          routine: fields.routine,
          daySpcl: fields.daySpcl,
          nightSpcl: fields.nightSpcl,
          consultant: fields.consultant,
          signature: fields.signature,
        };
        updates.casefile = { rounds: [...list, newItem] };
      }
      await onSave(updates);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const setVal = (k, v) => setFields((prev) => ({ ...prev, [k]: v }));

  const inp = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-strong)',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: 14,
    outline: 'none',
    background: 'var(--bg-canvas)',
    color: 'var(--fg-on-light)',
    boxSizing: 'border-box',
  };
  const lbl = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--fg-on-light-muted)',
    marginBottom: 5,
  };

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ alignItems: 'flex-start', paddingTop: 40 }}
    >
      <div
        className="modal-panel"
        style={{
          maxWidth: 540,
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 80px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-card)',
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-on-light)' }}>
              {type === 'consent' && 'Consent Form'}
              {type === 'past-history' && 'Past History Details'}
              {type === 'triage' && 'Triage Information'}
              {type === 'history' && 'Patient History & Exam'}
              {type === 'care-plan' && 'Care Plan Details'}
              {type === 'medications' && 'Add Medication'}
              {type === 'clinical' && 'Add Clinical Note'}
              {type === 'nursing' && 'Add Nursing Note'}
              {type === 'pathology' && 'Add Pathology Investigation'}
              {type === 'radiology' && 'Add Radiology Investigation'}
              {type === 'cardiology' && 'Add Cardiology Investigation'}
              {type === 'equipment' && 'Add Equipment Record'}
              {type === 'dressing' && 'Add Dressing Procedure'}
              {type === 'traction' && 'Add Traction Record'}
              {type === 'rounds' && 'Add Record of Visit'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>
              Update case file for {adm.patientName}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} color="var(--fg-on-light-muted)" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {type === 'consent' && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '10px 0',
              }}
            >
              <input
                type="checkbox"
                checked={fields.consent}
                onChange={(e) => setVal('consent', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span style={{ fontSize: 14, color: 'var(--fg-on-light)' }}>
                I have verified and obtained the signed General Consent Form from the
                patient/guardian.
              </span>
            </label>
          )}

          {type === 'past-history' && (
            <>
              <label>
                <span style={lbl}>Allergies</span>
                <input
                  style={inp}
                  value={fields.allergies}
                  onChange={(e) => setVal('allergies', e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs"
                />
              </label>
              <label>
                <span style={lbl}>Diabetes</span>
                <input
                  style={inp}
                  value={fields.diabetes}
                  onChange={(e) => setVal('diabetes', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Hypertension</span>
                <input
                  style={inp}
                  value={fields.hypertension}
                  onChange={(e) => setVal('hypertension', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Cardiac Disease</span>
                <input
                  style={inp}
                  value={fields.cardiac}
                  onChange={(e) => setVal('cardiac', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Previous Surgeries</span>
                <input
                  style={inp}
                  value={fields.surgeries}
                  onChange={(e) => setVal('surgeries', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Family History</span>
                <input
                  style={inp}
                  value={fields.family}
                  onChange={(e) => setVal('family', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Smoking / Alcohol</span>
                <input
                  style={inp}
                  value={fields.smokingAlcohol}
                  onChange={(e) => setVal('smokingAlcohol', e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'triage' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>BP (mmHg)</span>
                  <input
                    style={inp}
                    value={fields.bp}
                    onChange={(e) => setVal('bp', e.target.value)}
                    placeholder="120/80"
                  />
                </label>
                <label>
                  <span style={lbl}>Pulse (bpm)</span>
                  <input
                    style={inp}
                    value={fields.pulse}
                    onChange={(e) => setVal('pulse', e.target.value)}
                    placeholder="72"
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>RR (/min)</span>
                  <input
                    style={inp}
                    value={fields.rr}
                    onChange={(e) => setVal('rr', e.target.value)}
                    placeholder="18"
                  />
                </label>
                <label>
                  <span style={lbl}>SpO2 (%)</span>
                  <input
                    style={inp}
                    value={fields.spo2}
                    onChange={(e) => setVal('spo2', e.target.value)}
                    placeholder="98"
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>RBS (mg/dL)</span>
                  <input
                    style={inp}
                    value={fields.rbs}
                    onChange={(e) => setVal('rbs', e.target.value)}
                    placeholder="110"
                  />
                </label>
                <label>
                  <span style={lbl}>Temp (°F)</span>
                  <input
                    style={inp}
                    value={fields.temp}
                    onChange={(e) => setVal('temp', e.target.value)}
                    placeholder="98.6"
                  />
                </label>
              </div>
              <label>
                <span style={lbl}>ESI Level</span>
                <select
                  style={inp}
                  value={fields.esiLevel}
                  onChange={(e) => setVal('esiLevel', e.target.value)}
                >
                  <option value="1">Level 1 (Resuscitation - Red)</option>
                  <option value="2">Level 2 (Emergent - Orange)</option>
                  <option value="3">Level 3 (Urgent - Yellow)</option>
                  <option value="4">Level 4 (Less Urgent - Green)</option>
                  <option value="5">Level 5 (Non-Urgent - Blue)</option>
                </select>
              </label>
            </>
          )}

          {type === 'history' && (
            <>
              <label>
                <span style={lbl}>Chief Complaint / Presenting Complaints</span>
                <textarea
                  style={{ ...inp, height: 60, resize: 'none' }}
                  value={fields.reason}
                  onChange={(e) => setVal('reason', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Associated Details</span>
                <input
                  style={inp}
                  value={fields.presentingComplaintsExtra}
                  onChange={(e) => setVal('presentingComplaintsExtra', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>CNS Exam</span>
                <input
                  style={inp}
                  value={fields.cns}
                  onChange={(e) => setVal('cns', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>CVS Exam</span>
                <input
                  style={inp}
                  value={fields.cvs}
                  onChange={(e) => setVal('cvs', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Respiratory Exam</span>
                <input
                  style={inp}
                  value={fields.respiratory}
                  onChange={(e) => setVal('respiratory', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Abdomen Exam</span>
                <input
                  style={inp}
                  value={fields.abdomen}
                  onChange={(e) => setVal('abdomen', e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'care-plan' && (
            <>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'var(--fg-on-light-muted)',
                }}
              >
                SYSTEMIC EXAMINATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label>
                  <span style={lbl}>RS</span>
                  <input
                    style={inp}
                    value={fields.rs}
                    onChange={(e) => setVal('rs', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>CVS</span>
                  <input
                    style={inp}
                    value={fields.cvs}
                    onChange={(e) => setVal('cvs', e.target.value)}
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label>
                  <span style={lbl}>P/A</span>
                  <input
                    style={inp}
                    value={fields.pa}
                    onChange={(e) => setVal('pa', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>CNS</span>
                  <input
                    style={inp}
                    value={fields.cns}
                    onChange={(e) => setVal('cns', e.target.value)}
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label>
                  <span style={lbl}>GCS</span>
                  <input
                    style={inp}
                    value={fields.gcs}
                    onChange={(e) => setVal('gcs', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>Pupils</span>
                  <input
                    style={inp}
                    value={fields.pupils}
                    onChange={(e) => setVal('pupils', e.target.value)}
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label>
                  <span style={lbl}>Reflexes</span>
                  <input
                    style={inp}
                    value={fields.reflexes}
                    onChange={(e) => setVal('reflexes', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>LOC</span>
                  <input
                    style={inp}
                    value={fields.loc}
                    onChange={(e) => setVal('loc', e.target.value)}
                  />
                </label>
              </div>
              <label>
                <span style={lbl}>Provisional Diagnosis</span>
                <input
                  style={inp}
                  value={fields.provisionalDx}
                  onChange={(e) => setVal('provisionalDx', e.target.value)}
                />
              </label>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'var(--fg-on-light-muted)',
                  marginTop: 8,
                }}
              >
                MANAGEMENT PLAN
              </div>
              <label>
                <span style={lbl}>Conservative Management</span>
                <input
                  style={inp}
                  value={fields.conservative}
                  onChange={(e) => setVal('conservative', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Operative Management</span>
                <input
                  style={inp}
                  value={fields.operative}
                  onChange={(e) => setVal('operative', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Surgery Details</span>
                <input
                  style={inp}
                  value={fields.surgery}
                  onChange={(e) => setVal('surgery', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Diet Plan</span>
                <input
                  style={inp}
                  value={fields.diet}
                  onChange={(e) => setVal('diet', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Radiology Investigations</span>
                <input
                  style={inp}
                  value={fields.investigationRadiology}
                  onChange={(e) => setVal('investigationRadiology', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Pathology Investigations</span>
                <input
                  style={inp}
                  value={fields.investigationPathology}
                  onChange={(e) => setVal('investigationPathology', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Reference Doctor</span>
                <input
                  style={inp}
                  value={fields.referenceDoctor}
                  onChange={(e) => setVal('referenceDoctor', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Physiotherapy</span>
                <input
                  style={inp}
                  value={fields.physiotherapy}
                  onChange={(e) => setVal('physiotherapy', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Discharge Needs</span>
                <input
                  style={inp}
                  value={fields.dischargeNeeds}
                  onChange={(e) => setVal('dischargeNeeds', e.target.value)}
                />
              </label>
              <label>
                <span style={lbl}>Other Plan Details</span>
                <input
                  style={inp}
                  value={fields.other}
                  onChange={(e) => setVal('other', e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'medications' && (
            <>
              <label>
                <span style={lbl}>Drug Name</span>
                <input
                  style={inp}
                  required
                  value={fields.drug}
                  onChange={(e) => setVal('drug', e.target.value)}
                  placeholder="e.g. Paracetamol 650mg"
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Dose</span>
                  <input
                    style={inp}
                    required
                    value={fields.dose}
                    onChange={(e) => setVal('dose', e.target.value)}
                    placeholder="e.g. 1 tab"
                  />
                </label>
                <label>
                  <span style={lbl}>Route</span>
                  <select
                    style={inp}
                    value={fields.route}
                    onChange={(e) => setVal('route', e.target.value)}
                  >
                    <option>Oral</option>
                    <option>IV</option>
                    <option>IM</option>
                    <option>SC</option>
                    <option>Inhalation</option>
                    <option>Topical</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Frequency</span>
                  <input
                    style={inp}
                    required
                    value={fields.frequency}
                    onChange={(e) => setVal('frequency', e.target.value)}
                    placeholder="e.g. BD (Twice daily)"
                  />
                </label>
                <label>
                  <span style={lbl}>Quantity</span>
                  <input
                    style={inp}
                    type="number"
                    required
                    value={fields.qty}
                    onChange={(e) => setVal('qty', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          {type === 'clinical' && (
            <>
              <label>
                <span style={lbl}>Clinical Note</span>
                <textarea
                  style={{ ...inp, height: 120, resize: 'none' }}
                  required
                  value={fields.note}
                  onChange={(e) => setVal('note', e.target.value)}
                  placeholder="Enter clinical observations, progress notes..."
                />
              </label>
              <label>
                <span style={lbl}>Doctor Name</span>
                <input
                  style={inp}
                  required
                  value={fields.doctor}
                  onChange={(e) => setVal('doctor', e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'nursing' && (
            <>
              <label>
                <span style={lbl}>Nursing Note</span>
                <textarea
                  style={{ ...inp, height: 120, resize: 'none' }}
                  required
                  value={fields.note}
                  onChange={(e) => setVal('note', e.target.value)}
                  placeholder="Enter nursing assessment, vitals check notes..."
                />
              </label>
              <label>
                <span style={lbl}>Sign / Signed By</span>
                <input
                  style={inp}
                  required
                  value={fields.sign}
                  onChange={(e) => setVal('sign', e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'pathology' && (
            <>
              <label>
                <span style={lbl}>Investigation / Lab Test</span>
                <input
                  style={inp}
                  required
                  value={fields.investigation}
                  onChange={(e) => setVal('investigation', e.target.value)}
                  placeholder="e.g. CBC, Liver Function Test"
                />
              </label>
              <label>
                <span style={lbl}>Signed By</span>
                <input
                  style={inp}
                  required
                  value={fields.sign}
                  onChange={(e) => setVal('sign', e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'radiology' && (
            <>
              <label>
                <span style={lbl}>Investigation / Imaging</span>
                <input
                  style={inp}
                  required
                  value={fields.investigation}
                  onChange={(e) => setVal('investigation', e.target.value)}
                  placeholder="e.g. X-Ray Chest PA view, CT Abdomen"
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '10px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={fields.portable}
                    onChange={(e) => setVal('portable', e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>Portable</span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '10px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={fields.rtEr}
                    onChange={(e) => setVal('rtEr', e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>RT-ER</span>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Plate Number</span>
                  <input
                    style={inp}
                    value={fields.plateNo}
                    onChange={(e) => setVal('plateNo', e.target.value)}
                    placeholder="e.g. P-98212"
                  />
                </label>
                <label>
                  <span style={lbl}>Signed By</span>
                  <input
                    style={inp}
                    required
                    value={fields.sign}
                    onChange={(e) => setVal('sign', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          {type === 'cardiology' && (
            <>
              <label>
                <span style={lbl}>Investigation</span>
                <input
                  style={inp}
                  required
                  value={fields.investigation}
                  onChange={(e) => setVal('investigation', e.target.value)}
                  placeholder="e.g. ECG, 2D Echo"
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Doctor</span>
                  <input
                    style={inp}
                    required
                    value={fields.doctor}
                    onChange={(e) => setVal('doctor', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>Signed By</span>
                  <input
                    style={inp}
                    required
                    value={fields.sign}
                    onChange={(e) => setVal('sign', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          {type === 'equipment' && (
            <>
              <label>
                <span style={lbl}>Equipment Type / Description</span>
                <input
                  style={inp}
                  required
                  value={fields.type}
                  onChange={(e) => setVal('type', e.target.value)}
                  placeholder="e.g. Oxygen Concentrator, Infusion Pump"
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>ON Date</span>
                  <input
                    style={inp}
                    type="date"
                    required
                    value={fields.onDate}
                    onChange={(e) => setVal('onDate', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>ON Time</span>
                  <input
                    style={inp}
                    required
                    value={fields.onTime}
                    onChange={(e) => setVal('onTime', e.target.value)}
                  />
                </label>
              </div>
              <label>
                <span style={lbl}>Sign (ON)</span>
                <input
                  style={inp}
                  required
                  value={fields.sign}
                  onChange={(e) => setVal('sign', e.target.value)}
                />
              </label>
              <div
                style={{ borderTop: '1px solid var(--border-card)', paddingTop: 10, marginTop: 4 }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--fg-on-light-muted)',
                    marginBottom: 8,
                  }}
                >
                  DISCHARGE / OFF DETAILS (OPTIONAL)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <label>
                    <span style={lbl}>OFF Date</span>
                    <input
                      style={inp}
                      type="date"
                      value={fields.offDate}
                      onChange={(e) => setVal('offDate', e.target.value)}
                    />
                  </label>
                  <label>
                    <span style={lbl}>OFF Time</span>
                    <input
                      style={inp}
                      value={fields.offTime}
                      onChange={(e) => setVal('offTime', e.target.value)}
                    />
                  </label>
                </div>
                <label style={{ marginTop: 8, display: 'block' }}>
                  <span style={lbl}>Sign (OFF)</span>
                  <input
                    style={inp}
                    value={fields.offSign}
                    onChange={(e) => setVal('offSign', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          {type === 'dressing' && (
            <>
              <label>
                <span style={lbl}>Procedure / Dressing</span>
                <input
                  style={inp}
                  required
                  value={fields.procedure}
                  onChange={(e) => setVal('procedure', e.target.value)}
                  placeholder="e.g. Wound debridement & dressing"
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Doctor</span>
                  <input
                    style={inp}
                    required
                    value={fields.doctor}
                    onChange={(e) => setVal('doctor', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>Signed By</span>
                  <input
                    style={inp}
                    required
                    value={fields.sign}
                    onChange={(e) => setVal('sign', e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          {type === 'traction' && (
            <>
              <label>
                <span style={lbl}>Procedure / Traction details</span>
                <input
                  style={inp}
                  required
                  value={fields.procedure}
                  onChange={(e) => setVal('procedure', e.target.value)}
                  placeholder="e.g. Skin traction applied to right leg"
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Start Date</span>
                  <input
                    style={inp}
                    type="date"
                    required
                    value={fields.startDate}
                    onChange={(e) => setVal('startDate', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>Start Time</span>
                  <input
                    style={inp}
                    required
                    value={fields.startTime}
                    onChange={(e) => setVal('startTime', e.target.value)}
                  />
                </label>
              </div>
              <div
                style={{ borderTop: '1px solid var(--border-card)', paddingTop: 10, marginTop: 4 }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--fg-on-light-muted)',
                    marginBottom: 8,
                  }}
                >
                  REMOVAL DETAILS (OPTIONAL)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <label>
                    <span style={lbl}>End Date</span>
                    <input
                      style={inp}
                      type="date"
                      value={fields.endDate}
                      onChange={(e) => setVal('endDate', e.target.value)}
                    />
                  </label>
                  <label>
                    <span style={lbl}>End Time</span>
                    <input
                      style={inp}
                      value={fields.endTime}
                      onChange={(e) => setVal('endTime', e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <label style={{ marginTop: 8, display: 'block' }}>
                <span style={lbl}>Signed By</span>
                <input
                  style={inp}
                  required
                  value={fields.sign}
                  onChange={(e) => setVal('sign', e.target.value)}
                />
              </label>
            </>
          )}

          {type === 'rounds' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Visit Date</span>
                  <input
                    style={inp}
                    type="date"
                    required
                    value={fields.date}
                    onChange={(e) => setVal('date', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>Consultant</span>
                  <input
                    style={inp}
                    required
                    value={fields.consultant}
                    onChange={(e) => setVal('consultant', e.target.value)}
                  />
                </label>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  padding: '4px 0',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={fields.first}
                    onChange={(e) => setVal('first', e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>First Visit</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={fields.routine}
                    onChange={(e) => setVal('routine', e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>Routine Visit</span>
                </label>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  padding: '4px 0',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={fields.daySpcl}
                    onChange={(e) => setVal('daySpcl', e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>Day Spcl.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={fields.nightSpcl}
                    onChange={(e) => setVal('nightSpcl', e.target.checked)}
                  />
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>Night Spcl.</span>
                </label>
              </div>
              <label>
                <span style={lbl}>Signature</span>
                <input
                  style={inp}
                  required
                  value={fields.signature}
                  onChange={(e) => setVal('signature', e.target.value)}
                />
              </label>
            </>
          )}
        </form>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: C.subtleBg,
          }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'transparent',
              color: C.text,
              border: '1px solid var(--border-strong)',
              padding: '9px 16px',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Check size={15} /> {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
