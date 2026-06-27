import { useState } from 'react';
import {
  UserPlus, BedDouble, LogOut, IndianRupee,
  Stethoscope, Receipt, TrendingUp, ChevronDown,
} from 'lucide-react';

// ── Last 12 months dropdown options ─────────────────────────────────────────
function buildMonthOptions() {
  const opts = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(2026, 5 - i, 1); // anchor: Jun 2026
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    opts.push({ key, label });
  }
  return opts;
}
const MONTH_OPTIONS = buildMonthOptions();

// ── KPI data per month ───────────────────────────────────────────────────────
const MONTHLY_KPI = {
  '2026-06': { patients: 31, admissions: 31, discharged: 28, avgLos: '4.2', revenue: '₹3.4L', outstanding: '₹48K' },
  '2026-05': { patients: 26, admissions: 26, discharged: 24, avgLos: '3.8', revenue: '₹2.8L', outstanding: '₹35K' },
  '2026-04': { patients: 29, admissions: 29, discharged: 26, avgLos: '4.0', revenue: '₹3.1L', outstanding: '₹42K' },
  '2026-03': { patients: 21, admissions: 21, discharged: 19, avgLos: '3.5', revenue: '₹2.1L', outstanding: '₹28K' },
  '2026-02': { patients: 24, admissions: 24, discharged: 22, avgLos: '3.7', revenue: '₹2.4L', outstanding: '₹30K' },
  '2026-01': { patients: 18, admissions: 18, discharged: 16, avgLos: '3.3', revenue: '₹1.8L', outstanding: '₹22K' },
};
const DEFAULT_KPI = { patients: 12, admissions: 12, discharged: 10, avgLos: '3.1', revenue: '₹1.2L', outstanding: '₹18K' };

// ── Admissions by ward ───────────────────────────────────────────────────────
const WARD_MONTHLY = {
  '2026-06': [
    { ward: 'General Ward', admissions: 14 },
    { ward: 'ICU',          admissions: 6  },
    { ward: 'Surgery',      admissions: 5  },
    { ward: 'Maternity',    admissions: 4  },
    { ward: 'Orthopaedic',  admissions: 2  },
  ],
  '2026-05': [
    { ward: 'General Ward', admissions: 11 },
    { ward: 'ICU',          admissions: 5  },
    { ward: 'Surgery',      admissions: 5  },
    { ward: 'Maternity',    admissions: 3  },
    { ward: 'Orthopaedic',  admissions: 2  },
  ],
};
const DEFAULT_WARDS = [
  { ward: 'General Ward', admissions: 8 },
  { ward: 'ICU',          admissions: 3 },
  { ward: 'Surgery',      admissions: 3 },
  { ward: 'Maternity',    admissions: 2 },
  { ward: 'Orthopaedic',  admissions: 1 },
];

// ── Top diagnoses ────────────────────────────────────────────────────────────
const DIAG_MONTHLY = {
  '2026-06': [
    { name: 'Dengue Fever',            count: 8 },
    { name: 'Hypertension',            count: 7 },
    { name: 'Diabetes Complications',  count: 6 },
    { name: 'Cardiac Events',          count: 4 },
    { name: 'Fractures / Ortho',       count: 3 },
  ],
  '2026-05': [
    { name: 'Hypertension',            count: 7 },
    { name: 'Dengue Fever',            count: 6 },
    { name: 'Diabetes Complications',  count: 5 },
    { name: 'Cardiac Events',          count: 4 },
    { name: 'Respiratory Infection',   count: 4 },
  ],
};
const DEFAULT_DIAGS = [
  { name: 'Hypertension',           count: 5 },
  { name: 'Diabetes Complications', count: 4 },
  { name: 'Cardiac Events',         count: 3 },
  { name: 'Dengue Fever',           count: 2 },
  { name: 'Fractures / Ortho',      count: 2 },
];

