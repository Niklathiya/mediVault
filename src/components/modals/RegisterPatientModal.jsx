import { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CONDITION_TAGS = ['Diabetes', 'Hypertension', 'Cardiac', 'Asthma', 'Thyroid', 'Arthritis', 'Allergy'];

const empty = { name: '', age: '', sex: 'Male', blood: 'O+', phone: '', email: '', address: '', tags: [] };

const inp = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--border-strong)',
  borderRadius: 8, fontFamily: 'inherit', fontSize: 14, outline: 'none',
  background: 'var(--bg-canvas)', color: 'var(--fg-on-light)', boxSizing: 'border-box',
};
const lbl = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--fg-on-light-muted)', marginBottom: 5,
};

export default function RegisterPatientModal({ open, onClose }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleTag = (tag) => setForm(f => ({
    ...f,
    tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
  }));

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
    <div className="modal-backdrop" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div
        className="modal-panel"
        style={{ maxWidth: 560, background: 'var(--surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#0891b2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserPlus size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-on-light)' }}>Register New Patient</div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 1 }}>Create a new patient record</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border-ui)',
              color: 'var(--fg-on-light-muted)', width: 34, height: 34, borderRadius: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}
        >
          <label style={{ display: 'block' }}>
            <span style={lbl}>Full Name *</span>
            <input style={inp} required placeholder="Patient full name" value={form.name} onChange={e => set('name', e.target.value)} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Age</span>
              <input style={inp} type="number" min={0} max={120} placeholder="Years" value={form.age} onChange={e => set('age', e.target.value)} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Sex</span>
              <select style={inp} value={form.sex} onChange={e => set('sex', e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Blood Group</span>
              <select style={inp} value={form.blood} onChange={e => set('blood', e.target.value)}>
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Phone</span>
              <input style={inp} type="tel" placeholder="+91 99999 99999" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </label>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Email</span>
              <input style={inp} type="email" placeholder="patient@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </label>
          </div>

          <label style={{ display: 'block' }}>
            <span style={lbl}>Address</span>
            <input style={inp} placeholder="Full residential address" value={form.address} onChange={e => set('address', e.target.value)} />
          </label>

          <div>
            <span style={lbl}>Conditions / Tags</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {CONDITION_TAGS.map(tag => {
                const active = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '5px 12px', borderRadius: 12, fontSize: 12, cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: 500, transition: 'all 120ms',
                      background: active ? 'rgba(8,145,178,0.12)' : 'var(--surface-subtle)',
                      color: active ? '#0891b2' : 'var(--fg-on-light-muted)',
                      border: `1px solid ${active ? 'rgba(8,145,178,0.30)' : 'var(--border-ui)'}`,
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
              disabled={saving || done}
            >
              {done ? (
                <><CheckCircle2 size={14} /> Registered!</>
              ) : saving ? 'Registering…' : (
                <><UserPlus size={14} /> Register Patient</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
