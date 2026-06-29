import { UserPlus, BedDouble, Stethoscope, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRBAC } from '../../../context/useRBAC';

const STEPS = [
  {
    id: 1,
    label: 'Register',
    desc: 'New patient registration\n& medical history',
    icon: UserPlus,
    path: '/patients',
  },
  {
    id: 2,
    label: 'OPD Visit',
    desc: 'Consultation, labs & prescription',
    icon: UserPlus,
    path: '/patients',
  },
  {
    id: 3,
    label: 'Admit to IPD',
    desc: 'In-patient admission\n& 13 digital forms',
    icon: BedDouble,
    path: '/admissions',
  },
  {
    id: 4,
    label: 'Care & Records',
    desc: 'Treatment, nursing & notes',
    icon: Stethoscope,
    path: '/admissions',
  },
  {
    id: 5,
    label: 'Discharge & Bill',
    desc: 'Summary & payment settled',
    icon: FileText,
    path: '/billing',
  },
];

export default function PatientJourney() {
  const navigate = useNavigate();
  const { canRegisterPatient, canAccess } = useRBAC();
  const visibleSteps = STEPS.filter((step) => {
    if (step.id === 1) return canRegisterPatient;
    if (step.path === '/admissions') return canAccess('admissions');
    if (step.path === '/billing') return canAccess('billing');
    if (step.path === '/patients') return canAccess('patients');
    return true;
  });
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-card)',
        borderRadius: 14,
        padding: '20px 24px',
        animation: 'mv-fade 200ms ease both',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--fg-on-light-muted)',
          marginBottom: 14,
        }}
      >
        Patient journey — how the system works
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {visibleSteps.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === visibleSteps.length - 1;
          return (
            <div key={step.id} style={{ display: 'contents' }}>
              <div
                onClick={() => {
                  if (step.id === 1) {
                    navigate('/patients', { state: { openRegister: true } });
                  } else {
                    navigate(step.path);
                  }
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px 10px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 120ms',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(8,145,178,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: '#0891b2',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {step.id}
                </div>
                <Icon size={20} color="#0891b2" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)' }}>
                  {step.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--fg-on-light-muted)',
                    marginTop: 3,
                    lineHeight: 1.4,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {step.desc}
                </div>
              </div>
              {!isLast && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0891b2" opacity="0.4">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
