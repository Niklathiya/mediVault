import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, AlertTriangle, X, Pencil, Archive, Check } from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';
import { subscribePatients, updatePatient, toggleArchivePatient } from '../firebase/services/patientService.js';

const STATUS_BADGE = {
  active:     { label: 'Active',     color: '#15803d', bg: 'rgba(78,179,116,0.12)' },
  admitted:   { label: 'Admitted',   color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  discharged: { label: 'Discharged', color: '#995f2f', bg: 'rgba(153,95,47,0.12)' },
  archived:   { label: 'Archived',   color: 'var(--fg-on-light-muted)', bg: 'var(--surface-subtle)' },
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const EMPTY_EDIT = {
  name: '', dob: '', age: '', sex: 'Male', blood: 'O+',
  phone: '', email: '', address: '',
  allergies: '', tags: '',
  emergencyName: '', emergencyRelation: '', emergencyPhone: '',
  insurance: '', status: 'active',
};

const inp = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 8, fontFamily: 'inherit', fontSize: 14, outline: 'none',
  background: 'var(--bg-canvas)', color: 'var(--fg-on-light)', boxSizing: 'border-box',
};

const lbl = {
  display: 'block', fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--fg-on-light-muted)', marginBottom: 5,
};

const calculateAge = (dob) => {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
};

