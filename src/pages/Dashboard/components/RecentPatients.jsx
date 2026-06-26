import { ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PATIENTS = [
  { id: 'PT-0128', name: 'Kiran Desai', ageSex: '34M', initials: 'KD', hasAllergy: false },
  { id: 'PT-0127', name: 'Meena Agarwal', ageSex: '52F', initials: 'MA', hasAllergy: true },
  { id: 'PT-0126', name: 'Suresh Rao', ageSex: '67M', initials: 'SR', hasAllergy: false },
  { id: 'PT-0125', name: 'Anjali Shah', ageSex: '28F', initials: 'AS', hasAllergy: true },
  { id: 'PT-0124', name: 'Mohan Trivedi', ageSex: '45M', initials: 'MT', hasAllergy: false },
];

export default function RecentPatients() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'white', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Recently updated</h3>
        <button
          onClick={() => navigate('/patients')}
          style={{ background: 'transparent', border: 'none', color: '#0f172a', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          All <ArrowRight size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {PATIENTS.map(p => (
          <div
            key={p.id}
            onClick={() => navigate('/patients')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, cursor: 'pointer', transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 34, height: 34, background: '#f1f5f9', color: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              {p.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{p.id} · {p.ageSex}</div>
            </div>
            {p.hasAllergy && <AlertTriangle size={14} color="#d95050" />}
          </div>
        ))}
      </div>
    </div>
  );
}
