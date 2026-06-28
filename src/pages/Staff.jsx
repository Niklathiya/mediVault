import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Briefcase,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  BadgeCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

// ── DATA ─────────────────────────────────────────────────────────────────────

const STAFF = {
  doctors: [
    {
      id: 'D001',
      initials: 'PM',
      name: 'Dr. Priya Mehta',
      specialization: 'General Surgery',
      qualification: 'MS, MBBS',
      dept: 'Surgery',
      regNo: 'MH-GMC-14821',
      phone: '98001 11001',
      email: 'p.mehta@medivault.org',
      joiningDate: '15 Mar 2010',
      status: 'Active',
    },
    {
      id: 'D002',
      initials: 'AR',
      name: 'Dr. Arjun Rao',
      specialization: 'Interventional Cardiology',
      qualification: 'DM, MD, MBBS',
      dept: 'Cardiology',
      regNo: 'MH-GMC-18304',
      phone: '98001 11002',
      email: 'a.rao@medivault.org',
      joiningDate: '03 Jul 2013',
      status: 'Active',
    },
    {
      id: 'D003',
      initials: 'KS',
      name: 'Dr. Kavita Singh',
      specialization: 'Obstetrics & Gynaecology',
      qualification: 'MS (OBG), MBBS',
      dept: 'Maternity',
      regNo: 'MH-GMC-20117',
      phone: '98001 11003',
      email: 'k.singh@medivault.org',
      joiningDate: '20 Jan 2015',
      status: 'Active',
    },
    {
      id: 'D004',
      initials: 'RI',
      name: 'Dr. Rajan Iyer',
      specialization: 'Orthopaedic Surgery',
      qualification: 'MS (Ortho), MBBS',
      dept: 'Orthopaedics',
      regNo: 'MH-GMC-09842',
      phone: '98001 11004',
      email: 'r.iyer@medivault.org',
      joiningDate: '01 Apr 2008',
      status: 'On Leave',
    },
    {
      id: 'D005',
      initials: 'NP',
      name: 'Dr. Neha Patel',
      specialization: 'Paediatrics',
      qualification: 'MD (Paed), MBBS',
      dept: 'Paediatrics',
      regNo: 'MH-GMC-22508',
      phone: '98001 11005',
      email: 'n.patel@medivault.org',
      joiningDate: '10 Sep 2017',
      status: 'Active',
    },
    {
      id: 'D006',
      initials: 'VK',
      name: 'Dr. Vivek Kulkarni',
      specialization: 'Neurology',
      qualification: 'DM (Neuro), MD, MBBS',
      dept: 'Neurology',
      regNo: 'MH-GMC-16634',
      phone: '98001 11006',
      email: 'v.kulkarni@medivault.org',
      joiningDate: '22 Feb 2012',
      status: 'Active',
    },
  ],
  nurses: [
    {
      id: 'N001',
      initials: 'LV',
      name: 'Lata Verma',
      designation: 'Head Nurse',
      ward: 'ICU',
      shift: 'Day',
      regNo: 'NMC-22341',
      phone: '98002 22001',
      email: 'l.verma@medivault.org',
      joiningDate: '01 Jan 2012',
      status: 'Active',
    },
    {
      id: 'N002',
      initials: 'SJ',
      name: 'Sunita Joshi',
      designation: 'Staff Nurse',
      ward: 'General',
      shift: 'Night',
      regNo: 'NMC-28904',
      phone: '98002 22002',
      email: 's.joshi@medivault.org',
      joiningDate: '15 Jun 2016',
      status: 'Active',
    },
    {
      id: 'N003',
      initials: 'MN',
      name: 'Meera Nair',
      designation: 'ICU Nurse',
      ward: 'ICU',
      shift: 'Rotation',
      regNo: 'NMC-31205',
      phone: '98002 22003',
      email: 'm.nair@medivault.org',
      joiningDate: '08 Mar 2019',
      status: 'Active',
    },
    {
      id: 'N004',
      initials: 'RS',
      name: 'Rekha Sharma',
      designation: 'Staff Nurse',
      ward: 'Maternity',
      shift: 'Day',
      regNo: 'NMC-29678',
      phone: '98002 22004',
      email: 'r.sharma@medivault.org',
      joiningDate: '20 Oct 2018',
      status: 'On Leave',
    },
    {
      id: 'N005',
      initials: 'PA',
      name: 'Pooja Ahuja',
      designation: 'Nursing Assistant',
      ward: 'Semi-Private',
      shift: 'Night',
      regNo: 'NMC-34512',
      phone: '98002 22005',
      email: 'p.ahuja@medivault.org',
      joiningDate: '05 May 2021',
      status: 'Active',
    },
  ],
  paramedical: [
    {
      id: 'P001',
      initials: 'RK',
      name: 'Ravi Kumar',
      role: 'Lab Technician',
      dept: 'Pathology',
      qualification: 'DMLT',
      phone: '98003 33001',
      email: 'r.kumar@medivault.org',
      joiningDate: '01 Apr 2018',
      status: 'Active',
    },
    {
      id: 'P002',
      initials: 'AD',
      name: 'Asha Devi',
      role: 'Radiologist Technician',
      dept: 'Radiology',
      qualification: 'B.Sc Radiology',
      phone: '98003 33002',
      email: 'a.devi@medivault.org',
      joiningDate: '12 Nov 2015',
      status: 'Active',
    },
    {
      id: 'P003',
      initials: 'MD',
      name: 'Mohan Das',
      role: 'Physiotherapist',
      dept: 'Physiotherapy',
      qualification: 'BPTh',
      phone: '98003 33003',
      email: 'm.das@medivault.org',
      joiningDate: '18 Feb 2020',
      status: 'Active',
    },
    {
      id: 'P004',
      initials: 'SP',
      name: 'Swati Pillai',
      role: 'Pharmacist',
      dept: 'Pharmacy',
      qualification: 'B.Pharm',
      phone: '98003 33004',
      email: 's.pillai@medivault.org',
      joiningDate: '07 Aug 2019',
      status: 'Active',
    },
  ],
  admin: [
    {
      id: 'A001',
      initials: 'SG',
      name: 'Sanjay Gupta',
      role: 'Administrator',
      dept: 'Administration',
      phone: '98004 44001',
      email: 's.gupta@medivault.org',
      joiningDate: '01 Jun 2009',
      status: 'Active',
    },
    {
      id: 'A002',
      initials: 'AT',
      name: 'Anita Tiwari',
      role: 'Accounts Officer',
      dept: 'Finance',
      phone: '98004 44002',
      email: 'a.tiwari@medivault.org',
      joiningDate: '10 Mar 2014',
      status: 'Active',
    },
    {
      id: 'A003',
      initials: 'VS',
      name: 'Vikram Singh',
      role: 'Receptionist',
      dept: 'Front Desk',
      phone: '98004 44003',
      email: 'v.singh@medivault.org',
      joiningDate: '25 Jul 2017',
      status: 'Active',
    },
    {
      id: 'A004',
      initials: 'PM',
      name: 'Pallavi Mishra',
      role: 'Medical Records Officer',
      dept: 'Records',
      phone: '98004 44004',
      email: 'p.mishra@medivault.org',
      joiningDate: '14 Jan 2020',
      status: 'Active',
    },
  ],
  support: [
    {
      id: 'S001',
      initials: 'GY',
      name: 'Ganesh Yadav',
      role: 'Security Guard',
      shift: 'Day',
      phone: '98005 55001',
      joiningDate: '01 Mar 2016',
      status: 'Active',
    },
    {
      id: 'S002',
      initials: 'KD',
      name: 'Kamla Devi',
      role: 'Housekeeping',
      shift: 'Day',
      phone: '98005 55002',
      joiningDate: '15 Sep 2018',
      status: 'Active',
    },
    {
      id: 'S003',
      initials: 'RB',
      name: 'Ramu Bhai',
      role: 'Ward Boy',
      shift: 'Night',
      phone: '98005 55003',
      joiningDate: '20 Feb 2020',
      status: 'Active',
    },
    {
      id: 'S004',
      initials: 'SA',
      name: 'Santosh Ahir',
      role: 'Ambulance Driver',
      shift: 'Rotation',
      phone: '98005 55004',
      joiningDate: '11 Nov 2017',
      status: 'On Leave',
    },
    {
      id: 'S005',
      initials: 'BD',
      name: 'Bhavna Desai',
      role: 'Laundry Staff',
      shift: 'Day',
      phone: '98005 55005',
      joiningDate: '05 Apr 2019',
      status: 'Active',
    },
  ],
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/staff/doctors' },
  { key: 'nurses', label: 'Nurses', icon: HeartPulse, path: '/staff/nurses' },
  { key: 'paramedical', label: 'Paramedical', icon: FlaskConical, path: '/staff/paramedical' },
  { key: 'admin', label: 'Administration', icon: Briefcase, path: '/staff/admin' },
  { key: 'support', label: 'Support Staff', icon: UserCheck, path: '/staff/support' },
];

