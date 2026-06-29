import { useState, useRef, useEffect } from 'react';
import {
  UserPlus,
  BedDouble,
  LogOut,
  IndianRupee,
  Stethoscope,
  Receipt,
  TrendingUp,
  ChevronDown,
  CalendarDays,
} from 'lucide-react';

// ── Date range picker helpers ─────────────────────────────────────────────────

const TODAY_ISO = new Date().toISOString().slice(0, 10);

function isoFmt(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const PRESETS = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7',     label: 'Last 7 days' },
  { key: 'last14',    label: 'Last 14 days' },
  { key: 'last30',    label: 'Last 30 days' },
  { key: 'thisWeek',  label: 'This week' },
  { key: 'lastWeek',  label: 'Last week' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'custom',    label: 'Custom' },
];

function calcPreset(key) {
  const t = new Date(TODAY_ISO + 'T00:00:00');
  const iso = (d) => d.toISOString().slice(0, 10);
  const shift = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  switch (key) {
    case 'today':     return { s: TODAY_ISO, e: TODAY_ISO };
    case 'yesterday': { const y = shift(t, -1); return { s: iso(y), e: iso(y) }; }
    case 'last7':     return { s: iso(shift(t, -6)), e: TODAY_ISO };
    case 'last14':    return { s: iso(shift(t, -13)), e: TODAY_ISO };
    case 'last30':    return { s: iso(shift(t, -29)), e: TODAY_ISO };
    case 'thisWeek':  { const s = new Date(t); s.setDate(s.getDate() - s.getDay()); return { s: iso(s), e: iso(shift(s, 6)) }; }
    case 'lastWeek':  { const s = new Date(t); s.setDate(s.getDate() - s.getDay() - 7); return { s: iso(s), e: iso(shift(s, 6)) }; }
    case 'thisMonth': return { s: iso(new Date(t.getFullYear(), t.getMonth(), 1)), e: iso(new Date(t.getFullYear(), t.getMonth() + 1, 0)) };
    case 'lastMonth': return { s: iso(new Date(t.getFullYear(), t.getMonth() - 1, 1)), e: iso(new Date(t.getFullYear(), t.getMonth(), 0)) };
    default:          return { s: '', e: '' };
  }
}

// ── Single month calendar grid ────────────────────────────────────────────────

function MonthCalendar({ year, month, pStart, pEnd, hover, clicking, onDayClick, onDayHover }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const title = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  while (cells.length % 7 !== 0) cells.push(null);

  const effEnd    = clicking && hover ? hover : pEnd;
  const rStart    = pStart && effEnd ? (pStart <= effEnd ? pStart : effEnd) : pStart;
  const rEnd      = pStart && effEnd ? (pStart <= effEnd ? effEnd : pStart) : '';
  const isSingle  = rStart && rStart === rEnd;
  const RANGE_BG  = 'rgba(8,145,178,0.12)';

  return (
    <div style={{ minWidth: 224 }}>
      <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--fg-on-light)', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)', rowGap: 0 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--fg-on-light-muted)', paddingBottom: 6, letterSpacing: '0.05em' }}>
            {d}
          </div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} />;
          const day     = parseInt(iso.split('-')[2], 10);
          const isStart = iso === rStart;
          const isEnd   = iso === rEnd;
          const inRange = rStart && rEnd && iso > rStart && iso < rEnd;
          const isToday = iso === TODAY_ISO;
          const isSel   = isStart || isEnd;

          let outerBg = 'transparent';
          if (!isSingle) {
            if (isStart && rEnd) outerBg = `linear-gradient(to right, transparent 50%, ${RANGE_BG} 50%)`;
            else if (isEnd && rStart) outerBg = `linear-gradient(to left, transparent 50%, ${RANGE_BG} 50%)`;
            else if (inRange) outerBg = RANGE_BG;
          }

          return (
            <div
              key={iso}
              onClick={() => onDayClick(iso)}
              onMouseEnter={() => onDayHover(iso)}
              onMouseLeave={() => onDayHover('')}
              style={{ background: outerBg, cursor: 'pointer' }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
                fontWeight: isSel || isToday ? 700 : 400,
                background: isSel ? '#0891b2' : 'transparent',
                color: isSel ? '#fff' : isToday ? '#0891b2' : 'var(--fg-on-light)',
                border: isToday && !isSel ? '1.5px solid #0891b2' : 'none',
              }}>
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Date range picker ─────────────────────────────────────────────────────────

