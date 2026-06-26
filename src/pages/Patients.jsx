import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, AlertTriangle, X } from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';

const ALL_PATIENTS = [
  { id: 'PT-0128', name: 'Kiran Desai', initials: 'KD', phone: '98765 43210', blood: 'B+', ageSex: '34M', tags: ['Diabetes', 'Hypertension'], status: 'active', hasAllergy: false, reg: '10 Jun 2026' },
  { id: 'PT-0127', name: 'Meena Agarwal', initials: 'MA', phone: '87654 32109', blood: 'O+', ageSex: '52F', tags: ['Hypertension'], status: 'active', hasAllergy: true, reg: '08 Jun 2026' },
  { id: 'PT-0126', name: 'Suresh Rao', initials: 'SR', phone: '76543 21098', blood: 'A+', ageSex: '67M', tags: ['Cardiac', 'Diabetes'], status: 'active', hasAllergy: false, reg: '05 Jun 2026' },
  { id: 'PT-0125', name: 'Anjali Shah', initials: 'AS', phone: '65432 10987', blood: 'AB-', ageSex: '28F', tags: [], status: 'active', hasAllergy: true, reg: '02 Jun 2026' },
  { id: 'PT-0124', name: 'Mohan Trivedi', initials: 'MT', phone: '54321 09876', blood: 'O-', ageSex: '45M', tags: ['Asthma'], status: 'active', hasAllergy: false, reg: '30 May 2026' },
  { id: 'PT-0123', name: 'Lakshmi Nair', initials: 'LN', phone: '43210 98765', blood: 'A-', ageSex: '38F', tags: ['Thyroid'], status: 'active', hasAllergy: false, reg: '28 May 2026' },
  { id: 'PT-0122', name: 'Deepak Verma', initials: 'DV', phone: '32109 87654', blood: 'B-', ageSex: '55M', tags: ['Cardiac'], status: 'archived', hasAllergy: false, reg: '15 May 2026' },
  { id: 'PT-0121', name: 'Sonal Mehta', initials: 'SM', phone: '21098 76543', blood: 'AB+', ageSex: '41F', tags: ['Diabetes'], status: 'archived', hasAllergy: true, reg: '10 May 2026' },
];

const STATUS_BADGE = {
  active: { label: 'Active', color: '#15803d', bg: 'rgba(78,179,116,0.12)' },
  archived: { label: 'Archived', color: 'var(--fg-on-light-muted)', bg: 'var(--surface-subtle)' },
};

export default function Patients() {
  const navigate = useNavigate();
  const { openRegisterModal } = useOutletContext();

  const [statusFilter, setStatusFilter] = useState('all');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

  const allTags = [...new Set(ALL_PATIENTS.flatMap(p => p.tags))].sort();

  const filtered = ALL_PATIENTS.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (bloodFilter !== 'all' && p.blood !== bloodFilter) return false;
    if (tagFilter !== 'all' && !p.tags.includes(tagFilter)) return false;
    return true;
  });

  const hasFilters = statusFilter !== 'all' || bloodFilter !== 'all' || tagFilter !== 'all';
  const clearFilters = () => { setStatusFilter('all'); setBloodFilter('all'); setTagFilter('all'); };

  const selectStyle = {
    padding: '9px 14px', border: '1px solid var(--border-ui)',
    borderRadius: 8, fontFamily: 'inherit', fontSize: 13,
    background: 'var(--surface)', color: 'var(--fg-on-light)', cursor: 'pointer', outline: 'none',
  };

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
            {filtered.length} of {ALL_PATIENTS.length} records
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>Patients</h1>
        </div>
        <button className="btn-primary" onClick={openRegisterModal}>
          <Plus size={16} /> Register patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <CustomSelect style={selectStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All status</option>
          <option value="active">Active only</option>
          <option value="archived">Archived</option>
        </CustomSelect>
        <CustomSelect style={selectStyle} value={bloodFilter} onChange={e => setBloodFilter(e.target.value)}>
          <option value="all">All blood groups</option>
          {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}
        </CustomSelect>
        <CustomSelect style={selectStyle} value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
          <option value="all">All tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </CustomSelect>
        {hasFilters && (
          <button onClick={clearFilters} style={{
            background: 'transparent', border: '1px solid var(--border-ui)',
            color: 'var(--fg-on-light-muted)', padding: '9px 14px', borderRadius: 8,
            fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr 0.8fr 100px',
          padding: '12px 20px', background: 'var(--surface-subtle)',
          fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--fg-on-light-muted)', fontWeight: 600,
        }}>
          <div>Patient</div>
          <div>Phone</div>
          <div>Blood / Age</div>
          <div>Tags</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
            No patients match the selected filters.
          </div>
        ) : (
          filtered.map(p => {
            const badge = STATUS_BADGE[p.status];
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/patients/${p.id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr 0.8fr 100px',
                  padding: '14px 20px',
                  borderTop: '1px solid var(--border-card)',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 120ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
                    <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>{p.id} · Reg {p.reg}</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{p.phone}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{p.blood} · {p.ageSex}</div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--surface-subtle)', color: 'var(--fg-on-light)', borderRadius: 10 }}>{t}</span>
                  ))}
                </div>

                <div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: badge.bg, color: badge.color, fontWeight: 500 }}>
                    {badge.label}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}`); }}
                    style={{ background: 'transparent', border: '1px solid var(--border-ui)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: 'var(--fg-on-light-muted)', cursor: 'pointer' }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
