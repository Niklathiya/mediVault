import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { subscribeStaffByRole, addStaff, updateStaff, deleteStaff } from '../firebase/services/staffService.js';
import { useRBAC } from '../context/RBACContext';
import {
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Briefcase,
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


// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/staff/doctors' },
  { key: 'nurses', label: 'Nurses', icon: HeartPulse, path: '/staff/nurses' },
  { key: 'paramedical', label: 'Paramedical', icon: FlaskConical, path: '/staff/paramedical' },
  { key: 'admin', label: 'Administration', icon: Briefcase, path: '/staff/admin' },
];

const TAB_META = {
  doctors: { title: 'Doctors', plural: 'doctors', addLabel: 'Add Doctor' },
  nurses: { title: 'Nursing Staff', plural: 'nurses', addLabel: 'Add Nurse' },
  paramedical: { title: 'Paramedical', plural: 'staff', addLabel: 'Add Staff' },
  admin: { title: 'Administration', plural: 'staff', addLabel: 'Add Staff' },
};

const AVATAR_COLOR = {
  doctors: '#0891b2',
  nurses: '#2d6a9f',
  paramedical: '#5b8a3c',
  admin: '#7c5a9b',
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

function StaffCard({ m, tab, onEdit, onDelete, canManage }) {
  const s = STATUS_STYLE[m.status] ?? STATUS_STYLE.Active;

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-card)',
        borderRadius: 12,
        padding: 20,
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
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: AVATAR_COLOR[tab],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
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
              fontSize: 14,
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
              fontSize: 12,
              color: 'var(--fg-on-light-muted)',
              marginTop: 1,
            }}
          >
            {tab === 'doctors' ? m.specialization : tab === 'nurses' ? m.designation : m.role}
          </div>
        </div>
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
      </div>

      {/* Info boxes */}
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

      {/* Contact details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {(tab === 'doctors' || tab === 'nurses') && m.regNo && (
          <ContactRow icon={BadgeCheck}>{m.regNo}</ContactRow>
        )}
        <ContactRow icon={Phone}>{m.phone}</ContactRow>
        {(tab === 'doctors' || tab === 'paramedical' || tab === 'admin') && m.email && (
          <ContactRow icon={Mail}>{m.email}</ContactRow>
        )}
        {m.joiningDate && <ContactRow icon={Calendar}>Joined: {m.joiningDate}</ContactRow>}
      </div>

      {/* Action buttons — only visible to admin (canManage) */}
      {canManage && (
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
            padding: '7px',
            fontSize: 12,
            fontFamily: 'inherit',
            color: 'var(--fg-on-light)',
            fontWeight: 500,
            transition: 'background 120ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Pencil size={11} /> Edit
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
            padding: '7px 12px',
            color: '#d95050',
            transition: 'background 120ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(217,80,80,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Trash2 size={12} />
        </button>
      </div>
      )}
    </div>
  );
}

const ensureIsoDate = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) return dateStr;
  
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }

  const months = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1].substring(0, 3).toLowerCase()];
    const year = parts[2];
    if (month) return `${year}-${month}-${day}`;
  }
  return dateStr;
};

const formatDmyDate = (isoStr) => {
  if (!isoStr || !isoStr.includes('-')) return isoStr;
  const [year, month, day] = isoStr.split('-');
  return `${day}/${month}/${year}`;
};

function StaffModal({ tab, member, onClose, onSave }) {
  const isNew = !member;
  const [form, setForm] = useState(() => {
    if (member) {
      return {
        ...member,
        joiningDate: member.joiningDate ? formatDmyDate(ensureIsoDate(member.joiningDate)) : '',
      };
    }
    return { ...EMPTY_FORM[tab] };
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const finalForm = {
      ...form,
      joiningDate: form.joiningDate ? formatDmyDate(form.joiningDate) : ''
    };
    onSave(finalForm);
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
                type="text"
                placeholder="dd/mm/yyyy"
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
  const { canManageStaff } = useRBAC();
  const tab = TABS.find((t) => location.pathname.endsWith(t.key))?.key ?? 'doctors';

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // { mode: 'add'|'edit', member }

  // Adjust state during render when tab changes to avoid synchronous setState inside useEffect
  const [prevTab, setPrevTab] = useState(tab);
  if (tab !== prevTab) {
    setPrevTab(tab);
    setLoading(true);
  }

  useEffect(() => {
    const unsub = subscribeStaffByRole(
      tab,
      (data) => { setMembers(data); setLoading(false); },
      (err)  => { console.error('staff subscription error:', err); setLoading(false); },
    );
    return unsub;
  }, [tab]);

  const meta = TAB_META[tab];

  const openAdd  = () => setModal({ mode: 'add',  member: null });
  const openEdit = (m) => setModal({ mode: 'edit', member: m });
  const closeModal = () => setModal(null);

  const isOpen      = modal !== null;
  const modalMember = modal !== null ? modal.member : null;
  const modalMode   = modal !== null ? modal.mode   : null;

  const deleteMember = (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    deleteStaff(id);
  };

  const saveMember = async (formData) => {
    if (modalMode === 'add') {
      await addStaff(tab, formData, members.length);
    } else {
      await updateStaff(modalMember.id, { ...formData });
    }
    closeModal();
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
      Loading staff…
    </div>
  );

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: 0, color: 'var(--fg-on-light)', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            {meta.title}
            <span style={{ fontSize: 14, fontWeight: 600, background: 'var(--surface-subtle)', color: 'var(--fg-on-light)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border-ui)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {members.length}
            </span>
          </h1>
        </div>
        {canManageStaff && (
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} /> {meta.addLabel}
          </button>
        )}
      </div>

      {/* Staff grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {members.map((m) => (
          <StaffCard key={m.id} m={m} tab={tab} onEdit={openEdit} onDelete={deleteMember} canManage={canManageStaff} />
        ))}
        {members.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
            No {meta.plural} found. Click &ldquo;{meta.addLabel}&rdquo; to add one.
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {isOpen && createPortal(
        <StaffModal tab={tab} member={modalMember} onClose={closeModal} onSave={saveMember} />,
        document.body,
      )}
    </div>
  );
}