const fmtReg = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[+m - 1]} ${y}`;
};

export default function Patients() {
  const navigate = useNavigate();
  const { openRegisterModal } = useOutletContext();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const unsub = subscribePatients(
      (data) => { setPatients(data); setLoading(false); },
      (err)  => { console.error('patients subscription error:', err); setLoading(false); },
    );
    return unsub;
  }, []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [bloodFilter, setBloodFilter]   = useState('all');
  const [tagFilter, setTagFilter]       = useState('all');

  const [editOpen, setEditOpen] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState(null);

  // React Compiler safe — ef is always a non-null object
  const ef         = editForm !== null ? editForm : EMPTY_EDIT;
  const isEditOpen = editOpen;

  const allTags = [...new Set(patients.flatMap((p) => p.tags))].sort();

  const filtered = patients.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (bloodFilter  !== 'all' && p.blood  !== bloodFilter)  return false;
    if (tagFilter    !== 'all' && !p.tags.includes(tagFilter)) return false;
    return true;
  });

  const hasFilters = statusFilter !== 'all' || bloodFilter !== 'all' || tagFilter !== 'all';
  const clearFilters = () => { setStatusFilter('all'); setBloodFilter('all'); setTagFilter('all'); };

  const archivePatient = (id) => {
    const p = patients.find((pt) => pt.id === id);
    if (p) toggleArchivePatient(id, p.status);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setEditForm({
      name:              p.name,
      dob:               p.dob || '',
      age:               p.age,
      sex:               p.sex,
      blood:             p.blood,
      phone:             p.phone,
      email:             p.email,
      address:           p.address,
      allergies:         Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || ''),
      tags:              Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
      emergencyName:     p.emergency?.name || '',
      emergencyRelation: p.emergency?.relation || '',
      emergencyPhone:    p.emergency?.phone || '',
      insurance:         p.insurance || '',
      status:            p.status,
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditId(null);
    setEditForm(null);
  };

  const setField = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));

  const saveEdit = async () => {
    const newName    = ef.name.trim();
    const initials   = newName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const tagsArr    = ef.tags.split(',').map((s) => s.trim()).filter(Boolean);
    const allergyArr = ef.allergies.split(',').map((s) => s.trim()).filter(Boolean);
    await updatePatient(editId, {
      name: newName, initials,
      dob: ef.dob, age: ef.age, sex: ef.sex, blood: ef.blood,
      phone: ef.phone, email: ef.email, address: ef.address,
      allergies: allergyArr, hasAllergy: allergyArr.length > 0,
      tags: tagsArr,
      emergency: { name: ef.emergencyName, relation: ef.emergencyRelation, phone: ef.emergencyPhone },
      insurance: ef.insurance, status: ef.status,
    });
    closeEdit();
  };

  const selectStyle = {
    padding: '9px 14px', border: '1px solid var(--border-ui)', borderRadius: 8,
    fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)',
    color: 'var(--fg-on-light)', cursor: 'pointer', outline: 'none',
  };

  const iconBtn = {
    background: 'transparent', border: '1px solid var(--border-ui)',
    width: 30, height: 30, borderRadius: 6,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--fg-on-light)', flexShrink: 0,
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
      Loading patients…
    </div>
  );

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
            {filtered.length} of {patients.length} records
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>
            Patients
          </h1>
        </div>
        <button className="btn-primary" onClick={openRegisterModal}>
          <Plus size={16} /> Register patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <CustomSelect style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="admitted">Admitted</option>
          <option value="discharged">Discharged</option>
          <option value="archived">Archived</option>
        </CustomSelect>
        <CustomSelect style={selectStyle} value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value)}>
          <option value="all">All blood groups</option>
          {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
        </CustomSelect>
        <CustomSelect style={selectStyle} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="all">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </CustomSelect>
        {hasFilters && (
          <button onClick={clearFilters} style={{ background: 'transparent', border: '1px solid var(--border-ui)', color: 'var(--fg-on-light-muted)', padding: '9px 14px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr 0.8fr 76px', padding: '12px 20px', background: 'var(--surface-subtle)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
          <div>Patient</div>
          <div>Phone</div>
          <div>Blood / Age</div>
          <div>Tags</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
            No patients match the selected filters.
          </div>
        ) : (
          filtered.map((p) => {
            const badge  = STATUS_BADGE[p.status] ?? STATUS_BADGE.active;
            const ageSex = p.age ? `${p.age} yrs / ${p.sex === 'Male' ? 'M' : p.sex === 'Female' ? 'F' : p.sex}` : '—';
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr 0.8fr 76px', padding: '14px 20px', borderTop: '1px solid var(--border-card)', alignItems: 'center', cursor: 'pointer', transition: 'background 120ms' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: 'var(--surface-subtle)', color: 'var(--fg-on-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-on-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.name}
                      {p.hasAllergy && <AlertTriangle size={13} color="#d95050" />}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>{p.id} · Reg {fmtReg(p.registered)}</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{p.phone}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{p.blood} · {ageSex}</div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.tags.map((t) => (
                    <span key={t} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--surface-subtle)', color: 'var(--fg-on-light)', borderRadius: 10 }}>{t}</span>
                  ))}
                </div>

                <div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: badge.bg, color: badge.color, fontWeight: 500 }}>
                    {badge.label}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button
                    title="Edit patient"
                    onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                    style={iconBtn}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    title={p.status === 'archived' ? 'Unarchive' : 'Archive'}
                    onClick={(e) => { e.stopPropagation(); archivePatient(p.id); }}
                    style={{ ...iconBtn, color: p.status === 'archived' ? '#d9a441' : 'var(--fg-on-light)' }}
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Edit patient modal ─── */}
      {isEditOpen && createPortal(
        <div className="modal-backdrop" onClick={closeEdit} style={{ alignItems: 'flex-start', paddingTop: 40 }}>
          <div
            className="modal-panel"
            style={{ maxWidth: 680, width: '100%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-card)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--fg-on-light)' }}>
                  {ef.name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '—'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>Edit Patient</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 1 }}>{editId}</div>
                </div>
              </div>
              <button onClick={closeEdit} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-ui)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-on-light)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              <label>
                <span style={lbl}>Full Name *</span>
                <input style={inp} value={ef.name} onChange={(e) => setField('name', e.target.value)} placeholder="Patient full name" />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Date of Birth</span>
                  <input type="date" style={inp} value={ef.dob} onChange={(e) => {
                    const dob = e.target.value;
                    setEditForm((f) => ({ ...f, dob, age: calculateAge(dob) }));
                  }} />
                </label>
                <label>
                  <span style={lbl}>Age</span>
                  <input style={{ ...inp, background: 'var(--surface-subtle)', color: 'var(--fg-on-light-muted)' }} value={ef.age} readOnly />
                </label>
                <label>
                  <span style={lbl}>Sex</span>
                  <CustomSelect style={inp} value={ef.sex} onChange={(e) => setField('sex', e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </CustomSelect>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label>
                  <span style={lbl}>Phone</span>
                  <input style={inp} value={ef.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+91 ..." />
                </label>
                <label>
                  <span style={lbl}>Email</span>
                  <input type="email" style={inp} value={ef.email} onChange={(e) => setField('email', e.target.value)} placeholder="patient@email.com" />
                </label>
                <label>
                  <span style={lbl}>Blood Group</span>
                  <CustomSelect style={inp} value={ef.blood} onChange={(e) => setField('blood', e.target.value)}>
                    {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
                  </CustomSelect>
                </label>
              </div>

              <label>
                <span style={lbl}>Address</span>
                <input style={inp} value={ef.address} onChange={(e) => setField('address', e.target.value)} placeholder="Full residential address" />
              </label>

              <label>
                <span style={lbl}>Status</span>
                <CustomSelect style={inp} value={ef.status} onChange={(e) => setField('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="admitted">Admitted</option>
                  <option value="discharged">Discharged</option>
                  <option value="archived">Archived</option>
                </CustomSelect>
              </label>

              <label>
                <span style={lbl}>Allergies (comma separated)</span>
                <input style={inp} value={ef.allergies} onChange={(e) => setField('allergies', e.target.value)} placeholder="e.g. Penicillin, Latex" />
              </label>

              <label>
                <span style={lbl}>Tags (comma separated)</span>
                <input style={inp} value={ef.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="e.g. Diabetes, Cardiac" />
              </label>

              <div>
                <span style={lbl}>Emergency Contact</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <input style={inp} placeholder="Name" value={ef.emergencyName} onChange={(e) => setField('emergencyName', e.target.value)} />
                  <input style={inp} placeholder="Relation" value={ef.emergencyRelation} onChange={(e) => setField('emergencyRelation', e.target.value)} />
                  <input style={inp} placeholder="Phone" value={ef.emergencyPhone} onChange={(e) => setField('emergencyPhone', e.target.value)} />
                </div>
              </div>

              <label>
                <span style={lbl}>Insurance</span>
                <input style={inp} value={ef.insurance} onChange={(e) => setField('insurance', e.target.value)} placeholder="Provider · Policy #" />
              </label>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--surface-subtle)', borderRadius: '0 0 16px 16px', flexShrink: 0 }}>
              <button onClick={closeEdit} style={{ background: 'transparent', color: 'var(--fg-on-light)', border: '1px solid var(--border-strong)', padding: '9px 18px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveEdit} className="btn-primary">
                <Check size={15} /> Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
