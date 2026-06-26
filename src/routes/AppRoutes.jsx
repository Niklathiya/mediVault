import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';

import Dashboard from '../pages/Dashboard';
import Patients from '../pages/Patients';
import Admissions from '../pages/Admissions';
import Staff from '../pages/Staff';
import Billing from '../pages/Billing';
import Analytics from '../pages/Analytics';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/patients" element={<Patients />} />

          <Route path="/admissions" element={<Admissions />} />

          <Route path="/staff" element={<Staff />} />

          <Route path="/billing" element={<Billing />} />

          <Route path="/activity" element={<Analytics />} />

          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