// ── Billing status ───────────────────────────────────────────────────────────
const BILL_MONTHLY = {
  '2026-06': { paid: 22, partial: 6, pending: 4 },
  '2026-05': { paid: 18, partial: 5, pending: 3 },
  '2026-04': { paid: 20, partial: 6, pending: 3 },
  '2026-03': { paid: 15, partial: 4, pending: 2 },
  '2026-02': { paid: 17, partial: 5, pending: 2 },
  '2026-01': { paid: 13, partial: 3, pending: 2 },
};
const DEFAULT_BILLS = { paid: 9, partial: 2, pending: 1 };

// ── 6-month trend (fixed window Jan–Jun 2026) ────────────────────────────────
const TREND = [
  { month: 'Jan', patients: 18, admissions: 18 },
  { month: 'Feb', patients: 24, admissions: 24 },
  { month: 'Mar', patients: 21, admissions: 21 },
  { month: 'Apr', patients: 29, admissions: 29 },
  { month: 'May', patients: 26, admissions: 26 },
  { month: 'Jun', patients: 31, admissions: 31 },
];
const TREND_MAX = Math.max(...TREND.flatMap(t => [t.patients, t.admissions]));

// ── Shared components ────────────────────────────────────────────────────────
const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border-card)',
  borderRadius: 12,
  padding: 20,
};

function CardHeader({ icon: Icon, iconColor, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Icon size={15} style={{ color: iconColor, flexShrink: 0 }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)' }}>{title}</div>
    </div>
  );
}

