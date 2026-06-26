import { BedDouble, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ADMISSIONS = [
  { id: 'IPD-2026-042', name: 'Ramesh Patel', ward: 'General · Bed 4A', since: '23 Jun', status: 'Admitted', statusColor: '#0891b2', statusBg: 'rgba(8,145,178,0.10)', initials: 'RP' },
  { id: 'IPD-2026-041', name: 'Sunita Sharma', ward: 'ICU · Bed 2', since: '22 Jun', status: 'Critical', statusColor: '#d95050', statusBg: 'rgba(217,80,80,0.10)', initials: 'SS' },
  { id: 'IPD-2026-040', name: 'Ankit Mehta', ward: 'Surgery · Bed 7B', since: '21 Jun', status: 'Admitted', statusColor: '#0891b2', statusBg: 'rgba(8,145,178,0.10)', initials: 'AM' },
  { id: 'IPD-2026-039', name: 'Priya Joshi', ward: 'Maternity · Bed 3', since: '20 Jun', status: 'Discharged', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.10)', initials: 'PJ' },
];

export default function RecentAdmissions() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BedDouble size={16} color="var(--fg-on-light-muted)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)' }}>Recent Admissions</span>
        </div>
        <button
          onClick={() => navigate('/admissions')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0891b2', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      {ADMISSIONS.map(a => (
        <div
          key={a.id}
          onClick={() => navigate(`/admissions/${a.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 20px', borderTop: '1px solid var(--border-card)',
            cursor: 'pointer', transition: 'background 120ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: 'var(--surface-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: 'var(--fg-on-light)', flexShrink: 0,
          }}>{a.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)' }}>{a.name}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 1 }}>{a.id} · {a.ward}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: a.statusColor, background: a.statusBg, padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
              {a.status}
            </span>
            <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 3 }}>Since {a.since}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
