import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Pill } from 'lucide-react';
import { addPatientSubItem } from '../../firebase/services/patientService.js';

const TODAY  = new Date().toISOString().slice(0, 10);

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const empty = { drug: '', date: TODAY, dosage: '', frequency: '', duration: '', doctor: '', instructions: '' };

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

export default function AddPrescriptionModal({ open, patientId, onAdd, onClose }) {
  const [form, setForm]     = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.drug.trim()) return;
    setSaving(true);
    try {
      const data = {
        drug:         form.drug,
        date:         isoToDisplay(form.date),
        dosage:       form.dosage,
        frequency:    form.frequency,
        duration:     form.duration,
        doctor:       form.doctor,
        instructions: form.instructions,
        time:         new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      };
      const ref = await addPatientSubItem(patientId, 'prescriptions', data);
      onAdd({ id: ref.id, ...data });
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
        style={{ maxWidth: 540, width: '100%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>Add Prescription</div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>Record a medication prescription</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-ui)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            <span style={lbl}>Drug / Medication *</span>
            <input required style={inp} placeholder="e.g. Metoprolol" value={form.drug} onChange={(e) => set('drug', e.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Date</span>
              <input type="date" style={inp} value={form.date} onChange={(e) => set('date', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Dosage</span>
              <input style={inp} placeholder="e.g. 50mg" value={form.dosage} onChange={(e) => set('dosage', e.target.value)} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Frequency</span>
              <input style={inp} placeholder="e.g. Twice daily" value={form.frequency} onChange={(e) => set('frequency', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Duration</span>
              <input style={inp} placeholder="e.g. 7 days" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
            </label>
          </div>
          <label>
            <span style={lbl}>Prescribed by</span>
            <input style={inp} placeholder="e.g. Dr. Rajesh Sharma" value={form.doctor} onChange={(e) => set('doctor', e.target.value)} />
          </label>
          <label>
            <span style={lbl}>Instructions</span>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 72 }}
              placeholder="e.g. Take with food, avoid alcohol…"
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
            />
          </label>
        </form>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--surface-subtle)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="btn-primary" disabled={saving || done}>
            {done ? 'Saved!' : saving ? 'Saving…' : 'Save Prescription'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
