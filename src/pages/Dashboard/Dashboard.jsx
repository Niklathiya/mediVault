import WelcomeSection from './components/WelcomeSection';
import PatientJourney from './components/PatientJourney';
import KpiGrid from './components/KpiGrid';
import IpdAtGlance from './components/IpdAtGlance';
import RecentPatients from './components/RecentPatients';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <WelcomeSection />
      <PatientJourney />
      <KpiGrid />
      <IpdAtGlance />
      <RecentPatients />
    </div>
  );
}
