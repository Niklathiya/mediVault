import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Stethoscope, HeartPulse, FlaskConical, Briefcase, UserCheck, Phone, Mail, Plus } from 'lucide-react';

const STAFF = {
  doctors: [
    { id: 'D001', name: 'Dr. Priya Mehta', initials: 'PM', role: 'Senior Surgeon', dept: 'Surgery', phone: '98001 11001', email: 'p.mehta@baps.org', status: 'Active', exp: '14 yrs' },
    { id: 'D002', name: 'Dr. Arjun Rao', initials: 'AR', role: 'Cardiologist', dept: 'Cardiology', phone: '98001 11002', email: 'a.rao@baps.org', status: 'Active', exp: '11 yrs' },
    { id: 'D003', name: 'Dr. Kavita Singh', initials: 'KS', role: 'Obstetrician', dept: 'Maternity', phone: '98001 11003', email: 'k.singh@baps.org', status: 'Active', exp: '9 yrs' },
    { id: 'D004', name: 'Dr. Rajan Iyer', initials: 'RI', role: 'Orthopaedic Surgeon', dept: 'Ortho', phone: '98001 11004', email: 'r.iyer@baps.org', status: 'On Leave', exp: '16 yrs' },
    { id: 'D005', name: 'Dr. Neha Patel', initials: 'NP', role: 'Paediatrician', dept: 'Paediatrics', phone: '98001 11005', email: 'n.patel@baps.org', status: 'Active', exp: '7 yrs' },
  ],
  nurses: [
    { id: 'N001', name: 'Lata Verma', initials: 'LV', role: 'Head Nurse', dept: 'ICU', phone: '98002 22001', email: 'l.verma@baps.org', status: 'Active', exp: '12 yrs' },
    { id: 'N002', name: 'Sunita Joshi', initials: 'SJ', role: 'Senior Nurse', dept: 'General', phone: '98002 22002', email: 's.joshi@baps.org', status: 'Active', exp: '8 yrs' },
    { id: 'N003', name: 'Meera Nair', initials: 'MN', role: 'Staff Nurse', dept: 'Surgery', phone: '98002 22003', email: 'm.nair@baps.org', status: 'Active', exp: '5 yrs' },
    { id: 'N004', name: 'Rekha Sharma', initials: 'RS', role: 'Staff Nurse', dept: 'Maternity', phone: '98002 22004', email: 'r.sharma@baps.org', status: 'Active', exp: '6 yrs' },
  ],
  paramedical: [
    { id: 'P001', name: 'Ravi Kumar', initials: 'RK', role: 'Lab Technician', dept: 'Pathology', phone: '98003 33001', email: 'r.kumar@baps.org', status: 'Active', exp: '6 yrs' },
    { id: 'P002', name: 'Asha Devi', initials: 'AD', role: 'Radiographer', dept: 'Radiology', phone: '98003 33002', email: 'a.devi@baps.org', status: 'Active', exp: '9 yrs' },
    { id: 'P003', name: 'Mohan Das', initials: 'MD', role: 'Physiotherapist', dept: 'Physio', phone: '98003 33003', email: 'm.das@baps.org', status: 'Active', exp: '4 yrs' },
  ],
  admin: [
    { id: 'A001', name: 'Sanjay Gupta', initials: 'SG', role: 'Hospital Administrator', dept: 'Administration', phone: '98004 44001', email: 's.gupta@baps.org', status: 'Active', exp: '15 yrs' },
    { id: 'A002', name: 'Anita Tiwari', initials: 'AT', role: 'Accounts Manager', dept: 'Finance', phone: '98004 44002', email: 'a.tiwari@baps.org', status: 'Active', exp: '10 yrs' },
    { id: 'A003', name: 'Vikram Singh', initials: 'VS', role: 'Reception Manager', dept: 'Front Desk', phone: '98004 44003', email: 'v.singh@baps.org', status: 'Active', exp: '7 yrs' },
  ],
  support: [
    { id: 'S001', name: 'Ganesh Yadav', initials: 'GY', role: 'Security Supervisor', dept: 'Security', phone: '98005 55001', email: 'g.yadav@baps.org', status: 'Active', exp: '8 yrs' },
    { id: 'S002', name: 'Kamla Devi', initials: 'KD', role: 'Housekeeping Lead', dept: 'Housekeeping', phone: '98005 55002', email: 'k.devi@baps.org', status: 'Active', exp: '5 yrs' },
  ],
};

const TABS = [
  { key: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/staff/doctors' },
  { key: 'nurses', label: 'Nurses', icon: HeartPulse, path: '/staff/nurses' },
  { key: 'paramedical', label: 'Paramedical', icon: FlaskConical, path: '/staff/paramedical' },
  { key: 'admin', label: 'Administration', icon: Briefcase, path: '/staff/admin' },
  { key: 'support', label: 'Support Staff', icon: UserCheck, path: '/staff/support' },
];

const STATUS_STYLE = {
  Active: { color: '#15803d', bg: 'rgba(78,179,116,0.12)' },
  'On Leave': { color: '#d9a441', bg: 'rgba(217,164,65,0.12)' },
};

export default function Staff() {
  const location = useLocation();
  const activeKey = TABS.find(t => location.pathname.endsWith(t.key))?.key ?? 'doctors';
  const [tab, setTab] = useState(activeKey);
  const members = STAFF[tab] ?? [];

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
            {members.length} members
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>Staff Directory</h1>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Add staff member
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-ui)', marginBottom: 24 }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 16px', fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--fg-on-light)' : 'var(--fg-on-light-muted)',
                borderBottom: `2px solid ${isActive ? '#0891b2' : 'transparent'}`,
                background: 'transparent', border: 'none',
                borderBottomWidth: 2, cursor: 'pointer',
                marginBottom: -1, transition: 'color 120ms',
                whiteSpace: 'nowrap', fontFamily: 'inherit',
              }}
            >
              <Icon size={15} />
              {t.label}
              <span style={{
                fontSize: 11,
                background: isActive ? 'var(--surface-subtle)' : 'transparent',
                color: 'var(--fg-on-light-muted)',
                padding: '1px 6px', borderRadius: 8,
              }}>
                {STAFF[t.key].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Staff cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {members.map(m => {
          const s = STATUS_STYLE[m.status] ?? STATUS_STYLE.Active;
          return (
            <div
              key={m.id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border-card)',
                borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'box-shadow 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.10)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'var(--fg-on-light)', flexShrink: 0,
                }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>{m.role}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-on-light-subtle)', marginTop: 1 }}>{m.dept} · {m.exp}</div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 500, flexShrink: 0 }}>
                  {m.status}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-on-light-muted)' }}>
                  <Phone size={12} color="var(--fg-on-light-subtle)" /> {m.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-on-light-muted)' }}>
                  <Mail size={12} color="var(--fg-on-light-subtle)" /> {m.email}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