function DateRangePicker({ start, end, onApply }) {
  const today = new Date(TODAY_ISO + 'T00:00:00');
  const initLY = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const initLM = today.getMonth() === 0 ? 11 : today.getMonth() - 1;

  const [open,     setOpen]     = useState(false);
  const [preset,   setPreset]   = useState('thisMonth');
  const [pStart,   setPStart]   = useState(start);
  const [pEnd,     setPEnd]     = useState(end);
  const [hover,    setHover]    = useState('');
  const [clicking, setClicking] = useState(false);
  const [leftYear, setLeftYear] = useState(initLY);
  const [leftMon,  setLeftMon]  = useState(initLM);
  const wrapRef = useRef(null);

  const rightYear = leftMon === 11 ? leftYear + 1 : leftYear;
  const rightMon  = (leftMon + 1) % 12;

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const openPicker = () => {
    setPStart(start || ''); setPEnd(end || ''); setClicking(false); setHover('');
    if (start) {
      const [y, m] = start.split('-').map(Number);
      const lm = m - 2;
      if (lm < 0) { setLeftYear(y - 1); setLeftMon(lm + 12); }
      else { setLeftYear(y); setLeftMon(lm); }
    }
    setOpen(true);
  };

  const selectPreset = (key) => {
    setPreset(key);
    if (key !== 'custom') {
      const { s, e } = calcPreset(key);
      setPStart(s); setPEnd(e); setClicking(false);
    } else {
      setPStart(''); setPEnd(''); setClicking(false);
    }
  };

  const handleDayClick = (iso) => {
    setPreset('custom');
    if (!clicking || !pStart) {
      setPStart(iso); setPEnd(''); setClicking(true);
    } else {
      if (iso >= pStart) { setPEnd(iso); setClicking(false); }
      else { setPStart(iso); setPEnd(''); }
    }
  };

  const navPrev = () => {
    if (leftMon === 0) { setLeftYear((y) => y - 1); setLeftMon(11); }
    else setLeftMon((m) => m - 1);
  };
  const navRight = () => {
    if (leftMon === 11) { setLeftYear((y) => y + 1); setLeftMon(0); }
    else setLeftMon((m) => m + 1);
  };

  const handleApply = () => {
    const s = pStart; const e = pEnd || pStart;
    if (s) { onApply(s, e); setOpen(false); }
  };

  const label = start && end ? `${isoFmt(start)}  –  ${isoFmt(end)}` : 'Select date range';

  const navBtn = {
    background: 'transparent', border: '1px solid var(--border-ui)',
    width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    color: 'var(--fg-on-light-muted)',
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={openPicker}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 14px',
          border: '1px solid var(--border-ui)', borderRadius: 8,
          background: 'var(--surface)', fontFamily: 'inherit',
          fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)', cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <CalendarDays size={14} style={{ color: 'var(--fg-on-light-muted)' }} />
        {label}
        <ChevronDown size={13} style={{ color: 'var(--fg-on-light-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 1000,
          background: 'var(--surface)', border: '1px solid var(--border-card)',
          borderRadius: 12, boxShadow: '0 8px 40px rgba(15,23,42,0.14)',
          display: 'flex', overflow: 'hidden',
        }}>
          {/* ── Preset list ── */}
          <div style={{ width: 158, borderRight: '1px solid var(--border-card)', padding: '8px 0', flexShrink: 0 }}>
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => selectPreset(p.key)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 16px', border: 'none', fontFamily: 'inherit',
                  fontSize: 13, cursor: 'pointer',
                  background: preset === p.key ? 'rgba(8,145,178,0.08)' : 'transparent',
                  color: preset === p.key ? '#0891b2' : 'var(--fg-on-light)',
                  fontWeight: preset === p.key ? 600 : 400,
                  borderLeft: `3px solid ${preset === p.key ? '#0891b2' : 'transparent'}`,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* ── Calendars + footer ── */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Navigation + two months */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px 8px' }}>
              <button onClick={navPrev} style={navBtn}>
                <ChevronDown size={12} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <div style={{ display: 'flex', gap: 28 }}>
                <MonthCalendar
                  year={leftYear} month={leftMon}
                  pStart={pStart} pEnd={pEnd} hover={hover} clicking={clicking}
                  onDayClick={handleDayClick} onDayHover={setHover}
                />
                <MonthCalendar
                  year={rightYear} month={rightMon}
                  pStart={pStart} pEnd={pEnd} hover={hover} clicking={clicking}
                  onDayClick={handleDayClick} onDayHover={setHover}
                />
              </div>
              <button onClick={navRight} style={navBtn}>
                <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>

            {/* Selected range label */}
            <div style={{ padding: '4px 20px 10px', fontSize: 12, color: 'var(--fg-on-light-muted)', minHeight: 24 }}>
              {pStart && (
                <>
                  <span style={{ fontWeight: 600, color: 'var(--fg-on-light)' }}>{isoFmt(pStart)}</span>
                  <span style={{ margin: '0 6px' }}>–</span>
                  {pEnd
                    ? <span style={{ fontWeight: 600, color: 'var(--fg-on-light)' }}>{isoFmt(pEnd)}</span>
                    : <span style={{ fontStyle: 'italic' }}>select end date</span>
                  }
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 8,
              padding: '12px 20px', borderTop: '1px solid var(--border-card)',
              background: 'var(--surface-subtle)',
            }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '8px 16px', border: '1px solid var(--border-strong)', borderRadius: 8, background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--fg-on-light)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!pStart}
                style={{ padding: '8px 20px', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: pStart ? 'pointer' : 'default', background: pStart ? '#0891b2' : 'var(--border-ui)', color: pStart ? '#fff' : 'var(--fg-on-light-muted)' }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  '2026-06': [{ ward: 'General Ward', admissions: 14 }, { ward: 'ICU', admissions: 6 }, { ward: 'Surgery', admissions: 5 }, { ward: 'Maternity', admissions: 4 }, { ward: 'Orthopaedic', admissions: 2 }],
  '2026-05': [{ ward: 'General Ward', admissions: 11 }, { ward: 'ICU', admissions: 5 }, { ward: 'Surgery', admissions: 5 }, { ward: 'Maternity', admissions: 3 }, { ward: 'Orthopaedic', admissions: 2 }],
};
const DEFAULT_WARDS = [{ ward: 'General Ward', admissions: 8 }, { ward: 'ICU', admissions: 3 }, { ward: 'Surgery', admissions: 3 }, { ward: 'Maternity', admissions: 2 }, { ward: 'Orthopaedic', admissions: 1 }];

