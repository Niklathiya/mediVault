import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FlaskConical } from 'lucide-react';
import { addPatientSubItem } from '../../firebase/services/patientService.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TODAY  = new Date().toISOString().slice(0, 10);

function isoToDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${+d} ${MONTHS[+m - 1]} ${y}`;
}

const STATUS_META = {
  Normal:   { color: '#15803d', bg: 'rgba(78,179,116,0.10)' },
  High:     { color: '#d9a441', bg: 'rgba(217,164,65,0.10)' },
  Low:      { color: '#0891b2', bg: 'rgba(8,145,178,0.10)' },
  Critical: { color: '#d95050', bg: 'rgba(217,80,80,0.10)' },
  Pending:  { color: '#64748b', bg: 'rgba(100,116,139,0.10)' },
};

const empty = { test: '', date: TODAY, result: '', normal: '', status: 'Normal', doctor: '' };

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

export default function AddLabModal({ open, patientId, onAdd, onClose }) {
  const [form, setForm]     = useState(empty);
  const [saving, setSaving] = useState(false);
  const [done, setDone]     = useState(false);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.test.trim()) return;
    setSaving(true);
    try {
      const meta = STATUS_META[form.status] ?? STATUS_META.Normal;
      const data = {
        test:        form.test,
        date:        isoToDisplay(form.date),
        result:      form.result,
        normal:      form.normal,
        status:      form.status,
        statusColor: meta.color,
        statusBg:    meta.bg,
        doctor:      form.doctor,
      };
      const ref = await addPatientSubItem(patientId, 'labs', data);
      onAdd({ id: ref.id, ...data });
      setDone(true);
      setTimeout(() => { setDone(false); setForm(empty); onClose(); }, 1000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const statusMeta = STATUS_META[form.status] ?? STATUS_META.Normal;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div
        className="modal-panel"
        style={{ maxWidth: 520, width: '100%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>Add Lab Result</div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>Record a diagnostic test result</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-ui)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            <span style={lbl}>Test Name *</span>
            <input required style={inp} placeholder="e.g. Lipid Panel, HbA1c, CBC" value={form.test} onChange={(e) => set('test', e.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Date</span>
              <input type="date" style={inp} value={form.date} onChange={(e) => set('date', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Status</span>
              <select
                style={{ ...inp, color: statusMeta.color }}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {Object.keys(STATUS_META).map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Result</span>
              <input style={inp} placeholder="e.g. 210 mg/dL" value={form.result} onChange={(e) => set('result', e.target.value)} />
            </label>
            <label>
              <span style={lbl}>Normal Range</span>
              <input style={inp} placeholder="e.g. &lt; 200 mg/dL" value={form.normal} onChange={(e) => set('normal', e.target.value)} />
            </label>
          </div>
          <label>
            <span style={lbl}>Ordered by</span>
            <input style={inp} placeholder="e.g. Dr. Rajesh Sharma" value={form.doctor} onChange={(e) => set('doctor', e.target.value)} />
          </label>
        </form>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--surface-subtle)', flexShrink: 0 }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="btn-primary" disabled={saving || done}>
            {done ? 'Saved!' : saving ? 'Saving…' : 'Save Result'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