const TAB_META = {
  doctors: { title: 'Doctors', plural: 'doctors', addLabel: 'Add Doctor' },
  nurses: { title: 'Nursing Staff', plural: 'nurses', addLabel: 'Add Nurse' },
  paramedical: { title: 'Paramedical', plural: 'staff', addLabel: 'Add Staff' },
  admin: { title: 'Administration', plural: 'staff', addLabel: 'Add Staff' },
  support: { title: 'Support Staff', plural: 'staff', addLabel: 'Add Staff' },
};

const AVATAR_COLOR = {
  doctors: '#0891b2',
  nurses: '#2d6a9f',
  paramedical: '#5b8a3c',
  admin: '#7c5a9b',
  support: '#6b7280',
};

const STATUS_STYLE = {
  Active: { color: '#15803d', bg: 'rgba(78,179,116,0.12)' },
  'On Leave': { color: '#854d0e', bg: 'rgba(253,224,71,0.2)' },
  Inactive: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const SHIFT_OPTS = ['Day', 'Night', 'Rotation'];
const STATUS_OPTS = ['Active', 'On Leave', 'Inactive'];
const NURSE_DES = ['Head Nurse', 'Staff Nurse', 'ICU Nurse', 'Nursing Assistant'];
const NURSE_WARD = ['General', 'Semi-Private', 'Private', 'ICU'];
const PARA_ROLES = [
  'Lab Technician',
  'Radiologist Technician',
  'Pharmacist',
  'Physiotherapist',
  'Dietitian',
  'ECG Technician',
  'OT Technician',
];
const ADMIN_ROLES = [
  'Receptionist',
  'Billing Executive',
  'Medical Records Officer',
  'HR Manager',
  'Accounts Officer',
  'IT Executive',
  'Administrator',
];
const SUPPORT_ROLES = [
  'Ward Boy',
  'Ward Attendant',
  'Housekeeping',
  'Security Guard',
  'Ambulance Driver',
  'Cook/Kitchen Staff',
  'Laundry Staff',
];

const EMPTY_FORM = {
  doctors: {
    name: '',
    specialization: '',
    qualification: '',
    dept: '',
    regNo: '',
    phone: '',
    email: '',
    joiningDate: '',
    status: 'Active',
  },
  nurses: {
    name: '',
    designation: 'Staff Nurse',
    ward: 'General',
    shift: 'Day',
    regNo: '',
    phone: '',
    email: '',
    joiningDate: '',
    status: 'Active',
  },
  paramedical: {
    name: '',
    role: 'Lab Technician',
    dept: '',
    qualification: '',
    phone: '',
    email: '',
    joiningDate: '',
    status: 'Active',
  },
  admin: {
    name: '',
    role: 'Receptionist',
    dept: '',
    phone: '',
    email: '',
    joiningDate: '',
    status: 'Active',
  },
  support: {
    name: '',
    role: 'Security Guard',
    shift: 'Day',
    phone: '',
    joiningDate: '',
    status: 'Active',
  },
};

// ── STYLES ────────────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 6,
  fontFamily: 'inherit',
  fontSize: 14,
  outline: 'none',
  color: 'var(--fg-on-light)',
  background: 'var(--bg-canvas)',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--fg-on-light-muted)',
  marginBottom: 4,
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--surface-subtle)', borderRadius: 6, padding: '8px 10px' }}>
      <div
        style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--fg-on-light-muted)',
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--fg-on-light)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: 12,
        color: 'var(--fg-on-light-muted)',
      }}
    >
      <Icon size={12} style={{ color: 'var(--fg-on-light-subtle)', flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </div>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <div style={{ position: 'relative', marginTop: 4 }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          ...inputStyle,
          appearance: 'none',
          WebkitAppearance: 'none',
          paddingRight: 34,
          cursor: 'pointer',
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--fg-on-light-muted)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function StaffCard({ m, tab, onEdit, onDelete }) {
  const s = STATUS_STYLE[m.status] ?? STATUS_STYLE.Active;
  const avatarSize = tab === 'support' ? 40 : 44;
  const isSupport = tab === 'support';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-card)',
        borderRadius: 12,
        padding: isSupport ? 18 : 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'box-shadow 120ms',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.10)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Top row: avatar + name + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: '50%',
            background: AVATAR_COLOR[tab],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isSupport ? 12 : 14,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {m.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: isSupport ? 13 : 14,
              fontWeight: 600,
              color: 'var(--fg-on-light)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {m.name}
          </div>
          <div
            style={{
              fontSize: isSupport ? 11 : 12,
              color: 'var(--fg-on-light-muted)',
              marginTop: 1,
            }}
          >
            {tab === 'doctors' ? m.specialization : tab === 'nurses' ? m.designation : m.role}
          </div>
          {isSupport && (
            <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: s.bg,
                  color: s.color,
                  fontWeight: 500,
                }}
              >
                {m.status}
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: 'var(--surface-subtle)',
                  color: 'var(--fg-on-light-muted)',
                  fontWeight: 500,
                }}
              >
                {m.shift}
              </span>
            </div>
          )}
        </div>
        {!isSupport && (
          <span
            style={{
              fontSize: 11,
              padding: '3px 9px',
              borderRadius: 10,
              background: s.bg,
              color: s.color,
              fontWeight: 500,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {m.status}
          </span>
        )}
      </div>

      {/* Info boxes */}
      {!isSupport && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: tab === 'admin' ? '1fr' : '1fr 1fr',
            gap: 8,
          }}
        >
          {tab === 'doctors' && (
            <>
              <InfoBox label="Qualification" value={m.qualification} />
              <InfoBox label="Department" value={m.dept} />
            </>
          )}
          {tab === 'nurses' && (
            <>
              <InfoBox label="Ward" value={m.ward} />
              <InfoBox label="Shift" value={m.shift} />
            </>
          )}
          {tab === 'paramedical' && (
            <>
              <InfoBox label="Department" value={m.dept} />
              <InfoBox label="Qualification" value={m.qualification} />
            </>
          )}
          {tab === 'admin' && <InfoBox label="Department" value={m.dept} />}
        </div>
      )}

      {/* Contact details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isSupport ? 4 : 5 }}>
        {(tab === 'doctors' || tab === 'nurses') && m.regNo && (
          <ContactRow icon={BadgeCheck}>{m.regNo}</ContactRow>
        )}
        <ContactRow icon={Phone}>{m.phone}</ContactRow>
        {(tab === 'doctors' || tab === 'paramedical' || tab === 'admin') && m.email && (
          <ContactRow icon={Mail}>{m.email}</ContactRow>
        )}
        {m.joiningDate && <ContactRow icon={Calendar}>Joined: {m.joiningDate}</ContactRow>}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          borderTop: '1px solid var(--border-card)',
          paddingTop: 10,
          marginTop: 2,
        }}
      >
        <button
          onClick={() => onEdit(m)}
          style={{
            flex: 1,
            background: 'transparent',
            border: '1px solid rgba(15,23,42,0.10)',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            padding: isSupport ? '6px' : '7px',
            fontSize: isSupport ? 11 : 12,
            fontFamily: 'inherit',
            color: 'var(--fg-on-light)',
            fontWeight: 500,
            transition: 'background 120ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Pencil size={isSupport ? 10 : 11} /> Edit
        </button>
        <button
          onClick={() => onDelete(m.id)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(217,80,80,0.30)',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isSupport ? '6px 10px' : '7px 12px',
            color: '#d95050',
            transition: 'background 120ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(217,80,80,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Trash2 size={isSupport ? 11 : 12} />
        </button>
      </div>
    </div>
  );
}

function StaffModal({ tab, member, onClose, onSave }) {
  const isNew = !member;
  const [form, setForm] = useState(member ? { ...member } : { ...EMPTY_FORM[tab] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  const meta = TAB_META[tab];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 560, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'var(--surface)',
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>
              {isNew ? meta.addLabel : `Edit ${member.name}`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>
              {meta.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--fg-on-light-muted)',
              display: 'flex',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form — 2-col grid for most fields; email below grid = guaranteed full width */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* ── Always: Name | Status ── */}
            <label>
              <span style={labelStyle}>Full Name *</span>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Enter full name"
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
            <label>
              <span style={labelStyle}>Status</span>
              <SelectField value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </SelectField>
            </label>

            {/* ── Doctors: Specialization | Qualification, Reg No | Department ── */}
            {tab === 'doctors' && (
              <label>
                <span style={labelStyle}>Specialization *</span>
                <input
                  value={form.specialization}
                  onChange={(e) => set('specialization', e.target.value)}
                  placeholder="e.g. General Surgery"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
            {tab === 'doctors' && (
              <label>
                <span style={labelStyle}>Qualification</span>
                <input
                  value={form.qualification}
                  onChange={(e) => set('qualification', e.target.value)}
                  placeholder="e.g. MS, MBBS"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
            {tab === 'doctors' && (
              <label>
                <span style={labelStyle}>Reg. No. (GMC)</span>
                <input
                  value={form.regNo}
                  onChange={(e) => set('regNo', e.target.value)}
                  placeholder="e.g. MH-GMC-12345"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
            {tab === 'doctors' && (
              <label>
                <span style={labelStyle}>Department</span>
                <input
                  value={form.dept}
                  onChange={(e) => set('dept', e.target.value)}
                  placeholder="e.g. Surgery"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}

            {/* ── Nurses: Designation | Ward, Reg No | Shift ── */}
            {tab === 'nurses' && (
              <label>
                <span style={labelStyle}>Designation</span>
                <SelectField
                  value={form.designation}
                  onChange={(e) => set('designation', e.target.value)}
                >
                  {NURSE_DES.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </SelectField>
              </label>
            )}
            {tab === 'nurses' && (
              <label>
                <span style={labelStyle}>Ward</span>
                <SelectField value={form.ward} onChange={(e) => set('ward', e.target.value)}>
                  {NURSE_WARD.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </SelectField>
              </label>
            )}
            {tab === 'nurses' && (
              <label>
                <span style={labelStyle}>Reg. No. (NMC)</span>
                <input
                  value={form.regNo}
                  onChange={(e) => set('regNo', e.target.value)}
                  placeholder="NMC-00000"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
            {tab === 'nurses' && (
              <label>
                <span style={labelStyle}>Shift</span>
                <SelectField value={form.shift} onChange={(e) => set('shift', e.target.value)}>
                  {SHIFT_OPTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectField>
              </label>
            )}

            {/* ── Paramedical: Role | Department, Qualification | Phone ── */}
            {tab === 'paramedical' && (
              <label>
                <span style={labelStyle}>Role</span>
                <SelectField value={form.role} onChange={(e) => set('role', e.target.value)}>
                  {PARA_ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectField>
              </label>
            )}
            {tab === 'paramedical' && (
              <label>
                <span style={labelStyle}>Department</span>
                <input
                  value={form.dept}
                  onChange={(e) => set('dept', e.target.value)}
                  placeholder="e.g. Pathology"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
            {tab === 'paramedical' && (
              <label>
                <span style={labelStyle}>Qualification</span>
                <input
                  value={form.qualification}
                  onChange={(e) => set('qualification', e.target.value)}
                  placeholder="e.g. DMLT"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
            {tab === 'paramedical' && (
              <label>
                <span style={labelStyle}>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="98000 00000"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}

            {/* ── Admin: Role | Department ── */}
            {tab === 'admin' && (
              <label>
                <span style={labelStyle}>Role</span>
                <SelectField value={form.role} onChange={(e) => set('role', e.target.value)}>
                  {ADMIN_ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectField>
              </label>
            )}
            {tab === 'admin' && (
              <label>
                <span style={labelStyle}>Department</span>
                <input
                  value={form.dept}
                  onChange={(e) => set('dept', e.target.value)}
                  placeholder="e.g. Finance"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}

            {/* ── Support: Role | Shift ── */}
            {tab === 'support' && (
              <label>
                <span style={labelStyle}>Role</span>
                <SelectField value={form.role} onChange={(e) => set('role', e.target.value)}>
                  {SUPPORT_ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectField>
              </label>
            )}
            {tab === 'support' && (
              <label>
                <span style={labelStyle}>Shift</span>
                <SelectField value={form.shift} onChange={(e) => set('shift', e.target.value)}>
                  {SHIFT_OPTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectField>
              </label>
            )}

            {/* ── Common: Phone | Joining Date (paramedical has phone above already) ── */}
            {tab !== 'paramedical' && (
              <label>
                <span style={labelStyle}>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="98000 00000"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
            <label>
              <span style={labelStyle}>Joining Date</span>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => set('joiningDate', e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>

            {/* ── Paramedical: Email pairs with Joining Date in same row ── */}
            {tab === 'paramedical' && (
              <label>
                <span style={labelStyle}>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="email@medivault.org"
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            )}
          </div>

          {/* ── Email: full width, outside grid, for all tabs except paramedical and support ── */}
          {(tab === 'doctors' || tab === 'nurses' || tab === 'admin') && (
            <label>
              <span style={labelStyle}>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="email@medivault.org"
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'var(--surface-subtle)',
            borderRadius: '0 0 16px 16px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--fg-on-light)',
              border: '1px solid var(--border-strong)',
              padding: '9px 16px',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Check size={15} /> {isNew ? 'Add Member' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function Staff() {
  const location = useLocation();
  const tab = TABS.find((t) => location.pathname.endsWith(t.key))?.key ?? 'doctors';
  const [staff, setStaff] = useState(STAFF);
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', member }

  const members = staff[tab] ?? [];
  const meta = TAB_META[tab];

  const openAdd = () => setModal({ mode: 'add', member: null });
  const openEdit = (m) => setModal({ mode: 'edit', member: m });
  const closeModal = () => setModal(null);

  const deleteMember = (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    setStaff((s) => ({ ...s, [tab]: s[tab].filter((m) => m.id !== id) }));
  };

  const saveMember = (formData) => {
    if (modalMode === 'add') {
      const prefix = { doctors: 'D', nurses: 'N', paramedical: 'P', admin: 'A', support: 'S' };
      const id = `${prefix[tab]}${String(staff[tab].length + 1).padStart(3, '0')}`;
      const words = formData.name.trim().split(' ');
      const initials = words
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      setStaff((s) => ({ ...s, [tab]: [...s[tab], { ...formData, id, initials }] }));
    } else {
      setStaff((s) => ({
        ...s,
        [tab]: s[tab].map((m) => (m.id === modalMember?.id ? { ...m, ...formData } : m)),
      }));
    }
    closeModal();
  };

  const isOpen = modal !== null;
  const modalMember = modal !== null ? modal.member : null;
  const modalMode = modal !== null ? modal.mode : null;

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--fg-on-light-muted)',
              fontWeight: 600,
            }}
          >
            {members.length} {meta.plural}
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 300,
              letterSpacing: '-0.02em',
              margin: '8px 0 0',
              color: 'var(--fg-on-light)',
            }}
          >
            {meta.title}
          </h1>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> {meta.addLabel}
        </button>
      </div>

      {/* Staff grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: tab === 'support' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          gap: 14,
        }}
      >
        {members.map((m) => (
          <StaffCard key={m.id} m={m} tab={tab} onEdit={openEdit} onDelete={deleteMember} />
        ))}
        {members.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 0',
              color: 'var(--fg-on-light-muted)',
              fontSize: 14,
            }}
          >
            No {meta.plural} found. Click "{meta.addLabel}" to add one.
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {isOpen &&
        createPortal(
          <StaffModal tab={tab} member={modalMember} onClose={closeModal} onSave={saveMember} />,
          document.body,
        )}
    </div>
  );
}
