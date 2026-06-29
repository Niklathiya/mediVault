import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Activity } from 'lucide-react';
import { addPatientSubItem, updatePatientSubItem } from '../../firebase/services/patientService.js';

const TODAY  = new Date().toISOString().slice(0, 10);

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToIso(dmy) {
  if (!dmy) return TODAY;
  const parts = dmy.split('/');
  if (parts.length !== 3) return TODAY;
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

const empty = { date: TODAY, bp: '', pulse: '', temp: '', wt: '', ht: '', spo2: '' };

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

export default function RecordVitalsModal({ open, patientId, onAdd, onClose, initialData, editId, onUpdate }) {
  const isEdit = Boolean(editId);
  const [form, setForm] = useState(() =>
    initialData
      ? {
          date:  displayToIso(initialData.date),
          bp:    initialData.bp || '',
          pulse: initialData.pulse != null ? String(initialData.pulse) : '',
          temp:  initialData.temp || '',
          wt:    initialData.wt != null ? String(initialData.wt) : '',
          ht:    initialData.ht != null ? String(initialData.ht) : '',
          spo2:  initialData.spo2 != null ? String(initialData.spo2) : '',
        }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parts = (form.bp || '').split('/');
      const bpSys = parseInt(parts[0]) || 0;
      const bpDia = parseInt(parts[1]) || 0;
      const data = {
        date:  isoToDisplay(form.date),
        bp:    form.bp,
        bpSys,
        bpDia,
        pulse: parseFloat(form.pulse) || 0,
        temp:  form.temp,
        wt:    parseFloat(form.wt) || 0,
        ht:    parseFloat(form.ht) || 0,
        spo2:  parseFloat(form.spo2) || 0,
      };
      if (isEdit) {
        await updatePatientSubItem(patientId, 'vitals', editId, data);
        onUpdate({ id: editId, ...data });
      } else {
        const ref = await addPatientSubItem(patientId, 'vitals', data);
        onAdd({ id: ref.id, ...data });
      }
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 1000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div
        className="modal-panel"
        style={{ maxWidth: 500, width: '100%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>{isEdit ? 'Edit Vitals' : 'Record Vitals'}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>Log a vital signs measurement</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-ui)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            <span style={lbl}>Date</span>
            <input type="date" style={inp} value={form.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Blood Pressure (mmHg)</span>
              <input style={inp} placeholder="e.g. 120/80" value={form.bp} onChange={(e) => set('bp', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Pulse (bpm)</span>
              <input type="number" style={inp} placeholder="72" min="0" value={form.pulse} onChange={(e) => set('pulse', e.target.value)} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Temperature (°F)</span>
              <input style={inp} placeholder="98.6" value={form.temp} onChange={(e) => set('temp', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>SpO₂ (%)</span>
              <input type="number" style={inp} placeholder="98" min="0" max="100" value={form.spo2} onChange={(e) => set('spo2', e.target.value)} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Weight (kg)</span>
              <input type="number" style={inp} placeholder="70" min="0" value={form.wt} onChange={(e) => set('wt', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Height (cm)</span>
              <input type="number" style={inp} placeholder="170" min="0" value={form.ht} onChange={(e) => set('ht', e.target.value)} />
            </label>
          </div>
        </form>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--surface-subtle)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="btn-primary" disabled={saving || done}>
            {done ? 'Saved!' : saving ? 'Saving…' : isEdit ? 'Update Vitals' : 'Record Vitals'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
