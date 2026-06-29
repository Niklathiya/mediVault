import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ClipboardList } from 'lucide-react';
import { addPatientSubItem } from '../../firebase/services/patientService.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TODAY  = new Date().toISOString().slice(0, 10);

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${+d} ${MONTHS[+m - 1]} ${y}`;
}

const empty = { date: TODAY, doctor: '', dept: '', complaint: '', diagnosis: '', treatment: '', notes: '' };

const inp = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-strong)', borderRadius: 6,
  fontFamily: 'inherit', fontSize: 14, outline: 'none',
  background: 'var(--bg-canvas)', color: 'var(--fg-on-light)', boxSizing: 'border-box',
};
const lbl = {
  display: 'block', fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--fg-on-light-muted)', marginBottom: 4,
};

export default function AddVisitModal({ open, patientId, onAdd, onClose }) {
  const [form, setForm]     = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.complaint.trim()) return;
    setSaving(true);
    try {
      const [y, m, d] = form.date.split('-');
      const visitData = {
        date:      form.date,
        dateLabel: isoToDisplay(form.date),
        dateMonth: `${MONTHS[+m - 1]} ${y}`,
        dateBig:   String(+d),
        doctor:    form.doctor,
        dept:      form.dept,
        complaint: form.complaint,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        notes:     form.notes,
      };
      const ref = await addPatientSubItem(patientId, 'visits', visitData);
      onAdd({ id: ref.id, ...visitData });
      setDone(true);
      setTimeout(() => { setDone(false); setForm(empty); onClose(); }, 1000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div
        className="modal-panel"
        style={{ maxWidth: 560, width: '100%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>Add Visit</div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>Record a new OPD clinical visit</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-ui)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Date</span>
              <input type="date" style={inp} value={form.date} onChange={(e) => set('date', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Department</span>
              <input style={inp} placeholder="e.g. Cardiology" value={form.dept} onChange={(e) => set('dept', e.target.value)} />
            </label>
          </div>
          <label>
            <span style={lbl}>Doctor</span>
            <input style={inp} placeholder="e.g. Dr. Rajesh Sharma" value={form.doctor} onChange={(e) => set('doctor', e.target.value)} />
          </label>
          <label>
            <span style={lbl}>Chief Complaint *</span>
            <input required style={inp} placeholder="Main reason for visit" value={form.complaint} onChange={(e) => set('complaint', e.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Diagnosis</span>
              <input style={inp} placeholder="Clinical diagnosis" value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Treatment</span>
              <input style={inp} placeholder="Treatment given" value={form.treatment} onChange={(e) => set('treatment', e.target.value)} />
            </label>
          </div>
          <label>
            <span style={lbl}>Notes</span>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 72 }}
              placeholder="Additional observations…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </label>
        </form>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--surface-subtle)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="btn-primary" disabled={saving || done}>
            {done ? 'Saved!' : saving ? 'Saving…' : 'Save Visit'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