// ── Top diagnoses ────────────────────────────────────────────────────────────
const DIAG_MONTHLY = {
  '2026-06': [{ name: 'Dengue Fever', count: 8 }, { name: 'Hypertension', count: 7 }, { name: 'Diabetes Complications', count: 6 }, { name: 'Cardiac Events', count: 4 }, { name: 'Fractures / Ortho', count: 3 }],
  '2026-05': [{ name: 'Hypertension', count: 7 }, { name: 'Dengue Fever', count: 6 }, { name: 'Diabetes Complications', count: 5 }, { name: 'Cardiac Events', count: 4 }, { name: 'Respiratory Infection', count: 4 }],
};
const DEFAULT_DIAGS = [{ name: 'Hypertension', count: 5 }, { name: 'Diabetes Complications', count: 4 }, { name: 'Cardiac Events', count: 3 }, { name: 'Dengue Fever', count: 2 }, { name: 'Fractures / Ortho', count: 2 }];

// ── Billing status ───────────────────────────────────────────────────────────
const BILL_MONTHLY = {
  '2026-06': { paid: 22, partial: 6, pending: 4 },
  '2026-05': { paid: 18, partial: 5, pending: 3 },
  '2026-04': { paid: 20, partial: 6, pending: 3 },
  '2026-03': { paid: 15, partial: 4, pending: 2 },
  '2026-02': { paid: 17, partial: 5, pending: 2 },
  '2026-01': { paid: 13, partial: 3, pending: 2 },
};

