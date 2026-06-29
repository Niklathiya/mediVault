import { UserPlus } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useRBAC } from '../../../context/useRBAC';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function todayStr() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function WelcomeSection() {
  const { openRegisterModal } = useOutletContext();
  const { canRegisterPatient, profile } = useRBAC();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        animation: 'mv-fade 200ms ease both',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--fg-on-light-muted)',
            fontWeight: 600,
          }}
        >
          Overview · {todayStr()}
        </div>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            margin: '8px 0 0',
            color: 'var(--fg-on-light)',
          }}
        >
          Good {getGreeting()}, {profile.userName}
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--fg-on-light-muted)', fontSize: 15 }}>
          Here's what's happening across the hospital today.
        </p>
      </div>
      {canRegisterPatient && (
        <button className="btn-primary" onClick={openRegisterModal}>
          <UserPlus size={16} />
          Register patient
        </button>
      )}
    </div>
  );
}
