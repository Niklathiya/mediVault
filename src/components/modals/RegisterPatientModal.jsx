import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const empty = {
  name: '',
  dob: '',
  age: '',
  sex: 'Male',
  blood: 'O+',

  phone: '',
  email: '',
  address: '',

  allergies: '',
  tags: '',

  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',

  insurance: '',
};

const inp = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 8,
  fontFamily: 'inherit',
  fontSize: 14,
  outline: 'none',
  background: 'var(--bg-canvas)',
  color: 'var(--fg-on-light)',
  boxSizing: 'border-box',
};

const lbl = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--fg-on-light-muted)',
  marginBottom: 5,
};

export default function RegisterPatientModal({ open, onClose }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const calculateAge = (dob) => {
    if (!dob) return '';

    const birth = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      setDone(true);

      setTimeout(() => {
        setDone(false);
        setForm(empty);
        onClose();
      }, 1200);
    }, 700);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ alignItems: 'flex-start', paddingTop: 40 }}
    >
      <div
        className="modal-panel"
        style={{
          maxWidth: 700,
          width: '100%',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-card)',
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#0891b2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={16} color="white" />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'var(--fg-on-light)',
                }}
              >
                Register New Patient
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: 'var(--fg-on-light-muted)',
                }}
              >
                Create a new patient record
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid var(--border-ui)',
              background: 'transparent',
              cursor: 'pointer',
            }}
            className="flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form */}

        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <label>
            <span style={lbl}>Full Name *</span>

            <input
              required
              style={inp}
              placeholder="Patient full name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: 12,
            }}
          >
            <label>
              <span style={lbl}>Date of Birth</span>

              <input
                type="date"
                style={inp}
                value={form.dob}
                onChange={(e) => {
                  const dob = e.target.value;

                  setForm((f) => ({
                    ...f,
                    dob,
                    age: calculateAge(dob),
                  }));
                }}
              />
            </label>

            <label>
              <span style={lbl}>Age</span>

              <input style={inp} value={form.age} readOnly />
            </label>

            <label>
              <span style={lbl}>Sex</span>

              <CustomSelect
                style={inp}
                value={form.sex}
                onChange={(e) => set('sex', e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </CustomSelect>
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
            }}
          >
            <label>
              <span style={lbl}>Phone</span>

              <input
                style={inp}
                placeholder="+91 ..."
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </label>

            <label>
              <span style={lbl}>Email</span>

              <input
                type="email"
                style={inp}
                placeholder="patient@email.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </label>

            <label>
              <span style={lbl}>Blood Group</span>

              <CustomSelect
                style={inp}
                value={form.blood}
                onChange={(e) => set('blood', e.target.value)}
              >
                {BLOOD_GROUPS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </CustomSelect>
            </label>
          </div>

          <label>
            <span style={lbl}>Address</span>

            <input
              style={inp}
              placeholder="Full residential address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </label>

          <label>
            <span style={lbl}>Allergies (comma separated)</span>

            <input
              style={inp}
              placeholder="e.g. Penicillin, Latex"
              value={form.allergies}
              onChange={(e) => set('allergies', e.target.value)}
            />
          </label>

          <label>
            <span style={lbl}>Tags (comma separated)</span>

            <input
              style={inp}
              placeholder="e.g. Chronic, Diabetes"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
            />
          </label>

          <div>
            <span style={lbl}>Emergency Contact</span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
              }}
            >
              <input
                style={inp}
                placeholder="Name"
                value={form.emergencyName}
                onChange={(e) => set('emergencyName', e.target.value)}
              />

              <input
                style={inp}
                placeholder="Relation"
                value={form.emergencyRelation}
                onChange={(e) => set('emergencyRelation', e.target.value)}
              />

              <input
                style={inp}
                placeholder="Phone"
                value={form.emergencyPhone}
                onChange={(e) => set('emergencyPhone', e.target.value)}
              />
            </div>
          </div>

          <label>
            <span style={lbl}>Insurance</span>

            <input
              style={inp}
              placeholder="Provider · Policy #"
              value={form.insurance}
              onChange={(e) => set('insurance', e.target.value)}
            />
          </label>
        </form>

        {/* Sticky Footer */}

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'var(--surface)',
          }}
        >
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={saving || done}
          >
            {done ? <>Saved!</> : saving ? 'Saving...' : <>Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}