function HBar({ label, count, maxCount, color, suffix }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-on-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', flexShrink: 0, marginLeft: 8 }}>{count} {suffix}</span>
      </div>
      <div style={{ height: 10, background: 'var(--surface-subtle)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: color, borderRadius: 3, transition: 'width 600ms' }} />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [month, setMonth]       = useState(MONTH_OPTIONS[0].key);
  const [dropOpen, setDropOpen] = useState(false);

  const monthLabel = MONTH_OPTIONS.find(o => o.key === month)?.label ?? '';
  const kpi   = MONTHLY_KPI[month]  ?? DEFAULT_KPI;
  const wards = WARD_MONTHLY[month] ?? DEFAULT_WARDS;
  const diags = DIAG_MONTHLY[month] ?? DEFAULT_DIAGS;
  const bills = BILL_MONTHLY[month] ?? DEFAULT_BILLS;

  const wardMax   = Math.max(...wards.map(w => w.admissions));
  const diagMax   = Math.max(...diags.map(d => d.count));
  const billTotal = bills.paid + bills.partial + bills.pending;
  const pct = n => billTotal ? Math.round((n / billTotal) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'mv-fade 200ms ease both' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>Reports</div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>Analytics</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
            Monthly performance overview — {monthLabel}
          </p>
        </div>

        {/* Month selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-on-light-muted)', fontWeight: 500 }}>Select month:</span>
          <div style={{ position: 'relative' }}>
            <select
              value={month}
              onMouseDown={() => setDropOpen(o => !o)}
              onChange={e => { setMonth(e.target.value); setDropOpen(false); }}
              onBlur={() => setDropOpen(false)}
              style={{ padding: '9px 36px 9px 14px', border: '1px solid var(--border-ui)', borderRadius: 8, background: 'var(--surface)', fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)', outline: 'none', cursor: 'pointer', appearance: 'none' }}
            >
              {MONTH_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: `translateY(-50%) rotate(${dropOpen ? '180deg' : '0deg'})`, transition: 'transform 180ms ease', color: 'var(--fg-on-light-muted)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>

        <div style={card}>
          <div style={{ width: 30, height: 30, background: 'rgba(78,179,116,0.10)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <UserPlus size={14} style={{ color: '#4eb374' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-on-light-muted)', marginBottom: 6 }}>New Patients</div>
          <div style={{ fontSize: 34, fontWeight: 300, color: 'var(--fg-on-light)', lineHeight: 1 }}>{kpi.patients}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 4 }}>Registered this month</div>
        </div>

        <div style={card}>
          <div style={{ width: 30, height: 30, background: 'rgba(8,145,178,0.10)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <BedDouble size={14} style={{ color: '#0891b2' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-on-light-muted)', marginBottom: 6 }}>IPD Admissions</div>
          <div style={{ fontSize: 34, fontWeight: 300, color: 'var(--fg-on-light)', lineHeight: 1 }}>{kpi.admissions}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 4 }}>Admitted this month</div>
        </div>

        <div style={card}>
          <div style={{ width: 30, height: 30, background: 'rgba(153,95,47,0.10)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <LogOut size={14} style={{ color: '#995f2f' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-on-light-muted)', marginBottom: 6 }}>Discharged</div>
          <div style={{ fontSize: 34, fontWeight: 300, color: 'var(--fg-on-light)', lineHeight: 1 }}>{kpi.discharged}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 4 }}>Avg LOS: {kpi.avgLos} days</div>
        </div>

        <div style={card}>
          <div style={{ width: 30, height: 30, background: 'rgba(153,95,47,0.10)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <IndianRupee size={14} style={{ color: '#995f2f' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-on-light-muted)', marginBottom: 6 }}>Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 300, color: '#15803d', lineHeight: 1 }}>{kpi.revenue}</div>
          <div style={{ fontSize: 11, color: '#991b1b', marginTop: 4 }}>Outstanding: {kpi.outstanding}</div>
        </div>
      </div>

      {/* Row 1: Admissions by Ward + Top Diagnoses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <div style={card}>
          <CardHeader icon={BedDouble} iconColor="#0891b2" title="Admissions by Ward" />
          {wards.map(w => (
            <HBar key={w.ward} label={w.ward} count={w.admissions} maxCount={wardMax} color="#0891b2" suffix="admissions" />
          ))}
        </div>

        <div style={card}>
          <CardHeader icon={Stethoscope} iconColor="#995f2f" title="Top Diagnoses / Reasons" />
          {diags.map(d => (
            <HBar key={d.name} label={d.name} count={d.count} maxCount={diagMax} color="#995f2f" suffix="cases" />
          ))}
        </div>
      </div>

      {/* Row 2: Bill Collection Status + 6-Month Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 16 }}>

        {/* Bill Collection Status */}
        <div style={card}>
          <CardHeader icon={Receipt} iconColor="#995f2f" title="Bill Collection Status" />

          {[
            { label: 'Paid',    count: bills.paid,    color: '#4eb374', labelColor: '#15803d' },
            { label: 'Partial', count: bills.partial, color: '#d9a441', labelColor: '#854d0e' },
            { label: 'Pending', count: bills.pending, color: '#d95050', labelColor: '#991b1b' },
          ].map(b => (
            <div key={b.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: b.labelColor }}>{b.label}</span>
                <span style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>{b.count} bills · {pct(b.count)}%</span>
              </div>
              <div style={{ height: 10, background: 'var(--surface-subtle)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct(b.count)}%`, background: b.color, borderRadius: 5, transition: 'width 600ms' }} />
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: 14, fontSize: 12, color: 'var(--fg-on-light-muted)' }}>
            Total bills this month: <strong style={{ color: 'var(--fg-on-light)' }}>{billTotal}</strong>
          </div>
        </div>

        {/* 6-Month Trend */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <TrendingUp size={15} style={{ color: '#4eb374', flexShrink: 0 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)' }}>6-Month Trend</div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--fg-on-light-muted)', marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#4eb374', display: 'inline-block' }} />
              New Patients
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0891b2', display: 'inline-block' }} />
              IPD Admissions
            </span>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 80, paddingBottom: 4, borderBottom: '1px solid rgba(15,23,42,0.08)', marginBottom: 8 }}>
            {TREND.map(t => (
              <div key={t.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: '44%', height: `${(t.patients   / TREND_MAX) * 60}px`, background: '#4eb374', borderRadius: '2px 2px 0 0', transition: 'height 600ms' }} />
                  <div style={{ width: '44%', height: `${(t.admissions / TREND_MAX) * 60}px`, background: '#0891b2', borderRadius: '2px 2px 0 0', transition: 'height 600ms' }} />
                </div>
              </div>
            ))}
          </div>

          {/* X-axis */}
          <div style={{ display: 'flex', gap: 12 }}>
            {TREND.map(t => (
              <div key={t.month} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--fg-on-light-muted)', fontWeight: 500 }}>{t.month}</div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
