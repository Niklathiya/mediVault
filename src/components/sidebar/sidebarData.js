import {
  LayoutGrid,
  Users,
  Bed,
  UserRoundCog,
  ReceiptText,
  Activity,
  BarChart3,
} from 'lucide-react';

export const sidebarMenu = [
  {
    title: 'Dashboard',
    description: 'Overview & quick actions',
    icon: LayoutGrid,
    path: '/',
  },
];

export const sidebarSections = [
  {
    label: 'Clinical',
    items: [
      {
        title: 'Patients',
        description: 'Register & manage records',
        icon: Users,
        path: '/patients',
        badge: 6,
      },
      {
        title: 'IPD Admissions',
        description: 'In-patient care & case files',
        icon: Bed,
        path: '/admissions',
        badge: 3,
      },
    ],
  },
  {
    label: 'Team',
    items: [
      {
        title: 'Staff Directory',
        description: 'All hospital staff',
        icon: UserRoundCog,
        path: '/staff',
        arrow: true,
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        title: 'Billing',
        description: 'Invoices & payments',
        icon: ReceiptText,
        path: '/billing',
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        title: 'Activity Log',
        description: 'All digital records',
        icon: Activity,
        path: '/activity',
      },
      {
        title: 'Analytics',
        description: 'Monthly reports',
        icon: BarChart3,
        path: '/analytics',
      },
    ],
  },
];
