import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, BedDouble, LogOut, LogIn, Trash2, AlertTriangle } from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';

const TODAY = '2026-06-28';

const INIT_ADMISSIONS = [
  {
    id: 'IPD-2026-042', ipNo: 'IP/2026/042', mrNo: 'PT-0128',
    patientName: 'Kiran Desai', initials: 'KD', hasAllergy: false,
    age: '34', sex: 'Male', blood: 'B+',
    ward: 'General', bedNo: '4A',
    admittedOn: '2026-06-23', admittedTime: '09:15 AM',
    reason: 'Abdominal pain, fever',
    admittingDoctor: 'Dr. Priya Mehta',
    status: 'admitted', dischargedOn: null, dischargedTime: null,
  },
  {
    id: 'IPD-2026-041', ipNo: 'IP/2026/041', mrNo: 'PT-0127',
    patientName: 'Meena Agarwal', initials: 'MA', hasAllergy: true,
    age: '52', sex: 'Female', blood: 'O+',
    ward: 'ICU', bedNo: '2',
    admittedOn: '2026-06-22', admittedTime: '02:30 PM',
    reason: 'Myocardial Infarction',
    admittingDoctor: 'Dr. Arjun Rao',
    status: 'admitted', dischargedOn: null, dischargedTime: null,
  },
  {
    id: 'IPD-2026-040', ipNo: 'IP/2026/040', mrNo: 'PT-0124',
    patientName: 'Ankit Mehta', initials: 'AM', hasAllergy: false,
    age: '28', sex: 'Male', blood: 'A+',
    ward: 'Surgery', bedNo: '7B',
    admittedOn: '2026-06-21', admittedTime: '11:00 AM',
    reason: 'Hernia Repair (elective)',
    admittingDoctor: 'Dr. Priya Mehta',
    status: 'admitted', dischargedOn: null, dischargedTime: null,
  },
  {
    id: 'IPD-2026-039', ipNo: 'IP/2026/039', mrNo: 'PT-0125',
    patientName: 'Priya Joshi', initials: 'PJ', hasAllergy: true,
    age: '28', sex: 'Female', blood: 'AB-',
    ward: 'Maternity', bedNo: '3',
    admittedOn: '2026-06-28', admittedTime: '06:45 AM',
    reason: 'Normal delivery / labour',
    admittingDoctor: 'Dr. Kavita Singh',
    status: 'admitted', dischargedOn: null, dischargedTime: null,
  },
  {
    id: 'IPD-2026-038', ipNo: 'IP/2026/038', mrNo: 'PT-0123',
    patientName: 'Vijay Kumar', initials: 'VK', hasAllergy: false,
    age: '45', sex: 'Male', blood: 'O-',
    ward: 'General', bedNo: '6C',
    admittedOn: '2026-06-19', admittedTime: '08:20 AM',
    reason: 'Dengue fever, thrombocytopenia',
    admittingDoctor: 'Dr. Arjun Rao',
    status: 'admitted', dischargedOn: null, dischargedTime: null,
  },
  {
    id: 'IPD-2026-037', ipNo: 'IP/2026/037', mrNo: 'PT-0122',
    patientName: 'Rekha Nair', initials: 'RN', hasAllergy: false,
    age: '38', sex: 'Female', blood: 'A-',
    ward: 'Ortho', bedNo: '2A',
    admittedOn: '2026-06-16', admittedTime: '10:00 AM',
    reason: 'Femur fracture, fall',
    admittingDoctor: 'Dr. Kavita Singh',
    status: 'discharged', dischargedOn: '2026-06-26', dischargedTime: '11:30 AM',
  },
  {
    id: 'IPD-2026-036', ipNo: 'IP/2026/036', mrNo: 'PT-0121',
    patientName: 'Santosh Gupta', initials: 'SG', hasAllergy: true,
    age: '55', sex: 'Male', blood: 'B-',
    ward: 'General', bedNo: '1B',
    admittedOn: '2026-06-14', admittedTime: '03:15 PM',
    reason: 'Typhoid fever',
    admittingDoctor: 'Dr. Priya Mehta',
    status: 'discharged', dischargedOn: '2026-06-27', dischargedTime: '09:00 AM',
  },
];

