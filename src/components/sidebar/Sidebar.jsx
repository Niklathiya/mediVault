import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  BedDouble,
  UsersRound,
  Stethoscope,
  FlaskConical,
  Briefcase,
  Receipt,
  BarChart2,
  Activity,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';

const NAV_ITEM_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.85)',
  transition: 'background 120ms',
  textDecoration: 'none',
};

function SideNavItem({ to, icon: Icon, label, sub, badge }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...NAV_ITEM_STYLE,
        background: isActive ? '#e0f2fe1a' : 'transparent',
        color: isActive ? '#0891B2' : 'rgba(255,255,255,0.85)',
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains('active'))
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.getAttribute('aria-current'))
          e.currentTarget.style.background = 'transparent';
      }}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} style={{ flexShrink: 0, color: isActive ? '#0891B2' : 'inherit' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-[14px]">{label}</div>
            {sub && (
              <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 400, marginTop: 1 }}>{sub}</div>
            )}
          </div>
          {badge != null && (
            <span
              style={{
                fontSize: 11,
                background: 'rgba(255,255,255,0.12)',
                padding: '2px 8px',
                borderRadius: '100%',
                flexShrink: 0,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        padding: '14px 14px 4px',
        fontSize: 10,
        letterSpacing: '0.1em',
        opacity: 0.45,
        textTransform: 'uppercase',
        fontWeight: 600,
        color: '#ffffff',
      }}
    >
      {children}
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [teamOpen, setTeamOpen] = useState(false);
  const location = useLocation();
  const isTeamActive = [
    '/staff/doctors',
    '/staff/nurses',
    '/staff/paramedical',
    '/staff/admin',
    '/staff',
  ].some((p) => location.pathname.startsWith(p));

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: '#1c2b3a',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 0', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartPulse size={20} color="#0891B2" />
          </div>
          <div>
            <div style={{ fontSize: 18, color: 'white', letterSpacing: '-0.01em' }}>MediVault</div>
          </div>
        </div>

        <div style={{ height: 1, background: '#e0f2fe40', margin: '18px 0' }} />

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SideNavItem
            to="/"
            icon={LayoutDashboard}
            label="Dashboard"
            sub="Overview &amp; quick actions"
          />

          <SectionLabel>Clinical</SectionLabel>
          <SideNavItem
            to="/patients"
            icon={Users}
            label="Patients"
            sub="Register &amp; manage records"
            badge={6}
          />
          <SideNavItem
            to="/admissions"
            icon={BedDouble}
            label="IPD Admissions"
            sub="In-patient care &amp; case files"
            badge={5}
          />

          <SectionLabel>Team</SectionLabel>
          {/* Expandable Staff menu */}
          <button
            onClick={() => setTeamOpen((o) => !o)}
            style={{
              ...NAV_ITEM_STYLE,
              background: isTeamActive ? '#e0f2fe1a' : 'transparent',
              color: isTeamActive ? '#0891B2' : 'rgba(255,255,255,0.85)',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              transform: 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!isTeamActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={(e) => {
              if (!isTeamActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <UsersRound size={18} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div>Staff Directory</div>
              <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 400, marginTop: 1 }}>
                All hospital staff
              </div>
            </div>
            {teamOpen ? (
              <ChevronDown size={14} style={{ opacity: 0.5 }} />
            ) : (
              <ChevronRight size={14} style={{ opacity: 0.5 }} />
            )}
          </button>

          {teamOpen && (
            <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <SideNavItem to="/staff/doctors" icon={Stethoscope} label="Doctors" />
              <SideNavItem to="/staff/nurses" icon={HeartPulse} label="Nurses" />
              <SideNavItem to="/staff/paramedical" icon={FlaskConical} label="Paramedical" />
              <SideNavItem to="/staff/admin" icon={Briefcase} label="Administration" />
            </div>
          )}

          <SectionLabel>Finance</SectionLabel>
          <SideNavItem to="/billing" icon={Receipt} label="Billing" sub="Invoices &amp; payments" />
          <SectionLabel>Reports</SectionLabel>
          <SideNavItem
            to="/activity"
            icon={Activity}
            label="Activity Log"
            sub="All digital records"
          />
          <SideNavItem to="/analytics" icon={BarChart2} label="Analytics" sub="Monthly reports" />
        </nav>
      </div>

      {/* Bottom */}
      <div
        style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(186,236,85,0.10)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#e0f2fe1a',
              color: '#0891B2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            DR
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Dr. Reception
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
              Administrator
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
