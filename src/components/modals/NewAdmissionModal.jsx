import { useState } from 'react';
import { X, BedDouble, CheckCircle2 } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';

const PATIENTS = [
  'Kiran Desai (PT-0128)',
  'Meena Agarwal (PT-0127)',
  'Suresh Rao (PT-0126)',
  'Anjali Shah (PT-0125)',
  'Mohan Trivedi (PT-0124)',
  'Lakshmi Nair (PT-0123)',
];
const WARDS = ['General Ward', 'ICU', 'Surgery', 'Maternity', 'Orthopaedic', 'Paediatric'];
const DOCTORS = [
  'Dr. Priya Mehta',
  'Dr. Arjun Rao',
  'Dr. Kavita Singh',
  'Dr. Rishi Patel',
  'Dr. Anil Sharma',
];

const empty = { patient: '', ward: 'General Ward', bed: '', doctor: '', reason: '', notes: '' };

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

export default function NewAdmissionModal({ open, onClose }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
        style={{ maxWidth: 520, background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: '#0891b2',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BedDouble size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-on-light)' }}>
                New IPD Admission
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 1 }}>
                Create an inpatient admission record
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-ui)',
              color: 'var(--fg-on-light-muted)',
              width: 34,
              height: 34,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <label style={{ display: 'block' }}>
            <span style={lbl}>Patient *</span>
            <CustomSelect
              style={inp}
              required
              value={form.patient}
              onChange={(e) => set('patient', e.target.value)}
            >
              <option value="">Select patient…</option>
              {PATIENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </CustomSelect>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Ward</span>
              <CustomSelect
                style={inp}
                value={form.ward}
                onChange={(e) => set('ward', e.target.value)}
              >
                {WARDS.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </CustomSelect>
            </label>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Bed Number</span>
              <input
                style={inp}
                placeholder="e.g. 4A"
                value={form.bed}
                onChange={(e) => set('bed', e.target.value)}
              />
            </label>
          </div>

          <label style={{ display: 'block' }}>
            <span style={lbl}>Attending Doctor</span>
            <CustomSelect
              style={inp}
              value={form.doctor}
              onChange={(e) => set('doctor', e.target.value)}
            >
              <option value="">Select doctor…</option>
              {DOCTORS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </CustomSelect>
          </label>

          <label style={{ display: 'block' }}>
            <span style={lbl}>Reason for Admission *</span>
            <input
              style={inp}
              required
              placeholder="Primary diagnosis / chief complaint"
              value={form.reason}
              onChange={(e) => set('reason', e.target.value)}
            />
          </label>

          <label style={{ display: 'block' }}>
            <span style={lbl}>Additional Notes</span>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 76 }}
              placeholder="Any additional clinical notes…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </label>

          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
              disabled={saving || done}
            >
              {done ? (
                <>
                  <CheckCircle2 size={14} /> Admission Created!
                </>
              ) : saving ? (
                'Creating…'
              ) : (
                <>
                  <BedDouble size={14} /> Create Admission
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