const STATUS_BADGE = {
  admitted:   { label: 'Admitted',   color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  discharged: { label: 'Discharged', color: '#15803d', bg: 'rgba(78,179,116,0.10)' },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[+m - 1]} ${y}`;
};

const daysAdmitted = (admittedOn, dischargedOn) => {
  const end = dischargedOn || TODAY;
  return Math.max(1, Math.floor((new Date(end) - new Date(admittedOn)) / 86400000) + 1);
};

const iconBtn = {
  background: 'transparent', border: '1px solid var(--border-ui)',
  width: 30, height: 30, borderRadius: 6,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'var(--fg-on-light)', flexShrink: 0,
};

const selectStyle = {
  padding: '9px 14px', border: '1px solid var(--border-ui)', borderRadius: 8,
  fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)',
  color: 'var(--fg-on-light)', cursor: 'pointer', outline: 'none',
};

export default function Admissions() {
  const navigate = useNavigate();
  const { openNewAdmissionModal } = useOutletContext();

  const [admissions, setAdmissions] = useState(INIT_ADMISSIONS);
  const [statusFilter, setStatusFilter] = useState('admitted');
  const [wardFilter, setWardFilter] = useState('all');

  const wards = [...new Set(admissions.map((a) => a.ward))].sort();

  const filtered = admissions.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (wardFilter   !== 'all' && a.ward   !== wardFilter)   return false;
    return true;
  });

  const admittedArr   = admissions.filter((a) => a.status === 'admitted');
  const admittedToday = admissions.filter((a) => a.admittedOn === TODAY);
  const icuCount      = admissions.filter((a) => a.status === 'admitted' && a.ward === 'ICU').length;

  const toggleDischarge = (id, e) => {
    e.stopPropagation();
    setAdmissions((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      return a.status === 'admitted'
        ? { ...a, status: 'discharged', dischargedOn: TODAY, dischargedTime: '—' }
        : { ...a, status: 'admitted', dischargedOn: null, dischargedTime: null };
    }));
  };

  const deleteAdmission = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this admission record?')) {
      setAdmissions((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
            {filtered.length} admissions
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 4px', color: 'var(--fg-on-light)' }}>
            IPD Admissions
          </h1>
          <p style={{ margin: 0, color: 'var(--fg-on-light-muted)', fontSize: 13, lineHeight: 1.5 }}>
            Each admission carries the full digital case file: consent, history, triage, care plan, medications, notes, investigations &amp; visits.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <CustomSelect style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="admitted">Currently admitted</option>
            <option value="discharged">Discharged</option>
            <option value="all">All admissions</option>
          </CustomSelect>
          <button className="btn-primary" onClick={openNewAdmissionModal}>
            <Plus size={16} /> Admit patient
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Currently admitted', value: admittedArr.length,     color: '#0891b2' },
          { label: 'Admitted today',     value: admittedToday.length,   color: 'var(--fg-on-light)' },
          { label: 'In ICU',             value: icuCount,               color: '#d95050' },
          { label: 'Total admissions',   value: admissions.length,      color: 'var(--fg-on-light)' },
        ].map((k) => (
          <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 300, color: k.color, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Ward filter */}
      {wardFilter !== 'all' || wards.length > 1 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <CustomSelect style={selectStyle} value={wardFilter} onChange={(e) => setWardFilter(e.target.value)}>
            <option value="all">All wards</option>
            {wards.map((w) => <option key={w} value={w}>{w}</option>)}
          </CustomSelect>
        </div>
      ) : null}

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1.6fr 1fr 130px 1fr 110px 90px', padding: '12px 20px', background: 'var(--surface-subtle)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
          <div>IP No.</div>
          <div>Patient</div>
          <div>Ward / Bed</div>
          <div>Admitted</div>
          <div>Doctor</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--fg-on-light-muted)' }}>
            <BedDouble size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
            <div style={{ fontSize: 14, marginTop: 8 }}>No admissions in this view.</div>
          </div>
        ) : (
          filtered.map((a) => {
            const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.admitted;
            const days  = daysAdmitted(a.admittedOn, a.dischargedOn);
            return (
              <div
                key={a.id}
                onClick={() => navigate(`/admissions/${a.id}`)}
                style={{ display: 'grid', gridTemplateColumns: '130px 1.6fr 1fr 130px 1fr 110px 90px', padding: '14px 20px', borderTop: '1px solid var(--border-card)', alignItems: 'center', cursor: 'pointer', transition: 'background 120ms' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* IP No. */}
                <div>
                  <div style={{ fontWeight: 600, color: '#0891b2', fontSize: 13 }}>{a.ipNo}</div>
                  <div style={{ fontSize: 10, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>MR · {a.mrNo}</div>
                </div>

                {/* Patient */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--fg-on-light)', flexShrink: 0 }}>
                    {a.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {a.patientName}
                      {a.hasAllergy && <AlertTriangle size={12} color="#d95050" />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 1 }}>
                      {a.age} yrs / {a.sex === 'Male' ? 'M' : 'F'} · {a.reason.length > 28 ? a.reason.slice(0, 28) + '…' : a.reason}
                    </div>
                  </div>
                </div>

                {/* Ward / Bed */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)' }}>{a.ward}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>Bed {a.bedNo}</div>
                </div>

                {/* Admitted */}
                <div>
                  <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{fmtDate(a.admittedOn)}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>{a.admittedTime} · {days}d</div>
                </div>

                {/* Doctor */}
                <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{a.admittingDoctor}</div>

                {/* Status */}
                <div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: badge.bg, color: badge.color, fontWeight: 500 }}>
                    {badge.label}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => toggleDischarge(a.id, e)}
                    title={a.status === 'admitted' ? 'Mark discharged' : 'Re-admit'}
                    style={{ ...iconBtn, color: a.status === 'admitted' ? '#0891b2' : '#15803d' }}
                  >
                    {a.status === 'admitted' ? <LogOut size={13} /> : <LogIn size={13} />}
                  </button>
                  <button
                    onClick={(e) => deleteAdmission(a.id, e)}
                    title="Delete admission"
                    style={{ ...iconBtn, border: '1px solid rgba(217,80,80,0.30)', color: '#d95050' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
