import { UserPlus, Bed, Receipt, FileText } from 'lucide-react';

const actions = [
  {
    title: 'Register Patient',
    icon: UserPlus,
  },
  {
    title: 'New Admission',
    icon: Bed,
  },
  {
    title: 'Create Bill',
    icon: Receipt,
  },
  {
    title: 'Discharge Summary',
    icon: FileText,
  },
];

export default function QuickActions() {
  return (
    <div className="card">
      <h2 className="section-title mb-6">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="
                flex flex-col items-center
                justify-center
                rounded-2xl
                border
                p-6
                hover:bg-slate-50
                dark:hover:bg-slate-800
              "
            >
              <Icon size={28} className="mb-3 text-cyan-600" />

              <span className="text-sm font-medium">{action.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
