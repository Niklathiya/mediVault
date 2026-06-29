import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import SeedRunner from '../pages/SeedRunner';
import Dashboard from '../pages/Dashboard/Dashboard';
import Patients from '../pages/Patients';
import PatientDetail from '../pages/PatientDetail';
import Admissions from '../pages/Admissions';
import AdmissionDetail from '../pages/AdmissionDetail';
import Staff from '../pages/Staff';
import Billing from '../pages/Billing';
import Analytics from '../pages/Analytics';
import ActivityLog from '../pages/ActivityLog';
import Settings from '../pages/Settings';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/seed" element={<SeedRunner />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetail />} />

          <Route path="/admissions" element={<Admissions />} />
          <Route path="/admissions/:id" element={<AdmissionDetail />} />

          <Route path="/staff" element={<Navigate to="/staff/doctors" replace />} />
          <Route path="/staff/doctors" element={<Staff />} />
          <Route path="/staff/nurses" element={<Staff />} />
          <Route path="/staff/paramedical" element={<Staff />} />
          <Route path="/staff/admin" element={<Staff />} />
          <Route path="/staff/support" element={<Staff />} />

          <Route path="/billing" element={<Billing />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
