import WelcomeSection from './components/WelcomeSection';
import PatientJourney from './components/PatientJourney';
import KpiGrid from './components/KpiGrid';
import IpdAtGlance from './components/IpdAtGlance';
import RecentPatients from './components/RecentPatients';
import { useRBAC } from '../../context/useRBAC';

export default function Dashboard() {
  const { canSeeDashboardIpd } = useRBAC();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <WelcomeSection />
      <PatientJourney />
      <KpiGrid />
      {canSeeDashboardIpd && <IpdAtGlance />}
      <RecentPatients />
    </div>
  );
}
