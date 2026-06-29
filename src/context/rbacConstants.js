export const ROLES = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  paramedical: 'Paramedical',
  admin: 'Admin',
};

export const ROLE_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({ value, label }));
