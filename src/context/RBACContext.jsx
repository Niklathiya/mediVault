import { useMemo, useState } from 'react';
import { canAccessValue, ROLE_PROFILES, ROLES, RBACCtx } from './RBACConfig';

export function RBACProvider({ children }) {
  const [role, setRole] = useState('admin');
  const profile = ROLE_PROFILES[role];

  const value = useMemo(
    () => ({
      role,
      setRole,
      roleLabel: ROLES[role],
      profile,
      canAccess: (module) => canAccessValue(profile.modules[module]),
      access: (module) => profile.modules[module] || 'none',
      canEditPatientList: ['edit', 'full'].includes(profile.modules.patients),
      canRegisterPatient: profile.modules.patients === 'full',
      canEditPatientProfile: ['full', 'register'].includes(profile.modules.patientProfile),
      canAddVisit: profile.modules.visits === 'edit',
      canAddPrescription: profile.modules.prescriptions === 'edit',
      canAddLab: profile.modules.labs === 'edit',
      canRecordVitals: ['full', 'nursing'].includes(profile.modules.patientProfile),
      canViewBilling: canAccessValue(profile.modules.billing),
      canManageBilling: profile.modules.billing === 'full',
      canManageStaff: profile.modules.staff === 'full',
      canManageAdmissions: ['full', 'admin'].includes(profile.modules.admissions),
      canToggleAdmissionStatus: ['full', 'admin'].includes(profile.modules.admissions),
      canSeeDashboardIpd: profile.dashboardMode !== 'partial',
      canSeeDashboardRevenue: profile.dashboardMode !== 'partial',
      canUseIpdTab: (tabId) => profile.ipdTabs === 'all' || profile.ipdTabs.includes(tabId),
      canEditIpdTab: (tabId) => profile.ipdEditableTabs === 'all' || profile.ipdEditableTabs.includes(tabId),
      patientTabs: profile.patientTabs,
      ipdTabs: profile.ipdTabs,
    }),
    [profile, role],
  );

  return <RBACCtx.Provider value={value}>{children}</RBACCtx.Provider>;
}
