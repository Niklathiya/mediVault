import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAdmission,
  dischargeAdmission,
  updateAdmission,
} from '../firebase/services/admissionService.js';
import { getPatientPendingBills } from '../firebase/services/billingService.js';
import { useRBAC } from '../context/useRBAC';
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
  Info,
} from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

const FREQ_TIMES = {
  OD: ['08:00'],
  BD: ['08:00', '20:00'],
  TDS: ['08:00', '14:00', '20:00'],
  Q4H: ['06:00', '10:00', '14:00', '18:00', '22:00', '02:00'],
  Q6H: ['06:00', '12:00', '18:00', '00:00'],
  Q8H: ['06:00', '14:00', '22:00'],
  Q12H: ['08:00', '20:00'],
  HS: ['22:00'],
  STAT: ['STAT'],
  SOS: ['SOS'],
};

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
  const { canUseIpdTab, canEditIpdTab, canToggleAdmissionStatus, canAccess } = useRBAC();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDS, setShowDS] = useState(false);
  const [entryModal, setEntryModal] = useState(null);
  const [editEntryInfo, setEditEntryInfo] = useState(null); // { type, index, item }
  const [invSubTab, setInvSubTab] = useState('pathology');
  const [procSubTab, setProcSubTab] = useState('equipment');
  const [adm, setAdm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingBills, setPendingBills] = useState(null); // null = hidden; array = show blocking modal

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
  const visibleNavSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canUseIpdTab(item.id)),
  })).filter((section) => section.items.length > 0);
  const visibleProgress = FORM_PROGRESS.filter((item) => canUseIpdTab(item.id));
  const currentTab = canUseIpdTab(activeTab) ? activeTab : 'overview';

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

  const entryTypeToTab = {
    consent: 'consent',
    'past-history': 'past-history',
    triage: 'triage',
    history: 'history',
    'care-plan': 'care-plan',
    medications: 'medications',
    clinical: 'clinical',
    nursing: 'nursing',
    pathology: 'investigations',
    radiology: 'investigations',
    cardiology: 'investigations',
    equipment: 'procedures',
    dressing: 'procedures',
    traction: 'procedures',
    rounds: 'visits',
  };

  const TYPE_TO_SUB_KEY = {
    medications: 'medications',
    clinical: 'clinicalNotes',
    nursing: 'nursingNotes',
    pathology: 'pathology',
    radiology: 'radiology',
    cardiology: 'cardiology',
    equipment: 'equipment',
    dressing: 'dressing',
    traction: 'traction',
    rounds: 'rounds',
  };

  const openEntryModal = (type) => {
    const targetTab = entryTypeToTab[type] || currentTab;
    if (canEditIpdTab(targetTab)) setEntryModal(type);
  };

  const handleOpenEditEntry = (type, index) => {
    const subKey = TYPE_TO_SUB_KEY[type];
    if (!subKey) return;
    const item = (cf[subKey] || [])[index];
    if (!item) return;
    const targetTab = entryTypeToTab[type] || currentTab;
    if (!canEditIpdTab(targetTab)) return;
    setEditEntryInfo({ type, index, item });
    setEntryModal(type);
  };

  const handleDeleteCasefileItem = async (subKey, index) => {
    const labels = {
      medications: 'medication',
      clinicalNotes: 'clinical note',
      nursingNotes: 'nursing note',
      pathology: 'pathology record',
      radiology: 'radiology record',
      cardiology: 'cardiology record',
      equipment: 'equipment record',
      dressing: 'dressing record',
      traction: 'traction record',
      rounds: 'visit record',
    };
    if (!window.confirm(`Delete this ${labels[subKey] || 'record'}?`)) return;
    const updatedList = (cf[subKey] || []).filter((_, i) => i !== index);
    const updatedAdm = { ...adm, casefile: { ...cf, [subKey]: updatedList } };
    if (subKey === 'medications') updatedAdm.medications = updatedList.length;
    if (subKey === 'clinicalNotes') updatedAdm.clinical = updatedList.length;
    if (subKey === 'nursingNotes') updatedAdm.nursing = updatedList.length;
    if (['pathology', 'radiology', 'cardiology'].includes(subKey)) {
      updatedAdm.investigations = ['pathology', 'radiology', 'cardiology'].reduce(
        (sum, k) => sum + (k === subKey ? updatedList : cf[k] || []).length,
        0,
      );
    }
    if (['equipment', 'dressing', 'traction'].includes(subKey)) {
      updatedAdm.procedures = ['equipment', 'dressing', 'traction'].reduce(
        (sum, k) => sum + (k === subKey ? updatedList : cf[k] || []).length,
        0,
      );
    }
    if (subKey === 'rounds') updatedAdm.visits = updatedList.length;
    await updateAdmission(id, updatedAdm);
    setAdm(updatedAdm);
  };

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
    setEditEntryInfo(null);
  };

  const printAdmission = () => {
    let iframe = document.getElementById('print-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0px';
      iframe.style.top = '-1000px';
      iframe.style.left = '-1000px';
      document.body.appendChild(iframe);
    }
    const pri = iframe.contentWindow || iframe.contentDocument;

    const renderSection = (title, content) => `
      <div class="section-container">
        <div class="section-title">${title}</div>
        ${content}
      </div>
    `;

    const consentHtml = `
      <div class="grid-2">
        <div class="card">
          <div class="card-title">Consent Status</div>
          <div class="card-content">
            ${adm.consent ? '<span class="badge badge-success">Consent Obtained</span>' : '<span class="badge badge-danger">Pending</span>'}
            <div style="margin-top: 8px;">
              <strong>Patient Name:</strong> ${adm.patientName}<br/>
              <strong>Signed On:</strong> ${fmtDate(adm.admittedOn)}<br/>
              <strong>Witnessed By:</strong> ${adm.admittingDoctor}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Consent Acknowledgements</div>
          <div class="card-content" style="font-size: 11px; color: #475569;">
            ✓ Voluntary consent for treatment & minor procedures<br/>
            ✓ Responsibility for all bills & vacating room on discharge<br/>
            ✓ Consent for photography/video (medical/educational)<br/>
            ✓ Permission to access medical records<br/>
            ✓ Commitment to abide by hospital rules & regulations
          </div>
        </div>
      </div>
    `;

    const pastHistoryHtml = `
      <div class="card" style="border-left: 4px solid ${adm.allergies ? '#d95050' : '#16a34a'};">
        <div class="card-title" style="color: ${adm.allergies ? '#b91c1c' : '#15803d'};">Allergies</div>
        <div class="card-content"><strong>${adm.allergies || 'No known drug or food allergies'}</strong></div>
      </div>
      <div class="grid-2">
        ${[
          ['Diabetes', cf.pastHistoryDetails?.diabetes ?? 'None'],
          ['Hypertension', cf.pastHistoryDetails?.hypertension ?? 'None'],
          ['Cardiac disease', cf.pastHistoryDetails?.cardiac ?? 'None'],
          ['Previous surgeries', cf.pastHistoryDetails?.surgeries ?? 'None'],
          ['Family history', cf.pastHistoryDetails?.family ?? 'None'],
          ['Smoking / Alcohol', cf.pastHistoryDetails?.smokingAlcohol ?? 'None'],
        ]
          .map(
            ([l, v]) => `
          <div class="card">
            <div class="card-title">${l}</div>
            <div class="card-content">${v}</div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

    const triageHtml = `
      <div style="display: flex; gap: 16px; align-items: stretch; margin-bottom: 12px;">
        <div style="flex: 1;" class="grid-2">
          <div class="card"><div class="card-title">Chief Complaint</div><div class="card-content">${adm.reason}</div></div>
          <div class="card"><div class="card-title">Time Triaged</div><div class="card-content">${adm.admittedTime}</div></div>
          <div class="card"><div class="card-title">Mode of Arrival</div><div class="card-content">Walking</div></div>
          <div class="card"><div class="card-title">Triaged By</div><div class="card-content">Nurse on duty</div></div>
        </div>
        <div style="width: 140px; background: ${adm.esiLevel === '1' ? '#b91c1c' : adm.esiLevel === '2' ? '#d97706' : '#0891b2'}; color: white; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 600; opacity: 0.9;">ESI Level</div>
          <div style="font-size: 36px; font-weight: 700; line-height: 1; margin: 4px 0;">${adm.esiLevel}</div>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 600;">${adm.esiColor}</div>
        </div>
      </div>
      <div class="grid-2" style="grid-template-columns: repeat(6, 1fr); gap: 8px;">
        ${[
          ['BP', adm.triage.bp, 'mmHg'],
          ['Pulse', adm.triage.pulse, '/min'],
          ['RR', adm.triage.rr, '/min'],
          ['SpO₂', adm.triage.spo2, '%'],
          ['RBS', adm.triage.rbs, 'mg/dL'],
          ['Temp', adm.triage.temp, '°F'],
        ]
          .map(
            ([l, v, u]) => `
          <div class="card" style="text-align: center; padding: 8px 4px;">
            <div class="card-title" style="font-size: 9px; margin-bottom: 2px;">${l}</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${v || '—'}</div>
            <div style="font-size: 8px; color: #64748b; margin-top: 1px;">${u}</div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

    const hxExamHtml = `
      <div class="card" style="margin-bottom: 12px;">
        <div class="card-title">Presenting Complaints Details</div>
        <div class="card-content" style="line-height: 1.6;">Patient presents with: ${adm.reason}. ${cf.presentingComplaintsExtra ?? 'Associated with fever and nausea for the past 2 days.'}</div>
      </div>
      <div class="grid-2">
        ${[
          ['CNS (Central Nervous System)', cf.systemicExam?.cns ?? 'Conscious, oriented'],
          ['CVS (Cardiovascular System)', cf.systemicExam?.cvs ?? 'S1, S2 heard, no murmur'],
          ['Respiratory System', cf.systemicExam?.respiratory ?? 'NVBS, clear'],
          [
            'Abdomen / Gastrointestinal',
            cf.systemicExam?.abdomen ?? 'Tenderness noted, guarding present',
          ],
        ]
          .map(
            ([s, v]) => `
          <div class="card">
            <div class="card-title">${s}</div>
            <div class="card-content">${v}</div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

    const carePlanHtml = `
      <div class="card" style="margin-bottom: 12px;">
        <div class="card-title" style="color: #0891b2;">Provisional Diagnosis</div>
        <div style="font-size: 15px; font-weight: 600; color: #0f172a;">${adm.provisionalDx}</div>
      </div>
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.05em;">Systemic Examination</div>
      <div class="grid-2" style="grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
        ${[
          ['RS', cf.carePlan?.systemicExam?.rs],
          ['CVS', cf.carePlan?.systemicExam?.cvs],
          ['P/A', cf.carePlan?.systemicExam?.pa],
          ['CNS', cf.carePlan?.systemicExam?.cns],
          ['GCS', cf.carePlan?.systemicExam?.gcs],
          ['Pupils', cf.carePlan?.systemicExam?.pupils],
          ['Reflexes', cf.carePlan?.systemicExam?.reflexes],
          ['LOC', cf.carePlan?.systemicExam?.loc],
        ]
          .map(
            ([l, v]) => `
          <div class="card" style="padding: 6px 8px;">
            <div class="card-title" style="font-size: 9px; margin-bottom: 2px;">${l}</div>
            <div style="font-size: 12px; font-weight: 500;">${v || '—'}</div>
          </div>
        `,
          )
          .join('')}
      </div>
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.05em;">Management Plan</div>
      <div class="grid-2">
        ${[
          ['Conservative management', cf.carePlan?.plan?.conservative],
          ['Operative management', cf.carePlan?.plan?.operative],
          ['Surgery', cf.carePlan?.plan?.surgery],
          ['Radiology Investigation', cf.carePlan?.plan?.investigationRadiology],
          ['Pathology Investigation', cf.carePlan?.plan?.investigationPathology],
          ['Reference Doctor', cf.carePlan?.plan?.referenceDoctor],
          ['Diet Plan', cf.carePlan?.plan?.diet],
          ['Physiotherapy', cf.carePlan?.plan?.physiotherapy],
          ['Discharge Needs', cf.carePlan?.plan?.dischargeNeeds],
          ['Other Instructions', cf.carePlan?.plan?.other],
        ]
          .filter(([, v]) => v)
          .map(
            ([l, v]) => `
          <div class="card">
            <div class="card-title">${l}</div>
            <div class="card-content">${v}</div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

    const medsHtml = `
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">Sr</th>
            <th>Drug Name</th>
            <th>Dose</th>
            <th>Route</th>
            <th>Frequency</th>
            <th style="width: 60px;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${
            (cf.medications || []).length === 0
              ? `
            <tr><td colspan="6" style="text-align: center; color: #64748b;">No medications recorded.</td></tr>
          `
              : (cf.medications || [])
                  .map(
                    (m) => `
            <tr>
              <td>${m.sr}</td>
              <td style="font-weight: 600;">${m.drug}</td>
              <td>${m.dose}</td>
              <td><span class="badge" style="background:#e2e8f0; color:#334155;">${m.route}</span></td>
              <td>${m.frequency}</td>
              <td>${m.qty}</td>
            </tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>
    `;

    const treatmentHtml = `
      <table>
        <thead>
          <tr>
            <th>Drug</th>
            <th>Dose</th>
            <th>Route</th>
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          ${
            (cf.treatmentList || []).length === 0
              ? `
            <tr><td colspan="4" style="text-align: center; color: #64748b;">No treatment recorded.</td></tr>
          `
              : (cf.treatmentList || [])
                  .map(
                    (t) => `
            <tr>
              <td style="font-weight: 600;">${t.drug}</td>
              <td>${t.dose}</td>
              <td><span class="badge" style="background:#e2e8f0; color:#334155;">${t.route}</span></td>
              <td>${t.freq}</td>
            </tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>
    `;

    const clinicalHtml = `
      ${
        (cf.clinicalNotes || []).length === 0
          ? `
        <div class="card" style="text-align: center; color: #64748b;">No clinical notes recorded.</div>
      `
          : (cf.clinicalNotes || [])
              .map(
                (n) => `
        <div class="card" style="border-left: 3px solid #0891b2; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
            <span>Date: ${n.date} · Time: ${n.time}</span>
            <span style="color: #0891b2;">Dr. ${n.doctor}</span>
          </div>
          <div style="font-size: 13px; line-height: 1.5; color: #1e293b;">${n.note}</div>
        </div>
      `,
              )
              .join('')
      }
    `;

    const nursingHtml = `
      <table>
        <thead>
          <tr>
            <th style="width: 140px;">Date & Time</th>
            <th>Note</th>
            <th style="width: 140px;">Signed by</th>
          </tr>
        </thead>
        <tbody>
          ${
            (cf.nursingNotes || []).length === 0
              ? `
            <tr><td colspan="3" style="text-align: center; color: #64748b;">No nursing notes recorded.</td></tr>
          `
              : (cf.nursingNotes || [])
                  .map(
                    (n) => `
            <tr>
              <td style="color: #64748b;">${n.dateTime}</td>
              <td style="line-height: 1.5;">${n.note}</td>
              <td style="font-style: italic; color: #475569;">${n.sign}</td>
            </tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>
    `;

    const investigationsHtml = `
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.05em;">Pathology</div>
      <table>
        <thead>
          <tr><th style="width: 100px;">Date</th><th style="width: 80px;">Time</th><th>Investigation</th><th>Signed by</th></tr>
        </thead>
        <tbody>
          ${
            (cf.pathology || []).length === 0
              ? '<tr><td colspan="4" style="text-align: center; color: #64748b;">No pathology investigations.</td></tr>'
              : (cf.pathology || [])
                  .map(
                    (p) => `
            <tr><td>${p.date}</td><td>${p.time}</td><td style="font-weight:600;">${p.investigation}</td><td style="font-style:italic;">${p.sign}</td></tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>

      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-top: 16px; margin-bottom: 6px; letter-spacing: 0.05em;">Radiology</div>
      <table>
        <thead>
          <tr><th style="width: 100px;">Date</th><th style="width: 80px;">Time</th><th>Investigation</th><th style="width: 80px;">Portable</th><th style="width: 80px;">RT-ER</th><th style="width: 100px;">Plate No.</th><th>Sign</th></tr>
        </thead>
        <tbody>
          ${
            (cf.radiology || []).length === 0
              ? '<tr><td colspan="7" style="text-align: center; color: #64748b;">No radiology investigations.</td></tr>'
              : (cf.radiology || [])
                  .map(
                    (r) => `
            <tr>
              <td>${r.date}</td>
              <td>${r.time}</td>
              <td style="font-weight:600;">${r.investigation}</td>
              <td>${r.portable ? 'Yes' : 'No'}</td>
              <td>${r.rtEr ? 'Yes' : 'No'}</td>
              <td>${r.plateNo || '—'}</td>
              <td style="font-style:italic;">${r.sign}</td>
            </tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>

      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-top: 16px; margin-bottom: 6px; letter-spacing: 0.05em;">Cardiology</div>
      <table>
        <thead>
          <tr><th style="width: 100px;">Date</th><th style="width: 80px;">Time</th><th>Investigation</th><th>Doctor</th><th>Signed by</th></tr>
        </thead>
        <tbody>
          ${
            (cf.cardiology || []).length === 0
              ? '<tr><td colspan="5" style="text-align: center; color: #64748b;">No cardiology investigations.</td></tr>'
              : (cf.cardiology || [])
                  .map(
                    (c) => `
            <tr><td>${c.date}</td><td>${c.time}</td><td style="font-weight:600;">${c.investigation}</td><td>${c.doctor}</td><td style="font-style:italic;">${c.sign}</td></tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>
    `;

    const proceduresHtml = `
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.05em;">Equipment Used</div>
      <table>
        <thead>
          <tr><th>ON Date/Time</th><th>Equipment Type</th><th>Sign (ON)</th><th>OFF Date/Time</th><th>Sign (OFF)</th></tr>
        </thead>
        <tbody>
          ${
            (cf.equipment || []).length === 0
              ? '<tr><td colspan="5" style="text-align: center; color: #64748b;">No equipment recorded.</td></tr>'
              : (cf.equipment || [])
                  .map(
                    (eq) => `
            <tr>
              <td>${eq.onDate} · ${eq.onTime}</td>
              <td style="font-weight:600;">${eq.type}</td>
              <td style="font-style:italic;">${eq.sign}</td>
              <td>${eq.offDate ? `${eq.offDate} · ${eq.offTime}` : '—'}</td>
              <td style="font-style:italic;">${eq.offSign || '—'}</td>
            </tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>

      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-top: 16px; margin-bottom: 6px; letter-spacing: 0.05em;">Dressing / Minor Procedures</div>
      <table>
        <thead>
          <tr><th style="width: 100px;">Date</th><th style="width: 80px;">Time</th><th>Procedure</th><th>Doctor</th><th>Signed by</th></tr>
        </thead>
        <tbody>
          ${
            (cf.dressing || []).length === 0
              ? '<tr><td colspan="5" style="text-align: center; color: #64748b;">No dressing procedures recorded.</td></tr>'
              : (cf.dressing || [])
                  .map(
                    (d) => `
            <tr><td>${d.date}</td><td>${d.time}</td><td style="font-weight:600;">${d.procedure}</td><td>${d.doctor}</td><td style="font-style:italic;">${d.sign}</td></tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>

      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-top: 16px; margin-bottom: 6px; letter-spacing: 0.05em;">Traction Details</div>
      <table>
        <thead>
          <tr><th>Start Date/Time</th><th>Procedure</th><th>End Date/Time</th><th>Signed by</th></tr>
        </thead>
        <tbody>
          ${
            (cf.traction || []).length === 0
              ? '<tr><td colspan="4" style="text-align: center; color: #64748b;">No traction procedures recorded.</td></tr>'
              : (cf.traction || [])
                  .map(
                    (t) => `
            <tr>
              <td>${t.startDate} · ${t.startTime}</td>
              <td style="font-weight:600;">${t.procedure}</td>
              <td>${t.endDate ? `${t.endDate} · ${t.endTime}` : '—'}</td>
              <td style="font-style:italic;">${t.sign}</td>
            </tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>
    `;

    const visitsHtml = `
      <table>
        <thead>
          <tr>
            <th style="width: 100px;">Date</th>
            <th style="width: 60px; text-align: center;">First</th>
            <th style="width: 60px; text-align: center;">Routine</th>
            <th style="width: 80px; text-align: center;">Day Spcl.</th>
            <th style="width: 80px; text-align: center;">Night Spcl.</th>
            <th>Consultant</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          ${
            (cf.rounds || []).length === 0
              ? `
            <tr><td colspan="7" style="text-align: center; color: #64748b;">No visits/rounds recorded.</td></tr>
          `
              : (cf.rounds || [])
                  .map(
                    (r) => `
            <tr>
              <td>${r.date}</td>
              <td style="text-align: center;">${r.first ? '✓' : '—'}</td>
              <td style="text-align: center;">${r.routine ? '✓' : '—'}</td>
              <td style="text-align: center;">${r.daySpcl ? '✓' : '—'}</td>
              <td style="text-align: center;">${r.nightSpcl ? '✓' : '—'}</td>
              <td style="font-weight: 500;">${r.consultant}</td>
              <td style="font-style: italic; color: #475569;">${r.signature}</td>
            </tr>
          `,
                  )
                  .join('')
          }
        </tbody>
      </table>
    `;

    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Case File Summary - ${adm.patientName} (${adm.ipNo})</title>
        <style>
          @media print {
            body {
              padding: 0;
              margin: 10mm 15mm;
            }
            .page-break {
              page-break-before: always;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.4;
            font-size: 11px;
            margin: 20px;
          }
          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
          }
          .hospital-name {
            font-size: 14px;
            font-weight: 600;
            color: #0891b2;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 15px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
          }
          .meta-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 2px;
          }
          .meta-value {
            font-size: 11px;
            font-weight: 500;
            color: #0f172a;
          }
          .section-container {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
            margin-top: 15px;
            margin-bottom: 8px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            padding: 8px 10px;
            background: #fff;
            margin-bottom: 6px;
          }
          .card-title {
            font-size: 9px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .card-content {
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          th {
            background: #f1f5f9;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10.5px;
          }
          .badge {
            display: inline-block;
            font-size: 9px;
            font-weight: 600;
            padding: 1px 5px;
            border-radius: 3px;
            text-transform: uppercase;
          }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          .badge-info { background: #e0f2fe; color: #0369a1; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="hospital-name">mediVault Medical Center</div>
            <h1>IPD Admission Case File</h1>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><span class="meta-label">Patient Name</span><span class="meta-value">${adm.patientName}</span></div>
          <div class="meta-item"><span class="meta-label">IP Number</span><span class="meta-value" style="color: #0891b2; font-weight:600;">${adm.ipNo}</span></div>
          <div class="meta-item"><span class="meta-label">MR Number</span><span class="meta-value">${adm.mrNo}</span></div>
          <div class="meta-item"><span class="meta-label">Ward / Bed</span><span class="meta-value">${adm.ward} · Bed ${adm.bedNo}</span></div>
          <div class="meta-item"><span class="meta-label">Admitting Dr.</span><span class="meta-value">${adm.admittingDoctor}</span></div>
          <div class="meta-item"><span class="meta-label">Date Admitted</span><span class="meta-value">${fmtDate(adm.admittedOn)} · ${adm.admittedTime}</span></div>
          <div class="meta-item"><span class="meta-label">Date Discharged</span><span class="meta-value">${adm.dischargedOn ? fmtDate(adm.dischargedOn) : 'Active Admission'}</span></div>
          <div class="meta-item"><span class="meta-label">Age / Sex / Blood</span><span class="meta-value">${adm.age} yrs / ${adm.sex} / ${adm.blood}</span></div>
        </div>

        ${renderSection('General Consent & Intake', consentHtml)}
        ${renderSection('Allergies & Past History', pastHistoryHtml)}
        ${renderSection('Triage & Vitals', triageHtml)}
        ${renderSection('Clinical History & Exam', hxExamHtml)}
        
        <div class="page-break"></div>
        
        ${renderSection('Care Plan & Management Goals', carePlanHtml)}
        ${renderSection('Medications Reconciliation', medsHtml)}
        ${renderSection('Treatment Chart', treatmentHtml)}
        
        <div class="page-break"></div>
        
        ${renderSection('Clinical Progress Notes', clinicalHtml)}
        ${renderSection('Nursing Notes', nursingHtml)}
        ${renderSection('Diagnostic Investigations', investigationsHtml)}
        ${renderSection('Procedures & Equipment Log', proceduresHtml)}
        ${renderSection('Record of Visits / Rounds', visitsHtml)}

      </body>
      </html>
    `);
    pri.document.close();
    setTimeout(() => {
      pri.focus();
      pri.print();
    }, 100);
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

        {/* Action buttons — max 2 per row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            gap: 8,
            flexShrink: 0,
            alignItems: 'start',
          }}
        >
          {canEditIpdTab('clinical') && (
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
          )}
          {canAccess('patients') && (
            <button
              onClick={() => navigate(`/patients/${adm.mrNo}`)}
              style={{
                background: '#f1f5f9',
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
          )}
          <button
            onClick={printAdmission}
            style={{
              background: '#16a34a40',
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
          {canToggleAdmissionStatus && (
            <button
              onClick={async () => {
                const now = new Date().toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });
                if (isAdmitted) {
                  if (adm.mrNo) {
                    const unpaid = await getPatientPendingBills(adm.mrNo);
                    if (unpaid.length > 0) {
                      setPendingBills(unpaid);
                      return;
                    }
                  }
                  if (!window.confirm('Are you sure you want to discharge this patient?')) return;
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
          )}
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
          {visibleNavSections.map((section, si) => (
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
                const isActive = currentTab === item.id;
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
        <div key={currentTab} style={{ animation: 'mv-fade 150ms ease both' }}>
          {/* ─── OVERVIEW ─── */}
          {currentTab === 'overview' && (
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
                  {visibleProgress.map((fp) => {
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
          {currentTab === 'consent' && (
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
                      onClick={() => openEntryModal('consent')}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      <Plus size={13} /> Sign Consent
                    </button>
                  )}
                  {adm.consent && (
                    <button
                      onClick={() => openEntryModal('consent')}
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
          {currentTab === 'past-history' && (
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
                  onClick={() => openEntryModal('past-history')}
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
          {currentTab === 'triage' && (
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
                  onClick={() => openEntryModal('triage')}
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
          {currentTab === 'history' && (
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
                  onClick={() => openEntryModal('history')}
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
          {currentTab === 'care-plan' && (
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
                    onClick={() => openEntryModal('care-plan')}
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
          {currentTab === 'medications' && (
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
                  onClick={() => openEntryModal('medications')}
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
                (cf.medications || []).map((m, idx) => (
                  <div
                    key={m.sr || idx}
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
                      <button
                        style={iconBtnSm}
                        onClick={() => handleOpenEditEntry('medications', idx)}
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        style={{
                          ...iconBtnSm,
                          border: '1px solid rgba(217,80,80,0.3)',
                          color: '#d95050',
                        }}
                        onClick={() => handleDeleteCasefileItem('medications', idx)}
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
          {currentTab === 'treatment' && (
            <TreatmentChart
              adm={adm}
              id={id}
              setAdm={setAdm}
              canEdit={canEditIpdTab('treatment')}
            />
          )}

          {/* ─── CLINICAL NOTES ─── */}
          {currentTab === 'clinical' && (
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
                  onClick={() => openEntryModal('clinical')}
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
                (cf.clinicalNotes || []).map((n, idx) => {
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
                      key={n.id || idx}
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
                        <button
                          style={iconBtnSm}
                          title="Print"
                          onClick={() => {
                            const pri = (() => {
                              let f = document.getElementById('print-iframe');
                              if (!f) {
                                f = document.createElement('iframe');
                                f.id = 'print-iframe';
                                f.style.cssText =
                                  'position:absolute;width:0;height:0;border:0;top:-1000px;left:-1000px;';
                                document.body.appendChild(f);
                              }
                              return f.contentWindow || f.contentDocument;
                            })();
                            pri.document.open();
                            pri.document.write(
                              `<!DOCTYPE html><html><head><title>Clinical Note</title><style>body{font-family:sans-serif;padding:32px;color:#0f172a;}</style></head><body><h2>Clinical Note — ${adm.patientName}</h2><p><strong>Date:</strong> ${n.date} ${n.time}</p><p><strong>Doctor:</strong> ${n.doctor}</p><p style="margin-top:16px;border-left:3px solid #0891b2;padding-left:12px;">${n.note}</p></body></html>`,
                            );
                            pri.document.close();
                            setTimeout(() => {
                              pri.focus();
                              pri.print();
                            }, 100);
                          }}
                        >
                          <Printer size={11} />
                        </button>
                        <button
                          style={iconBtnSm}
                          title="Edit"
                          onClick={() => handleOpenEditEntry('clinical', idx)}
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          style={{
                            ...iconBtnSm,
                            border: '1px solid rgba(217,80,80,0.3)',
                            color: '#d95050',
                          }}
                          title="Delete"
                          onClick={() => handleDeleteCasefileItem('clinicalNotes', idx)}
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
          {currentTab === 'nursing' && (
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
                  onClick={() => openEntryModal('nursing')}
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
                (cf.nursingNotes || []).map((n, idx) => (
                  <div
                    key={n.id || idx}
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
                      <button style={iconBtnSm} onClick={() => handleOpenEditEntry('nursing', idx)}>
                        <Pencil size={11} />
                      </button>
                      <button
                        style={{
                          ...iconBtnSm,
                          border: '1px solid rgba(217,80,80,0.3)',
                          color: '#d95050',
                        }}
                        onClick={() => handleDeleteCasefileItem('nursingNotes', idx)}
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
          {currentTab === 'investigations' && (
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
                    onClick={() => openEntryModal(invSubTab)}
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
                            <button
                              style={iconBtnSm}
                              onClick={() => handleOpenEditEntry('pathology', i)}
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              style={{
                                ...iconBtnSm,
                                border: '1px solid rgba(217,80,80,0.3)',
                                color: '#d95050',
                              }}
                              onClick={() => handleDeleteCasefileItem('pathology', i)}
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
                            <button
                              style={iconBtnSm}
                              onClick={() => handleOpenEditEntry('radiology', i)}
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              style={{
                                ...iconBtnSm,
                                border: '1px solid rgba(217,80,80,0.3)',
                                color: '#d95050',
                              }}
                              onClick={() => handleDeleteCasefileItem('radiology', i)}
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
                            <button
                              style={iconBtnSm}
                              onClick={() => handleOpenEditEntry('cardiology', i)}
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              style={{
                                ...iconBtnSm,
                                border: '1px solid rgba(217,80,80,0.3)',
                                color: '#d95050',
                              }}
                              onClick={() => handleDeleteCasefileItem('cardiology', i)}
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
          {currentTab === 'procedures' && (
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
                  onClick={() => openEntryModal(procSubTab)}
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
                          {eq.sign?.startsWith('data:image/') ? (
                            <img src={eq.sign} alt="signature" style={{ height: 28, maxWidth: 90, objectFit: 'contain' }} />
                          ) : (eq.sign || '—')}
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
                          {eq.offSign?.startsWith('data:image/') ? (
                            <img src={eq.offSign} alt="signature" style={{ height: 28, maxWidth: 90, objectFit: 'contain' }} />
                          ) : (eq.offSign || '—')}
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            style={iconBtnSm}
                            onClick={() => handleOpenEditEntry('equipment', i)}
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            style={{
                              ...iconBtnSm,
                              border: '1px solid rgba(217,80,80,0.3)',
                              color: '#d95050',
                            }}
                            onClick={() => handleDeleteCasefileItem('equipment', i)}
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
                          <button
                            style={iconBtnSm}
                            onClick={() => handleOpenEditEntry('dressing', i)}
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            style={{
                              ...iconBtnSm,
                              border: '1px solid rgba(217,80,80,0.3)',
                              color: '#d95050',
                            }}
                            onClick={() => handleDeleteCasefileItem('dressing', i)}
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
                          <button
                            style={iconBtnSm}
                            onClick={() => handleOpenEditEntry('traction', i)}
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            style={{
                              ...iconBtnSm,
                              border: '1px solid rgba(217,80,80,0.3)',
                              color: '#d95050',
                            }}
                            onClick={() => handleDeleteCasefileItem('traction', i)}
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
          {currentTab === 'visits' && (
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
                  onClick={() => openEntryModal('rounds')}
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
                      <button style={iconBtnSm} onClick={() => handleOpenEditEntry('rounds', i)}>
                        <Pencil size={11} />
                      </button>
                      <button
                        style={{
                          ...iconBtnSm,
                          border: '1px solid rgba(217,80,80,0.3)',
                          color: '#d95050',
                        }}
                        onClick={() => handleDeleteCasefileItem('rounds', i)}
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
      {showDS && canEditIpdTab('clinical') && (
        <DischargeSummaryOverlay
          adm={adm}
          onClose={() => setShowDS(false)}
          onPrint={() => {
            setShowDS(false);
            printAdmission();
          }}
        />
      )}

      {/* Pending bills blocking modal — prevents discharge */}
      {pendingBills &&
        createPortal(
          <div className="modal-backdrop" style={{ zIndex: 9999 }}>
            <div
              className="modal-panel"
              style={{ maxWidth: 520, background: 'var(--surface)', padding: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--border-card)',
                  background: '#fef2f2',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertOctagon size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#991b1b' }}>
                    Discharge Blocked — Pending Bills
                  </div>
                  <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>
                    Clear all outstanding bills before discharging this patient.
                  </div>
                </div>
              </div>

              {/* Bill list */}
              <div
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
              >
                {pendingBills.map((b) => {
                  const balance = (b.amount || 0) - (b.paid || 0);
                  const isPartial = b.status === 'Partial';
                  return (
                    <div
                      key={b.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        border: '1px solid var(--border-card)',
                        borderRadius: 8,
                        background: 'var(--bg-canvas)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg-on-light)' }}>
                          {b.id}
                        </div>
                        <div
                          style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 2 }}
                        >
                          {b.type} · {b.date}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
                          ₹{balance.toLocaleString('en-IN')} due
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            marginTop: 2,
                            padding: '1px 8px',
                            borderRadius: 10,
                            display: 'inline-block',
                            background: isPartial ? 'rgba(234,179,8,0.12)' : 'rgba(220,38,38,0.10)',
                            color: isPartial ? '#854d0e' : '#991b1b',
                            fontWeight: 600,
                          }}
                        >
                          {b.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '14px 24px',
                  borderTop: '1px solid var(--border-card)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  background: 'var(--surface-subtle)',
                  borderRadius: '0 0 12px 12px',
                }}
              >
                <button onClick={() => setPendingBills(null)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setPendingBills(null);
                    navigate('/billing');
                  }}
                  style={{
                    background: '#0891b2',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Go to Billing
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {entryModal && canEditIpdTab(entryTypeToTab[entryModal] || currentTab) && (
        <CaseFileEntryModal
          key={
            editEntryInfo
              ? `edit-${editEntryInfo.type}-${editEntryInfo.index}`
              : `add-${entryModal}`
          }
          type={entryModal}
          adm={adm}
          editInfo={editEntryInfo}
          onClose={() => {
            setEntryModal(null);
            setEditEntryInfo(null);
          }}
          onSave={handleSaveEntry}
        />
      )}
    </div>
  );
}

// ── TREATMENT CHART ──────────────────────────────────────────────────────────

function TreatmentChart({ adm, id, setAdm, canEdit }) {
  const cf = adm.casefile || {};

  const [view, setView] = useState('grid');
  const [cellEdit, setCellEdit] = useState(null);
  const [signInput, setSignInput] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const EMPTY_FORM = { drug: '', dose: '', route: '', freq: 'OD', doctor: '', date: TODAY };
  const [form, setForm] = useState(EMPTY_FORM);

  const txList = cf.treatmentList || [];
  const txGrid = cf.treatmentGrid || {};

  const admDates = (() => {
    const start = new Date(adm.admittedOn);
    const end = new Date(adm.dischargedOn || TODAY);
    const dates = [];
    const cur = new Date(start);
    while (cur <= end) {
      dates.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  })();

  // Build a stable per-drug key for txGrid storage; also track array index (dIdx)
  // for the isEditing check — drug.id may be undefined on legacy data, causing
  // all drugs to share the same undefined key and all appear selected at once.
  const gridRows = [];
  txList.forEach((drug, dIdx) => {
    const txKey = drug.id || `drug-${dIdx}`;
    const times = FREQ_TIMES[drug.freq] || [drug.freq || '—'];
    times.forEach((time, tIdx) => {
      gridRows.push({ drug, dIdx, txKey, time, tIdx, isFirst: tIdx === 0 });
    });
  });

  const persist = async (newList, newGrid) => {
    const updatedAdm = {
      ...adm,
      casefile: { ...cf, treatmentList: newList, treatmentGrid: newGrid },
      treatment: newList.length,
    };
    await updateAdmission(id, updatedAdm);
    setAdm(updatedAdm);
  };

  // cellEdit: { dIdx, txKey, date, time }
  // dIdx  = array index — always unique, used only for isEditing comparison
  // txKey = drug.id || `drug-${dIdx}` — used for txGrid data storage
  const toggleCell = async (dIdx, txKey, date, time) => {
    const cell = txGrid[txKey]?.[date]?.[time];
    if (cell?.given) {
      const newGrid = {
        ...txGrid,
        [txKey]: {
          ...(txGrid[txKey] || {}),
          [date]: { ...(txGrid[txKey]?.[date] || {}), [time]: { given: false, sign: '' } },
        },
      };
      await persist(txList, newGrid);
    } else if (cellEdit?.dIdx === dIdx && cellEdit?.date === date && cellEdit?.time === time) {
      // Same cell clicked again — deselect
      setCellEdit(null);
      setSignInput('');
    } else {
      setCellEdit({ dIdx, txKey, date, time });
      setSignInput('');
    }
  };

  const confirmCell = async () => {
    if (!cellEdit) return;
    const { txKey, date, time } = cellEdit;
    const newGrid = {
      ...txGrid,
      [txKey]: {
        ...(txGrid[txKey] || {}),
        [date]: { ...(txGrid[txKey]?.[date] || {}), [time]: { given: true, sign: signInput } },
      },
    };
    setSaving(true);
    await persist(txList, newGrid);
    setSaving(false);
    setCellEdit(null);
    setSignInput('');
  };

  const saveDrug = async () => {
    if (!form.drug.trim()) return;
    setSaving(true);
    let newList;
    if (editId) {
      newList = txList.map((t) => (t.id === editId ? { ...t, ...form } : t));
    } else {
      newList = [...txList, { ...form, id: `tx-${Date.now()}` }];
    }
    await persist(newList, txGrid);
    setSaving(false);
    setAddOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const deleteDrug = async (drugId) => {
    const newList = txList.filter((t) => t.id !== drugId);
    const newGrid = { ...txGrid };
    delete newGrid[drugId];
    await persist(newList, newGrid);
  };

  const fmtCol = (iso) => {
    const [, m, d] = iso.split('-');
    return `${+d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1]}`;
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid rgba(15,23,42,0.15)',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: C.muted,
    display: 'block',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text }}>Treatment Chart</h2>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Click a cell to mark administered + sign</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[{ v: 'grid', label: 'Grid' }, { v: 'list', label: 'List' }].map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: `1px solid ${view === v ? C.primary : C.border}`,
                background: view === v ? 'rgba(8,145,178,0.1)' : 'transparent',
                color: view === v ? C.primary : C.muted,
                fontSize: 12,
                fontWeight: view === v ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
          {canEdit && (
            <button
              onClick={() => { setForm(EMPTY_FORM); setEditId(null); setAddOpen(true); }}
              className="btn-primary"
              style={{ fontSize: 12 }}
            >
              <Plus size={13} /> Add drug
            </button>
          )}
        </div>
      </div>

      {/* ── GRID VIEW ── */}
      {view === 'grid' && (
        <>
          {txList.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'rgba(8,145,178,0.06)', borderBottom: '1px solid rgba(8,145,178,0.15)', fontSize: 12.5, color: C.text }}>
              <Info size={14} color="#0891b2" style={{ flexShrink: 0 }} />
              <span><strong>How to use:</strong> Click any ○ pending cell to mark administered &amp; add nurse initials. Click a ✓ green cell to unmark it.</span>
            </div>
          )}
          {txList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted }}>
              <Syringe size={28} style={{ opacity: 0.4, display: 'block', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13 }}>No drugs added. Click &ldquo;Add drug&rdquo; to start the administration grid.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Grid header */}
              <div style={{ display: 'flex', minWidth: 'max-content', background: C.subtleBg, borderBottom: '2px solid rgba(15,23,42,0.10)' }}>
                <div style={{ width: 220, flexShrink: 0, padding: '10px 14px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, borderRight: '1px solid rgba(15,23,42,0.08)' }}>Drug · Dose · Route</div>
                <div style={{ width: 60, flexShrink: 0, padding: '10px 8px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, borderRight: '1px solid rgba(15,23,42,0.08)' }}>Freq</div>
                <div style={{ width: 72, flexShrink: 0, padding: '10px 8px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, borderRight: '2px solid rgba(15,23,42,0.12)', fontFamily: 'monospace' }}>Time</div>
                {admDates.map((date, di) => (
                  <div key={date} style={{ width: 86, flexShrink: 0, padding: '8px 4px', fontSize: 11, textAlign: 'center', color: C.muted, fontWeight: 600, borderRight: '1px solid rgba(15,23,42,0.06)' }}>
                    <div>{fmtCol(date)}</div>
                    <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.65 }}>Day {di + 1}</div>
                  </div>
                ))}
              </div>
              {/* Grid rows */}
              {gridRows.map(({ drug, dIdx, txKey, time, tIdx, isFirst }) => (
                <div key={`${dIdx}-${time}`} style={{ display: 'flex', minWidth: 'max-content', borderTop: tIdx === 0 ? '2px solid rgba(15,23,42,0.07)' : '1px solid rgba(15,23,42,0.04)' }}>
                  <div style={{ width: 220, flexShrink: 0, padding: '8px 14px', borderRight: '1px solid rgba(15,23,42,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 40 }}>
                    {isFirst && (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{drug.drug}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{drug.dose} · {drug.route}</div>
                      </>
                    )}
                  </div>
                  <div style={{ width: 60, flexShrink: 0, padding: '8px 6px', fontSize: 11, color: C.muted, borderRight: '1px solid rgba(15,23,42,0.06)', display: 'flex', alignItems: 'center' }}>
                    {isFirst ? drug.freq : ''}
                  </div>
                  <div style={{ width: 72, flexShrink: 0, padding: '8px 6px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: C.text, borderRight: '2px solid rgba(15,23,42,0.12)', display: 'flex', alignItems: 'center' }}>
                    {time}
                  </div>
                  {admDates.map((date) => {
                    const cell = txGrid[txKey]?.[date]?.[time];
                    const beforeRx = drug.date && date < drug.date;
                    const isEditing = cellEdit?.dIdx === dIdx && cellEdit?.date === date && cellEdit?.time === time;
                    if (beforeRx) {
                      return (
                        <div key={date} style={{ width: 86, flexShrink: 0, borderRight: '1px solid rgba(15,23,42,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 14, color: '#e2e8f0' }}>—</span>
                        </div>
                      );
                    }
                    if (cell?.given) {
                      return (
                        <div key={date} onClick={() => toggleCell(dIdx, txKey, date, time)}
                          style={{ width: 86, flexShrink: 0, padding: '6px 4px', background: 'rgba(22,163,74,0.08)', borderRight: '1px solid rgba(15,23,42,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <span style={{ fontSize: 16, color: '#16a34a', fontWeight: 500 }}>✓</span>
                          {cell.sign && <div style={{ fontSize: 9, color: C.muted, maxWidth: 78, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell.sign}</div>}
                        </div>
                      );
                    }
                    return (
                      <div key={date} onClick={() => toggleCell(dIdx, txKey, date, time)}
                        style={{ width: 86, flexShrink: 0, padding: '6px 4px', background: isEditing ? 'rgba(8,145,178,0.10)' : 'transparent', borderRight: '1px solid rgba(15,23,42,0.04)', boxShadow: isEditing ? 'inset 0 0 0 2px rgba(8,145,178,0.5)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms', position: 'relative', zIndex: isEditing ? 1 : 0 }}>
                        <span style={{ fontSize: 16, color: isEditing ? '#0891b2' : '#cbd5e1', fontWeight: isEditing ? 700 : 400 }}>○</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Sign bar */}
              {cellEdit && (
                <div style={{ padding: '12px 16px', borderTop: '2px solid #0891b2', background: 'rgba(8,145,178,0.05)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap' }}>Mark administered</span>
                  <input
                    type="text"
                    value={signInput}
                    onChange={(e) => setSignInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmCell()}
                    placeholder="Nurse / staff initials (e.g. RN Hema)"
                    autoFocus
                    style={{ flex: 1, minWidth: 180, padding: '8px 11px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={confirmCell} disabled={saving}
                    style={{ background: '#0891b2', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {saving ? 'Saving…' : 'Confirm'}
                  </button>
                  <button onClick={() => { setCellEdit(null); setSignInput(''); }}
                    style={{ background: 'transparent', border: '1px solid rgba(15,23,42,0.12)', color: C.text, padding: '8px 14px', borderRadius: 6, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
              {/* Legend */}
              <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(15,23,42,0.06)', background: C.subtleBg, display: 'flex', gap: 18, fontSize: 11, color: C.muted, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#16a34a', fontSize: 14, fontWeight: 500 }}>✓</span> Administered · click to unmark</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#cbd5e1', fontSize: 14 }}>○</span> Pending · click to mark + sign</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#e2e8f0', fontSize: 14 }}>—</span> Before prescription date</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        txList.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: C.muted }}>
            <Syringe size={28} style={{ opacity: 0.4, display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 13 }}>No treatment chart entries yet.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 700, background: 'white' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px 1.6fr 1fr 0.8fr 1fr 1.4fr 110px 80px', padding: '11px 16px', background: C.subtleBg, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>
                <div>Sr.</div><div>Drug</div><div>Dose</div><div>Route</div><div>Freq.</div><div>Times</div><div>Doctor</div><div />
              </div>
              {txList.map((tx, i) => {
                const times = FREQ_TIMES[tx.freq] || [tx.freq || '—'];
                return (
                  <div key={tx.id || i} style={{ display: 'grid', gridTemplateColumns: '50px 1.6fr 1fr 0.8fr 1fr 1.4fr 110px 80px', padding: '11px 16px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: 13 }}>
                    <div style={{ color: C.muted, fontWeight: 600 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 500, color: C.text }}>{tx.drug}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{fmtDate(tx.date)}</div>
                    </div>
                    <div>{tx.dose}</div>
                    <div>{tx.route}</div>
                    <div>{tx.freq}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted }}>{times.join(', ')}</div>
                    <div style={{ fontSize: 12 }}>{tx.doctor}</div>
                    {canEdit ? (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => { setForm({ drug: tx.drug, dose: tx.dose, route: tx.route, freq: tx.freq, doctor: tx.doctor, date: tx.date || TODAY }); setEditId(tx.id); setAddOpen(true); }}
                          style={{ background: 'transparent', border: '1px solid rgba(15,23,42,0.10)', width: 28, height: 28, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.text }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteDrug(tx.id)}
                          style={{ background: 'transparent', border: '1px solid rgba(217,80,80,0.30)', color: '#d95050', width: 28, height: 28, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : <div />}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* ── ADD / EDIT DRUG MODAL ── */}
      {addOpen && canEdit && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)' }} onClick={() => setAddOpen(false)} />
          <div style={{ position: 'relative', background: 'white', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: C.text }}>{editId ? 'Edit Drug' : 'Add Drug'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Drug name *', key: 'drug', placeholder: 'e.g. Metformin' },
                { label: 'Dose', key: 'dose', placeholder: 'e.g. 500 mg' },
                { label: 'Route', key: 'route', placeholder: 'e.g. Oral, IV, IM' },
                { label: 'Doctor', key: 'doctor', placeholder: 'Prescribing doctor' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Frequency</label>
                  <select
                    value={form.freq}
                    onChange={(e) => setForm((prev) => ({ ...prev, freq: e.target.value }))}
                    style={{ ...inputStyle, background: 'white' }}
                  >
                    {Object.keys(FREQ_TIMES).map((f) => (
                      <option key={f} value={f}>{f} — {FREQ_TIMES[f].join(', ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => { setAddOpen(false); setEditId(null); setForm(EMPTY_FORM); }}
                style={{ padding: '9px 20px', border: '1px solid rgba(15,23,42,0.12)', borderRadius: 8, background: 'transparent', color: C.text, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={saveDrug}
                disabled={saving || !form.drug.trim()}
                className="btn-primary"
                style={{ fontSize: 13, opacity: saving || !form.drug.trim() ? 0.6 : 1 }}
              >
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Drug'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ── SIGNATURE FIELD (type or draw) ────────────────────────────────────────────

function SignatureField({ value, onChange, label = 'Sign', required = false }) {
  const isDataUrl = (v) => typeof v === 'string' && v.startsWith('data:image/');
  const [mode, setMode] = useState(() => (isDataUrl(value) ? 'draw' : 'type'));
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);

  // Initialise canvas background + replay saved drawing on mount / mode switch
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (isDataUrl(value)) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    if (mode === 'draw') initCanvas();
  }, [mode, initCanvas]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPos.current = null;
    onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  const switchMode = (m) => {
    setMode(m);
    if (m === 'type' && isDataUrl(value)) onChange('');
    if (m === 'draw' && !isDataUrl(value)) onChange('');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-on-light-muted)' }}>
          {label}{required && ' *'}
        </span>
        <div style={{ display: 'flex', background: 'var(--surface-subtle)', borderRadius: 6, padding: 2, gap: 2, border: '1px solid var(--border-card)' }}>
          {['type', 'draw'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                padding: '3px 10px',
                borderRadius: 4,
                border: 'none',
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--fg-on-light)' : 'var(--fg-on-light-muted)',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
              }}
            >
              {m === 'type' ? 'Type' : 'Draw'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'type' ? (
        <input
          style={{
            width: '100%', padding: '10px 12px',
            border: '1px solid var(--border-strong)', borderRadius: 6,
            fontFamily: 'inherit', fontSize: 14, outline: 'none',
            background: 'var(--bg-canvas)', color: 'var(--fg-on-light)', boxSizing: 'border-box',
          }}
          required={required}
          value={isDataUrl(value) ? '' : value}
          placeholder="e.g. Dr. Priya Mehta"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={440}
            height={90}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            style={{
              width: '100%', height: 90,
              border: '1px solid var(--border-strong)', borderRadius: 6,
              cursor: 'crosshair', display: 'block', touchAction: 'none',
              background: '#fff',
            }}
          />
          <button
            type="button"
            onClick={clearCanvas}
            style={{
              position: 'absolute', top: 6, right: 8,
              background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-ui)',
              borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', color: 'var(--fg-on-light-muted)', fontFamily: 'inherit',
            }}
          >
            Clear
          </button>
          {(!value || !isDataUrl(value)) && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', color: '#cbd5e1', fontSize: 13 }}>
              Sign here
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ENTRY MODAL FOR CASE FILE SECTIONS ────────────────────────────────────────

function CaseFileEntryModal({ type, adm, onClose, onSave, editInfo }) {
  const isEdit = Boolean(editInfo);
  const cf = adm.casefile || {};
  const [fields, setFields] = useState(() => {
    // In edit mode, pre-populate from existing item for list types
    if (isEdit && editInfo.item) {
      const item = editInfo.item;
      if (type === 'medications')
        return {
          drug: item.drug || '',
          dose: item.dose || '',
          route: item.route || 'Oral',
          frequency: item.frequency || 'BD',
          qty: String(item.qty ?? 10),
        };
      if (type === 'clinical') return { note: item.note || '', doctor: item.doctor || '' };
      if (type === 'nursing') return { note: item.note || '', sign: item.sign || 'Nurse on duty' };
      if (type === 'pathology')
        return { investigation: item.investigation || '', sign: item.sign || '' };
      if (type === 'radiology')
        return {
          investigation: item.investigation || '',
          portable: item.portable ?? false,
          rtEr: item.rtEr ?? false,
          plateNo: item.plateNo || '',
          sign: item.sign || '',
        };
      if (type === 'cardiology')
        return {
          investigation: item.investigation || '',
          doctor: item.doctor || '',
          sign: item.sign || '',
        };
      if (type === 'equipment')
        return {
          type: item.type || '',
          onDate: TODAY,
          onTime: item.onTime || '',
          sign: item.sign || '',
          offDate: '',
          offTime: item.offTime || '',
          offSign: item.offSign || '',
        };
      if (type === 'dressing')
        return {
          procedure: item.procedure || '',
          doctor: item.doctor || '',
          sign: item.sign || '',
        };
      if (type === 'traction')
        return {
          procedure: item.procedure || '',
          startDate: TODAY,
          startTime: item.startTime || '',
          endDate: '',
          endTime: item.endTime || '',
          sign: item.sign || '',
        };
      if (type === 'rounds')
        return {
          date: TODAY,
          first: item.first ?? false,
          routine: item.routine ?? true,
          daySpcl: item.daySpcl ?? false,
          nightSpcl: item.nightSpcl ?? false,
          consultant: item.consultant || '',
          signature: item.signature || '',
        };
    }
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
          sr: isEdit ? (editInfo.item.sr ?? editInfo.index + 1) : list.length + 1,
          drug: fields.drug,
          dose: fields.dose,
          route: fields.route,
          frequency: fields.frequency,
          qty: parseInt(fields.qty) || 0,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { medications: updated };
      } else if (type === 'clinical') {
        const list = cf.clinicalNotes || [];
        const newItem = {
          id: isEdit ? editInfo.item.id || 'CN-' + Date.now() : 'CN-' + Date.now(),
          date: isEdit ? editInfo.item.date || TODAY : TODAY,
          time: isEdit
            ? editInfo.item.time || ''
            : new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
          note: fields.note,
          doctor: fields.doctor,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { clinicalNotes: updated };
      } else if (type === 'nursing') {
        const list = cf.nursingNotes || [];
        const newItem = {
          id: isEdit ? editInfo.item.id || 'NN-' + Date.now() : 'NN-' + Date.now(),
          dateTime: isEdit
            ? editInfo.item.dateTime
            : fmtDate(TODAY) +
              ' ' +
              new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
          note: fields.note,
          sign: fields.sign,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { nursingNotes: updated };
      } else if (type === 'pathology') {
        const list = cf.pathology || [];
        const newItem = {
          date: isEdit ? editInfo.item.date : fmtDate(TODAY),
          time: isEdit
            ? editInfo.item.time
            : new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
          investigation: fields.investigation,
          sign: fields.sign,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { pathology: updated };
      } else if (type === 'radiology') {
        const list = cf.radiology || [];
        const newItem = {
          date: isEdit ? editInfo.item.date : fmtDate(TODAY),
          time: isEdit
            ? editInfo.item.time
            : new Date().toLocaleTimeString('en-IN', {
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
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { radiology: updated };
      } else if (type === 'cardiology') {
        const list = cf.cardiology || [];
        const newItem = {
          date: isEdit ? editInfo.item.date : fmtDate(TODAY),
          time: isEdit
            ? editInfo.item.time
            : new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
          investigation: fields.investigation,
          doctor: fields.doctor,
          sign: fields.sign,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { cardiology: updated };
      } else if (type === 'equipment') {
        const list = cf.equipment || [];
        const newItem = {
          type: fields.type,
          onDate: isEdit ? editInfo.item.onDate : fmtDate(fields.onDate),
          onTime: fields.onTime,
          sign: fields.sign,
          offDate: fields.offDate ? fmtDate(fields.offDate) : '',
          offTime: fields.offTime,
          offSign: fields.offSign,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { equipment: updated };
      } else if (type === 'dressing') {
        const list = cf.dressing || [];
        const newItem = {
          date: isEdit ? editInfo.item.date : fmtDate(TODAY),
          time: isEdit
            ? editInfo.item.time
            : new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }),
          procedure: fields.procedure,
          doctor: fields.doctor,
          sign: fields.sign,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { dressing: updated };
      } else if (type === 'traction') {
        const list = cf.traction || [];
        const newItem = {
          procedure: fields.procedure,
          startDate: isEdit ? editInfo.item.startDate : fmtDate(fields.startDate),
          startTime: fields.startTime,
          endDate: fields.endDate ? fmtDate(fields.endDate) : '',
          endTime: fields.endTime,
          sign: fields.sign,
        };
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { traction: updated };
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
        const updated = isEdit
          ? list.map((x, i) => (i === editInfo.index ? newItem : x))
          : [...list, newItem];
        updates.casefile = { rounds: updated };
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
                  <span style={lbl}>Date</span>
                  <input
                    style={inp}
                    type="date"
                    required
                    value={fields.onDate}
                    onChange={(e) => setVal('onDate', e.target.value)}
                  />
                </label>
                <label>
                  <span style={lbl}>Time</span>
                  <input
                    style={inp}
                    required
                    value={fields.onTime}
                    onChange={(e) => setVal('onTime', e.target.value)}
                  />
                </label>
              </div>
              <SignatureField
                label="Sign"
                required
                value={fields.sign}
                onChange={(v) => setVal('sign', v)}
              />
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
                  DISCHARGE / DETAILS (OPTIONAL)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <label>
                    <span style={lbl}>Date</span>
                    <input
                      style={inp}
                      type="date"
                      value={fields.offDate}
                      onChange={(e) => setVal('offDate', e.target.value)}
                    />
                  </label>
                  <label>
                    <span style={lbl}>Time</span>
                    <input
                      style={inp}
                      value={fields.offTime}
                      onChange={(e) => setVal('offTime', e.target.value)}
                    />
                  </label>
                </div>
                <div style={{ marginTop: 8 }}>
                  <SignatureField
                    label="Sign"
                    value={fields.offSign}
                    onChange={(v) => setVal('offSign', v)}
                  />
                </div>
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
            <Check size={15} /> {saving ? 'Saving...' : isEdit ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
