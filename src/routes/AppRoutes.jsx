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
import { useRBAC } from '../context/RBACContext';

function ProtectedRoute({ module, children }) {
  const { canAccess } = useRBAC();
  return canAccess(module) ? children : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/seed" element={<SeedRunner />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route path="/patients" element={<ProtectedRoute module="patients"><Patients /></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute module="patients"><PatientDetail /></ProtectedRoute>} />

          <Route path="/admissions" element={<ProtectedRoute module="admissions"><Admissions /></ProtectedRoute>} />
          <Route path="/admissions/:id" element={<ProtectedRoute module="admissions"><AdmissionDetail /></ProtectedRoute>} />

          <Route path="/staff" element={<ProtectedRoute module="staff"><Navigate to="/staff/doctors" replace /></ProtectedRoute>} />
          <Route path="/staff/doctors" element={<ProtectedRoute module="staff"><Staff /></ProtectedRoute>} />
          <Route path="/staff/nurses" element={<ProtectedRoute module="staff"><Staff /></ProtectedRoute>} />
          <Route path="/staff/paramedical" element={<ProtectedRoute module="staff"><Staff /></ProtectedRoute>} />
          <Route path="/staff/admin" element={<ProtectedRoute module="staff"><Staff /></ProtectedRoute>} />

          <Route path="/billing" element={<ProtectedRoute module="billing"><Billing /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute module="activity"><ActivityLog /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute module="analytics"><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
