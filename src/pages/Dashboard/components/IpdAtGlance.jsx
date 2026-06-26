import { BedDouble, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WARD_OCCUPANCY = [
  { ward: 'General', occupied: 14, total: 20 },
  { ward: 'ICU', occupied: 6, total: 8 },
  { ward: 'Surgery', occupied: 9, total: 12 },
  { ward: 'Maternity', occupied: 5, total: 10 },
  { ward: 'Orthopaedic', occupied: 3, total: 8 },
  { ward: 'Paediatric', occupied: 7, total: 10 },
];

const CURRENT_INPATIENTS = [
  { initials: 'RP', name: 'Ramesh Patel', reason: 'Acute Appendicitis', ward: 'General', bed: '4A', days: 3 },
  { initials: 'SS', name: 'Sunita Sharma', reason: 'Myocardial Infarction', ward: 'ICU', bed: '2', days: 4 },
  { initials: 'AM', name: 'Ankit Mehta', reason: 'Hernia Repair', ward: 'Surgery', bed: '7B', days: 5 },
  { initials: 'PJ', name: 'Priya Joshi', reason: 'Normal Delivery', ward: 'Maternity', bed: '3', days: 2 },
  { initials: 'VK', name: 'Vijay Kumar', reason: 'Dengue Fever', ward: 'General', bed: '6C', days: 7 },
];

const IPD_KPIS = [
  { label: 'Currently admitted', value: 14, sub: 'patients in-ward', color: '#0891b2' },
  { label: 'Avg. length of stay', value: '4.8', sub: 'days (all-time)', color: '#0f172a' },
  { label: 'Discharged this month', value: 18, sub: 'patients discharged', color: '#0f172a' },
  { label: 'Total admissions', value: 42, sub: 'since go-live', color: '#0f172a' },
];

function barColor(pct) {
  if (pct >= 90) return '#d95050';
  if (pct >= 70) return '#d9a441';
  return '#0891b2';
}

export default function IpdAtGlance() {
  const navigate = useNavigate();
  return (
    <div style={{ animation: 'mv-fade 240ms ease both' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#0891b2', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BedDouble size={15} color="white" />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>IPD at a glance</h3>
        </div>
        <button
          onClick={() => navigate('/admissions')}
          style={{ background: 'transparent', border: 'none', color: '#0f172a', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          All admissions <ArrowRight size={14} />
        </button>
      </div>

      {/* IPD KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {IPD_KPIS.map(k => (
          <div key={k.label} style={{ background: 'white', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', fontWeight: 600, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 300, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Ward occupancy + Current inpatients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
        {/* Ward occupancy */}
        <div style={{ background: 'white', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Ward occupancy</h4>
          {WARD_OCCUPANCY.map(w => {
            const pct = Math.round((w.occupied / w.total) * 100);
            return (
              <div key={w.ward} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>{w.ward}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{w.occupied}/{w.total} beds · {pct}%</span>
                </div>
                <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: barColor(pct), borderRadius: 5, transition: 'width 600ms' }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 10, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: '#0891b2', borderRadius: 2, display: 'inline-block' }} /> Normal
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: '#d9a441', borderRadius: 2, display: 'inline-block' }} /> &gt;70%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: '#d95050', borderRadius: 2, display: 'inline-block' }} /> Critical
            </span>
          </div>
        </div>

        {/* Current inpatients */}
        <div style={{ background: 'white', border: '1px solid rgba(15,23,42,0.06)', borderRadius: 12, padding: 20 }}>
          <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Current inpatients</h4>
          {CURRENT_INPATIENTS.map(ci => (
            <div
              key={ci.initials + ci.bed}
              onClick={() => navigate('/admissions')}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 9, borderRadius: 8, cursor: 'pointer', transition: 'background 120ms', marginBottom: 2 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 34, height: 34, background: 'rgba(8,145,178,0.10)', color: '#0891b2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {ci.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{ci.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ci.reason}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#0891b2' }}>{ci.ward} · {ci.bed}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>Day {ci.days}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