// ── 6-month trend ────────────────────────────────────────────────────────────
const TREND = [
  { month: 'Jan', patients: 18, admissions: 18 },
  { month: 'Feb', patients: 24, admissions: 24 },
  { month: 'Mar', patients: 21, admissions: 21 },
  { month: 'Apr', patients: 29, admissions: 29 },
  { month: 'May', patients: 26, admissions: 26 },
  { month: 'Jun', patients: 31, admissions: 31 },
];
const TREND_MAX = Math.max(...TREND.flatMap((t) => [t.patients, t.admissions]));

// ── Shared components ────────────────────────────────────────────────────────
const card = { background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 20 };

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

function getMonthsInRange(start, end) {
  if (!start || !end) return [];
  const res = [];
  let curr = new Date(start);
  const last = new Date(end);
  while (curr <= last) {
    const ym = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
    if (!res.includes(ym)) res.push(ym);
    curr.setMonth(curr.getMonth() + 1);
  }
  const endYm = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}`;
  if (!res.includes(endYm)) res.push(endYm);
  return res;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const init = calcPreset('thisMonth');
  const [startDate, setStartDate] = useState(init.s);
  const [endDate,   setEndDate]   = useState(init.e);

  const monthLabel  = startDate && endDate ? `${isoFmt(startDate)} – ${isoFmt(endDate)}` : '';
  const activeMonths = getMonthsInRange(startDate, endDate);

  // Aggregate KPI
  let kpi = { patients: 0, admissions: 0, discharged: 0, avgLos: 0, revenue: 0, outstanding: 0 };
  let kpiCount = 0;
  let wardCounts = {};
  let diagCounts = {};
  let bills = { paid: 0, partial: 0, pending: 0 };

  activeMonths.forEach((m) => {
    const data = MONTHLY_KPI[m];
    if (data) {
      kpi.patients    += data.patients;
      kpi.admissions  += data.admissions;
      kpi.discharged  += data.discharged;
      kpi.avgLos      += parseFloat(data.avgLos);
      kpi.revenue     += parseFloat(data.revenue.replace(/[^0-9.]/g, '')) * (data.revenue.includes('L') ? 100000 : 1000);
      kpi.outstanding += parseFloat(data.outstanding.replace(/[^0-9.]/g, '')) * (data.outstanding.includes('L') ? 100000 : 1000);
      kpiCount++;
    }
    const wList = WARD_MONTHLY[m];
    if (wList) wList.forEach((w) => { wardCounts[w.ward] = (wardCounts[w.ward] || 0) + w.admissions; });
    const dList = DIAG_MONTHLY[m];
    if (dList) dList.forEach((d) => { diagCounts[d.name] = (diagCounts[d.name] || 0) + d.count; });
    const bData = BILL_MONTHLY[m];
    if (bData) { bills.paid += bData.paid; bills.partial += bData.partial; bills.pending += bData.pending; }
  });

  if (kpiCount === 0) {
    kpi = DEFAULT_KPI;
  } else {
    kpi.avgLos      = String(Math.round(kpi.avgLos / kpiCount));
    kpi.revenue     = `₹${(kpi.revenue / 100000).toFixed(1)}L`;
    kpi.outstanding = `₹${Math.round(kpi.outstanding / 1000)}K`;
  }

  const wards   = Object.keys(wardCounts).length > 0 ? Object.entries(wardCounts).map(([ward, admissions]) => ({ ward, admissions })).sort((a, b) => b.admissions - a.admissions) : DEFAULT_WARDS;
  const diags   = Object.keys(diagCounts).length > 0 ? Object.entries(diagCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count) : DEFAULT_DIAGS;
  const wardMax = Math.max(...wards.map((w) => w.admissions));
  const diagMax = Math.max(...diags.map((d) => d.count));
  const billTotal = bills.paid + bills.partial + bills.pending;
  const pct = (n) => (billTotal ? Math.round((n / billTotal) * 100) : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>Reports</div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>Analytics</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
            Performance overview — {monthLabel}
          </p>
        </div>

        <DateRangePicker
          start={startDate}
          end={endDate}
          onApply={(s, e) => { setStartDate(s); setEndDate(e); }}
        />
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <div style={card}>
          <div style={{ width: 30, height: 30, background: 'rgba(78,179,116,0.10)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <UserPlus size={14} style={{ color: '#4eb374' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-on-light-muted)', marginBottom: 6 }}>New Patients</div>
          <div style={{ fontSize: 34, fontWeight: 300, color: 'var(--fg-on-light)', lineHeight: 1 }}>{kpi.patients}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 4 }}>Registered this period</div>
        </div>

        <div style={card}>
          <div style={{ width: 30, height: 30, background: 'rgba(8,145,178,0.10)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <BedDouble size={14} style={{ color: '#0891b2' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-on-light-muted)', marginBottom: 6 }}>IPD Admissions</div>
          <div style={{ fontSize: 34, fontWeight: 300, color: 'var(--fg-on-light)', lineHeight: 1 }}>{kpi.admissions}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 4 }}>Admitted this period</div>
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
          {wards.map((w) => <HBar key={w.ward} label={w.ward} count={w.admissions} maxCount={wardMax} color="#0891b2" suffix="admissions" />)}
        </div>
        <div style={card}>
          <CardHeader icon={Stethoscope} iconColor="#995f2f" title="Top Diagnoses / Reasons" />
          {diags.map((d) => <HBar key={d.name} label={d.name} count={d.count} maxCount={diagMax} color="#995f2f" suffix="cases" />)}
        </div>
      </div>

      {/* Row 2: Bill Collection + 6-Month Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 16 }}>
        <div style={card}>
          <CardHeader icon={Receipt} iconColor="#995f2f" title="Bill Collection Status" />
          {[
            { label: 'Paid',    count: bills.paid,    color: '#4eb374', labelColor: '#15803d' },
            { label: 'Partial', count: bills.partial, color: '#d9a441', labelColor: '#854d0e' },
            { label: 'Pending', count: bills.pending, color: '#d95050', labelColor: '#991b1b' },
          ].map((b) => (
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
            Total bills this period: <strong style={{ color: 'var(--fg-on-light)' }}>{billTotal}</strong>
          </div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <TrendingUp size={15} style={{ color: '#4eb374', flexShrink: 0 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)' }}>6-Month Trend</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--fg-on-light-muted)', marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#4eb374', display: 'inline-block' }} /> New Patients
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0891b2', display: 'inline-block' }} /> IPD Admissions
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 80, paddingBottom: 4, borderBottom: '1px solid rgba(15,23,42,0.08)', marginBottom: 8 }}>
            {TREND.map((t) => (
              <div key={t.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: '44%', height: `${(t.patients   / TREND_MAX) * 60}px`, background: '#4eb374', borderRadius: '2px 2px 0 0', transition: 'height 600ms' }} />
                  <div style={{ width: '44%', height: `${(t.admissions / TREND_MAX) * 60}px`, background: '#0891b2', borderRadius: '2px 2px 0 0', transition: 'height 600ms' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {TREND.map((t) => (
              <div key={t.month} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--fg-on-light-muted)', fontWeight: 500 }}>{t.month}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
