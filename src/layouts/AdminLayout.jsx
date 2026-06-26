import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Search, X, Settings, UserPlus, Moon, Sun, BedDouble } from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import { useDark } from '../context/DarkModeContext';
import RegisterPatientModal from '../components/modals/RegisterPatientModal';
import NewAdmissionModal from '../components/modals/NewAdmissionModal';

const SEARCH_POOL = {
  patients: [
    { id: 'PT-0128', name: 'Kiran Desai', sub: '34M · B+' },
    { id: 'PT-0127', name: 'Meena Agarwal', sub: '52F · O+' },
    { id: 'PT-0126', name: 'Suresh Rao', sub: '67M · A+' },
    { id: 'PT-0125', name: 'Anjali Shah', sub: '28F · AB-' },
    { id: 'PT-0124', name: 'Mohan Trivedi', sub: '45M · O-' },
    { id: 'PT-0123', name: 'Lakshmi Nair', sub: '38F · A-' },
  ],
  admissions: [
    { id: 'IPD-2026-042', name: 'Ramesh Patel', sub: 'General · Bed 4A' },
    { id: 'IPD-2026-041', name: 'Sunita Sharma', sub: 'ICU · Bed 2' },
    { id: 'IPD-2026-040', name: 'Ankit Mehta', sub: 'Surgery · Bed 7B' },
  ],
  doctors: [
    { id: 'DR-001', name: 'Dr. Priya Mehta', sub: 'Cardiology' },
    { id: 'DR-002', name: 'Dr. Arjun Rao', sub: 'General Surgery' },
    { id: 'DR-003', name: 'Dr. Kavita Singh', sub: 'Obstetrics & Gynaecology' },
  ],
};

function runSearch(q) {
  const lower = q.toLowerCase().trim();
  if (!lower) return null;
  return {
    patients: SEARCH_POOL.patients.filter(p => p.name.toLowerCase().includes(lower) || p.id.toLowerCase().includes(lower)),
    admissions: SEARCH_POOL.admissions.filter(a => a.name.toLowerCase().includes(lower) || a.id.toLowerCase().includes(lower)),
    doctors: SEARCH_POOL.doctors.filter(d => d.name.toLowerCase().includes(lower) || d.sub.toLowerCase().includes(lower)),
  };
}

export default function AdminLayout() {
  const { dark, toggle } = useDark();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showNewAdmission, setShowNewAdmission] = useState(false);
  const searchWrapRef = useRef(null);

  const results = runSearch(query);
  const showDropdown = searchOpen && !!results;
  const hasResults = results && (results.patients.length + results.admissions.length + results.doctors.length) > 0;

  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeSearch = (path) => {
    setQuery('');
    setSearchOpen(false);
    if (path) navigate(path);
  };

  const outletCtx = {
    openRegisterModal: () => setShowRegister(true),
    openNewAdmissionModal: () => setShowNewAdmission(true),
  };

  return (
    <div data-dark={dark ? '1' : undefined} style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-ui)',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
          position: 'relative',
          zIndex: 50,
        }}>
          {/* Global search */}
          <div ref={searchWrapRef} style={{ flex: 1, maxWidth: 560, position: 'relative' }}>
            <Search size={15} style={{
              position: 'absolute', left: 13, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--fg-on-light-muted)', zIndex: 1, flexShrink: 0,
            }} />
            <input
              type="text"
              placeholder="Search patients, doctors, admissions…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              style={{
                width: '100%', padding: '9px 36px 9px 38px',
                border: '1px solid var(--border-ui)', borderRadius: 8,
                fontFamily: 'inherit', fontSize: 14,
                background: 'var(--bg-canvas)', color: 'var(--fg-on-light)', outline: 'none',
              }}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setSearchOpen(false); }}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--fg-on-light-muted)', display: 'flex', alignItems: 'center', padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown */}
            {showDropdown && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border-ui)',
                borderRadius: 10,
                boxShadow: '0 8px 32px rgba(15,23,42,0.14)',
                zIndex: 200, maxHeight: 380, overflowY: 'auto',
                animation: 'mv-slideup 150ms ease both',
              }}>
                {!hasResults ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--fg-on-light-muted)', fontSize: 13 }}>
                    No results for "{query}"
                  </div>
                ) : (
                  <>
                    {results.patients.length > 0 && (
                      <SearchGroup
                        title="Patients"
                        items={results.patients}
                        onSelect={id => closeSearch(`/patients/${id}`)}
                      />
                    )}
                    {results.admissions.length > 0 && (
                      <SearchGroup
                        title="Admissions"
                        items={results.admissions}
                        onSelect={id => closeSearch(`/admissions/${id}`)}
                      />
                    )}
                    {results.doctors.length > 0 && (
                      <SearchGroup
                        title="Doctors"
                        items={results.doctors}
                        onSelect={() => closeSearch('/staff/doctors')}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button
              onClick={() => setShowRegister(true)}
              className="btn-primary"
              style={{ fontSize: 13, padding: '8px 14px' }}
            >
              <UserPlus size={14} />
              Register patient
            </button>

            <button
              onClick={() => setShowNewAdmission(true)}
              style={{
                background: 'transparent', border: '1px solid var(--border-ui)',
                borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'var(--fg-on-light-muted)', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <BedDouble size={14} />
              New admission
            </button>

            <button
              onClick={toggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'transparent', border: '1px solid var(--border-ui)',
                borderRadius: 8, padding: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', color: 'var(--fg-on-light-muted)',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => navigate('/settings')}
              style={{
                background: 'transparent', border: '1px solid var(--border-ui)',
                borderRadius: 8, padding: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', color: 'var(--fg-on-light-muted)',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'var(--bg-canvas)' }}>
          <Outlet context={outletCtx} />
        </div>
      </main>

      <RegisterPatientModal open={showRegister} onClose={() => setShowRegister(false)} />
      <NewAdmissionModal open={showNewAdmission} onClose={() => setShowNewAdmission(false)} />
    </div>
  );
}

function SearchGroup({ title, items, onSelect }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-card)' }}>
      <div style={{
        padding: '8px 16px 4px',
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'var(--fg-on-light-muted)',
      }}>
        {title}
      </div>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          style={{
            width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
            padding: '9px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 10, fontFamily: 'inherit', transition: 'background 80ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'var(--fg-on-light)', flexShrink: 0,
          }}>
            {item.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)' }}>{item.name}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>{item.id} · {item.sub}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
