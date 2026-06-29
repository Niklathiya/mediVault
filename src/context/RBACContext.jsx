import { createContext, useContext, useMemo, useState } from 'react';

export const ROLES = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  paramedical: 'Paramedical',
  admin: 'Admin / Receptionist',
};

export const ROLE_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

const ROLE_PROFILES = {
  doctor: {
    initials: 'DR',
    userName: 'Dr. Priya Mehta',
    dashboardMode: 'full',
    modules: {
      dashboard: 'full',
      patients: 'edit',
      patientProfile: 'full',
      visits: 'edit',
      prescriptions: 'edit',
      labs: 'edit',
      admissions: 'full',
      clinicalNotes: 'full',
      nursingNotes: 'view',
      billing: 'view',
      staff: 'view',
      analytics: 'view',
      activity: 'view',
      settings: 'none',
    },
    patientTabs: ['overview', 'visits', 'prescriptions', 'labs', 'vitals', 'documents', 'timeline', 'billing', 'admissions'],
    ipdTabs: 'all',
    ipdEditableTabs: 'all',
  },
  nurse: {
    initials: 'NU',
    userName: 'Nurse Asha Kumar',
    dashboardMode: 'full',
    modules: {
      dashboard: 'full',
      patients: 'view',
      patientProfile: 'nursing',
      visits: 'view',
      prescriptions: 'view',
      labs: 'view',
      admissions: 'nursing',
      clinicalNotes: 'none',
      nursingNotes: 'full',
      billing: 'none',
      staff: 'none',
      analytics: 'none',
      activity: 'none',
      settings: 'none',
    },
    patientTabs: ['overview', 'visits', 'prescriptions', 'labs', 'vitals', 'documents', 'timeline', 'admissions'],
    ipdTabs: ['overview', 'treatment', 'nursing', 'visits'],
    ipdEditableTabs: ['treatment', 'nursing', 'visits'],
  },
  paramedical: {
    initials: 'PM',
    userName: 'Ravi Kumar',
    dashboardMode: 'partial',
    modules: {
      dashboard: 'partial',
      patients: 'view',
      patientProfile: 'labs',
      visits: 'view',
      prescriptions: 'view',
      labs: 'edit',
      admissions: 'investigations',
      clinicalNotes: 'none',
      nursingNotes: 'none',
      billing: 'none',
      staff: 'none',
      analytics: 'none',
      activity: 'none',
      settings: 'none',
    },
    patientTabs: ['overview', 'visits', 'prescriptions', 'labs', 'documents', 'timeline', 'admissions'],
    ipdTabs: ['overview', 'investigations'],
    ipdEditableTabs: ['investigations'],
  },
  admin: {
    initials: 'AR',
    userName: 'Dr. Reception',
    dashboardMode: 'full',
    modules: {
      dashboard: 'full',
      patients: 'full',
      patientProfile: 'register',
      visits: 'view',
      prescriptions: 'view',
      labs: 'view',
      admissions: 'admin',
      clinicalNotes: 'none',
      nursingNotes: 'none',
      billing: 'full',
      staff: 'full',
      analytics: 'full',
      activity: 'full',
      settings: 'full',
    },
    patientTabs: ['overview', 'visits', 'prescriptions', 'labs', 'documents', 'timeline', 'billing', 'admissions'],
    ipdTabs: ['overview', 'consent', 'past-history', 'triage'],
    ipdEditableTabs: ['consent', 'past-history', 'triage'],
  },
};

const Ctx = createContext(null);

function canAccessValue(value) {
  return value && value !== 'none';
}

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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRBAC() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRBAC must be used inside RBACProvider');
  return ctx;
}
