import { TrendingUp, Users, BedDouble, IndianRupee, FlaskConical } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const ADMISSION_DATA = [18, 24, 21, 29, 26, 31];
const REVENUE_DATA = [180000, 240000, 210000, 310000, 280000, 340000];
const MAX_ADM = Math.max(...ADMISSION_DATA);
const MAX_REV = Math.max(...REVENUE_DATA);

const WARD_OCCUPANCY = [
  { ward: 'General', beds: 20, occupied: 14 },
  { ward: 'ICU', beds: 8, occupied: 6 },
  { ward: 'Surgery', beds: 12, occupied: 9 },
  { ward: 'Maternity', beds: 10, occupied: 5 },
  { ward: 'Orthopaedic', beds: 8, occupied: 3 },
  { ward: 'Paediatric', beds: 10, occupied: 7 },
];

const BILLING_STATUS = [
  { label: 'Paid', value: 62, color: '#15803d' },
  { label: 'Partial', value: 23, color: '#d9a441' },
  { label: 'Unpaid', value: 15, color: '#d95050' },
];

const TOP_DIAGNOSES = [
  { name: 'Dengue Fever', count: 18 },
  { name: 'Hypertension', count: 15 },
  { name: 'Diabetes Complications', count: 12 },
  { name: 'Cardiac Events', count: 9 },
  { name: 'Fractures / Ortho', count: 8 },
];
const MAX_DIAG = TOP_DIAGNOSES[0].count;

const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

const KPI_CARDS = [
  { label: 'Patients this month', value: '128', delta: '+12%', positive: true, icon: Users, iconBg: 'rgba(15,23,42,0.06)', iconColor: 'var(--fg-on-light)' },
  { label: 'Admissions this month', value: '31', delta: '+19%', positive: true, icon: BedDouble, iconBg: 'rgba(8,145,178,0.10)', iconColor: '#0891b2' },
  { label: 'Revenue this month', value: '₹3.4L', delta: '+21%', positive: true, icon: IndianRupee, iconBg: 'rgba(21,128,61,0.10)', iconColor: '#15803d' },
  { label: 'Lab tests ordered', value: '214', delta: '+8%', positive: true, icon: FlaskConical, iconBg: 'rgba(217,164,65,0.10)', iconColor: '#d9a441' },
];

const chartCard = {
  background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 20,
};

export default function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
          Jan – Jun 2026
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>Analytics</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>6-month performance overview for BAPS Pramukh Swami Hospital</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {KPI_CARDS.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, background: k.iconBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.iconColor }}>
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: 11, color: '#15803d', background: 'rgba(78,179,116,0.12)', padding: '3px 8px', borderRadius: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <TrendingUp size={10} /> {k.delta}
                </span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--fg-on-light)', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-on-light-muted)', marginTop: 6 }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Admissions trend */}
        <div style={chartCard}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)', marginBottom: 4 }}>Admissions trend</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginBottom: 20 }}>Monthly IPD admissions · Jan–Jun 2026</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {ADMISSION_DATA.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 11, color: 'var(--fg-on-light)', fontWeight: 500 }}>{v}</div>
                <div style={{ width: '100%', background: '#0891b2', borderRadius: '4px 4px 0 0', height: `${(v / MAX_ADM) * 80}px`, opacity: i === ADMISSION_DATA.length - 1 ? 1 : 0.55 }} />
                <div style={{ fontSize: 10, color: 'var(--fg-on-light-muted)' }}>{MONTHS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue trend */}
        <div style={chartCard}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)', marginBottom: 4 }}>Revenue trend</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginBottom: 20 }}>Monthly collections · Jan–Jun 2026</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
            {REVENUE_DATA.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 10, color: 'var(--fg-on-light)', fontWeight: 500 }}>{fmt(v)}</div>
                <div style={{ width: '100%', background: '#15803d', borderRadius: '4px 4px 0 0', height: `${(v / MAX_REV) * 80}px`, opacity: i === REVENUE_DATA.length - 1 ? 1 : 0.55 }} />
                <div style={{ fontSize: 10, color: 'var(--fg-on-light-muted)' }}>{MONTHS[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {/* Ward occupancy */}
        <div style={chartCard}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)', marginBottom: 4 }}>Ward occupancy</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginBottom: 16 }}>Current bed utilisation</div>
          {WARD_OCCUPANCY.map(w => (
            <div key={w.ward} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--fg-on-light)' }}>{w.ward}</span>
                <span style={{ color: 'var(--fg-on-light-muted)' }}>{w.occupied}/{w.beds}</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(w.occupied / w.beds) * 100}%`, background: w.occupied / w.beds > 0.8 ? '#d95050' : '#0891b2', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Billing breakdown */}
        <div style={chartCard}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)', marginBottom: 4 }}>Billing status</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginBottom: 20 }}>Payment collection breakdown</div>
          {BILLING_STATUS.map(b => (
            <div key={b.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, display: 'inline-block' }} />
                  <span style={{ color: 'var(--fg-on-light)' }}>{b.label}</span>
                </span>
                <span style={{ color: b.color, fontWeight: 600 }}>{b.value}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--surface-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.value}%`, background: b.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top diagnoses */}
        <div style={chartCard}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)', marginBottom: 4 }}>Top diagnoses</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginBottom: 16 }}>Most common this month</div>
          {TOP_DIAGNOSES.map((d, i) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--fg-on-light)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                <div style={{ height: 4, background: 'var(--surface-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.count / MAX_DIAG) * 100}%`, background: '#baec55', borderRadius: 2 }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', flexShrink: 0, width: 24, textAlign: 'right' }}>{d.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
