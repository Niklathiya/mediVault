import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, FolderPlus, Camera, Upload } from 'lucide-react';
import { addPatientSubItem, updatePatientSubItem } from '../../firebase/services/patientService.js';

const TODAY = new Date().toISOString().slice(0, 10);

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

const DOC_TYPES = [
  'Lab Report',
  'X-ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'Discharge Summary',
  'Consent Form',
  'Insurance',
  'Other',
];

const empty = { name: '', type: 'Lab Report', date: TODAY, notes: '' };

const inp = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 6,
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
  marginBottom: 4,
};

export default function AddDocumentModal({ open, patientId, onAdd, onClose, initialData, editId, onUpdate }) {
  const isEdit = Boolean(editId);
  const [form, setForm] = useState(() =>
    initialData
      ? {
          name:  initialData.name || '',
          type:  initialData.type || 'Lab Report',
          date:  displayToIso(initialData.date),
          notes: initialData.notes || '',
        }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Attachment & Camera States (only used in add mode)
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(isEdit ? (initialData?.fileUrl || '') : '');
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCameraStart = async () => {
    setPreviewUrl('');
    setCameraActive(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      alert('Camera access not supported or denied. Simulating camera capture.');
    }
  };

  const handleCameraStop = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (stream && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewUrl(dataUrl);
      setFileType('image/jpeg');
      setFileName('captured_scan.jpg');
      handleCameraStop();
    } else {
      setPreviewUrl(
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80',
      );
      setFileType('image/jpeg');
      setFileName('mock_scan.jpg');
      setCameraActive(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    handleCameraStop();
  };

  const clearAttachment = () => {
    setPreviewUrl('');
    setFileType('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cleanAndClose = () => {
    handleCameraStop();
    clearAttachment();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: form.name,
        type: form.type,
        date: isoToDisplay(form.date),
        notes: form.notes,
        fileUrl: previewUrl || '',
      };
      if (isEdit) {
        await updatePatientSubItem(patientId, 'documents', editId, data);
        onUpdate({ id: editId, ...data });
      } else {
        const ref = await addPatientSubItem(patientId, 'documents', data);
        onAdd({ id: ref.id, ...data });
      }
      setDone(true);
      setTimeout(() => {
        setDone(false);
        if (!isEdit) setForm(empty);
        cleanAndClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={cleanAndClose}
      style={{ alignItems: 'flex-start', paddingTop: 40 }}
    >
      <div
        className="modal-panel"
        style={{
          maxWidth: 480,
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
                background: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderPlus size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>
                {isEdit ? 'Edit Document' : 'Add Document'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>
                Attach a report or clinical document
              </div>
            </div>
          </div>
          <button
            onClick={cleanAndClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid var(--border-ui)',
              background: 'transparent',
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
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Attach file / scan — only shown in add mode */}
          {!isEdit && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderBottom: '1px dashed var(--border-strong)',
                paddingBottom: 14,
              }}
            >
              <span style={lbl}>Attach File / Scan (optional)</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCameraStart}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    border: '1px solid var(--border-ui)',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    color: 'var(--fg-on-light)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'background 120ms',
                  }}
                >
                  <Camera size={15} /> Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    border: '1px solid var(--border-ui)',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    color: 'var(--fg-on-light)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'background 120ms',
                  }}
                >
                  <Upload size={15} /> Upload File
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <span style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>
                JPG · PNG · PDF · Max 4 MB
              </span>

              {cameraActive && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    border: '1px solid var(--border-strong)',
                    borderRadius: 8,
                    padding: 8,
                    background: 'var(--surface-subtle)',
                    marginTop: 4,
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 6,
                      background: '#000',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleCapture}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#0891b2',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleCameraStop}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--fg-on-light)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {previewUrl && (
                <div
                  style={{
                    position: 'relative',
                    marginTop: 8,
                    border: '1px solid var(--border-strong)',
                    borderRadius: 8,
                    padding: 8,
                    background: 'var(--surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 80,
                  }}
                >
                  {fileType === 'application/pdf' ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--fg-on-light)',
                        padding: 12,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>📄 PDF Attached</span>
                      <span style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>
                        {fileName}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="Scan preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 160,
                          borderRadius: 6,
                          objectFit: 'contain',
                        }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>
                        {fileName}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={clearAttachment}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(15,23,42,0.7)',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

          <label>
            <span style={lbl}>Document Name *</span>
            <input
              required
              style={inp}
              placeholder="e.g. Echocardiography Report"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={lbl}>Type</span>
              <select style={inp} value={form.type} onChange={(e) => set('type', e.target.value)}>
                {DOC_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={lbl}>Date</span>
              <input
                type="date"
                style={inp}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </label>
          </div>
          <label>
            <span style={lbl}>Notes</span>
            <textarea
              style={{ ...inp, resize: 'vertical', minHeight: 88 }}
              placeholder="Brief description or remarks…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </label>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'var(--surface-subtle)',
            flexShrink: 0,
          }}
        >
          <button type="button" onClick={cleanAndClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={saving || done}
          >
            {done ? 'Saved!' : saving ? 'Saving…' : isEdit ? 'Update Document' : 'Save Document'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
