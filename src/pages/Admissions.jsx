import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';

const ADMISSIONS = [
  { id: 'IPD-2026-042', patient: 'Ramesh Patel', initials: 'RP', doctor: 'Dr. Priya Mehta', ward: 'General', bed: '4A', since: '23 Jun 2026', days: 3, status: 'Admitted', diagnosis: 'Acute Appendicitis' },
  { id: 'IPD-2026-041', patient: 'Sunita Sharma', initials: 'SS', doctor: 'Dr. Arjun Rao', ward: 'ICU', bed: '2', since: '22 Jun 2026', days: 4, status: 'Critical', diagnosis: 'Myocardial Infarction' },
  { id: 'IPD-2026-040', patient: 'Ankit Mehta', initials: 'AM', doctor: 'Dr. Priya Mehta', ward: 'Surgery', bed: '7B', since: '21 Jun 2026', days: 5, status: 'Admitted', diagnosis: 'Hernia Repair' },
  { id: 'IPD-2026-039', patient: 'Priya Joshi', initials: 'PJ', doctor: 'Dr. Kavita Singh', ward: 'Maternity', bed: '3', since: '20 Jun 2026', days: 2, status: 'Admitted', diagnosis: 'Normal Delivery' },
  { id: 'IPD-2026-038', patient: 'Vijay Kumar', initials: 'VK', doctor: 'Dr. Arjun Rao', ward: 'General', bed: '6C', since: '19 Jun 2026', days: 7, status: 'Admitted', diagnosis: 'Dengue Fever' },
  { id: 'IPD-2026-037', patient: 'Rekha Nair', initials: 'RN', doctor: 'Dr. Kavita Singh', ward: 'Ortho', bed: '2A', since: '16 Jun 2026', days: 10, status: 'Discharged', diagnosis: 'Femur Fracture' },
  { id: 'IPD-2026-036', patient: 'Santosh Gupta', initials: 'SG', doctor: 'Dr. Priya Mehta', ward: 'General', bed: '1B', since: '14 Jun 2026', days: 12, status: 'Discharged', diagnosis: 'Typhoid Fever' },
];

const STATUS_MAP = {
  Admitted: { color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  Critical: { color: '#d95050', bg: 'rgba(217,80,80,0.10)' },
  Discharged: { color: '#15803d', bg: 'rgba(78,179,116,0.10)' },
};

const WARDS = ['All wards', 'General', 'ICU', 'Surgery', 'Maternity', 'Ortho'];
const STATUSES = ['all', 'Admitted', 'Critical', 'Discharged'];

const TAB_BASE = {
  padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', border: 'none', transition: 'all 120ms', fontFamily: 'inherit',
};

export default function Admissions() {
  const navigate = useNavigate();
  const { openNewAdmissionModal } = useOutletContext();
  const [activeStatus, setActiveStatus] = useState('all');
  const [wardFilter, setWardFilter] = useState('All wards');

  const filtered = ADMISSIONS.filter(a => {
    if (activeStatus !== 'all' && a.status !== activeStatus) return false;
    if (wardFilter !== 'All wards' && a.ward !== wardFilter) return false;
    return true;
  });

  const counts = {
    all: ADMISSIONS.length,
    Admitted: ADMISSIONS.filter(a => a.status === 'Admitted').length,
    Critical: ADMISSIONS.filter(a => a.status === 'Critical').length,
    Discharged: ADMISSIONS.filter(a => a.status === 'Discharged').length,
  };

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
            {filtered.length} admissions
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>IPD Admissions</h1>
        </div>
        <button className="btn-primary" onClick={openNewAdmissionModal}>
          <Plus size={16} /> New admission
        </button>
      </div>

      {/* Status tabs + ward filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', border: '1px solid var(--border-ui)', borderRadius: 24, padding: 4 }}>
          {STATUSES.map(s => {
            const isActive = activeStatus === s;
            return (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                style={{
                  ...TAB_BASE,
                  background: isActive ? 'var(--fg-on-light)' : 'transparent',
                  color: isActive ? 'var(--surface)' : 'var(--fg-on-light-muted)',
                }}
              >
                {s === 'all' ? 'All' : s}
                <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>{counts[s]}</span>
              </button>
            );
          })}
        </div>
        <select
          value={wardFilter}
          onChange={e => setWardFilter(e.target.value)}
          style={{
            padding: '9px 14px', border: '1px solid var(--border-ui)', borderRadius: 8,
            fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)',
            color: 'var(--fg-on-light)', cursor: 'pointer', outline: 'none',
          }}
        >
          {WARDS.map(w => <option key={w}>{w}</option>)}
        </select>
      </div>

      {/* KPI mini cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total admitted', value: counts.Admitted, color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
          { label: 'Critical', value: counts.Critical, color: '#d95050', bg: 'rgba(217,80,80,0.08)' },
          { label: 'Discharged today', value: 2, color: '#15803d', bg: 'rgba(78,179,116,0.08)' },
          { label: 'Avg. stay (days)', value: '4.8', color: 'var(--fg-on-light-muted)', bg: 'var(--surface-subtle)' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 300, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.8fr 0.7fr 90px',
          padding: '12px 20px', background: 'var(--surface-subtle)',
          fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--fg-on-light-muted)', fontWeight: 600,
        }}>
          <div>Patient</div>
          <div>Diagnosis</div>
          <div>Doctor</div>
          <div>Ward / Bed</div>
          <div>Since</div>
          <div>Days</div>
          <div style={{ textAlign: 'right' }}>Status</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
            No admissions match the selected filters.
          </div>
        ) : filtered.map(a => {
          const s = STATUS_MAP[a.status];
          return (
            <div
              key={a.id}
              onClick={() => navigate(`/admissions/${a.id}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.8fr 0.7fr 90px',
                padding: '14px 20px',
                borderTop: '1px solid var(--border-card)',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: 'var(--surface-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: 'var(--fg-on-light)', flexShrink: 0,
                }}>{a.initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)' }}>{a.patient}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>{a.id}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{a.diagnosis}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>{a.doctor}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>
                <span style={{ fontWeight: 500 }}>{a.ward}</span>
                <span style={{ color: 'var(--fg-on-light-muted)' }}> · {a.bed}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>{a.since.split(' ').slice(0, 2).join(' ')}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-on-light)', fontWeight: 500 }}>{a.days}</div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 500 }}>
                  {a.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
