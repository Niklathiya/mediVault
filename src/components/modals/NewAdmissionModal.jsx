import { useState, useEffect } from 'react';
import { X, BedDouble, CheckCircle2 } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import { subscribePatients } from '../../firebase/services/patientService.js';
import { subscribeStaffByRole } from '../../firebase/services/staffService.js';
import { addAdmission } from '../../firebase/services/admissionService.js';

const WARDS = ['General Ward', 'ICU', 'Surgery', 'Maternity', 'Orthopaedic', 'Paediatric'];

const empty = { patientId: '', ward: 'General Ward', bed: '', doctor: '', reason: '', notes: '' };

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
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (!open) return;
    const unsubP = subscribePatients((data) => setPatients(data), console.error);
    const unsubD = subscribeStaffByRole('doctors', (data) => setDoctors(data), console.error);
    return () => { unsubP(); unsubD(); };
  }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pt = patients.find((p) => p.id === form.patientId);
    if (!pt) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const time  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const words = (pt.name || '').trim().split(' ').filter(Boolean);
      const initials = words.map((w) => w[0]).join('').slice(0, 2).toUpperCase();
      const allergyStr = Array.isArray(pt.allergies) ? pt.allergies.join(', ') : (pt.allergies || '');
      await addAdmission({
        mrNo:            pt.id,
        patientName:     pt.name,
        initials,
        age:             pt.age,
        sex:             pt.sex,
        blood:           pt.blood,
        hasAllergy:      !!pt.hasAllergy,
        allergies:       allergyStr,
        ward:            form.ward,
        bedNo:           form.bed,
        admittingDoctor: form.doctor,
        reason:          form.reason,
        provisionalDx:   '',
        diet:            'Normal diet',
        esiLevel:        '3',
        esiColor:        'Yellow',
        admittedOn:      today,
        admittedTime:    time,
        triage:          { bp: '', pulse: '', rr: '', spo2: '', rbs: '', temp: '' },
        consent: false, pastHistory: false, triageDone: false, history: false, carePlan: false,
        medications: 0, treatment: 0, clinical: 0, nursing: 0, investigations: 0, procedures: 0, visits: 0,
      });
      setSaving(false);
      setDone(true);
      setTimeout(() => { setDone(false); setForm(empty); onClose(); }, 1200);
    } catch (err) {
      console.error('Failed to create admission:', err);
      setSaving(false);
    }
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
              value={form.patientId}
              onChange={(e) => set('patientId', e.target.value)}
            >
              <option value="">Select patient…</option>
              {patients.filter((p) => p.status !== 'archived').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
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
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
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
