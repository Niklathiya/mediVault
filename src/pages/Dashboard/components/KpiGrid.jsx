import { Users, FlaskConical, BedDouble, IndianRupee } from 'lucide-react';

const KPIs = [
  {
    label: 'Active patients',
    value: 128,
    badge: '+12 this month',
    badgeColor: '#15803d',
    badgeBg: 'rgba(78,179,116,0.10)',
    iconBg: '#f1f5f9',
    iconColor: '#0f172a',
    icon: Users,
  },
  {
    label: 'Pending lab reports',
    value: 7,
    badge: '3 urgent',
    badgeColor: '#92400e',
    badgeBg: 'rgba(217,164,65,0.12)',
    iconBg: 'rgba(217,164,65,0.10)',
    iconColor: '#d9a441',
    icon: FlaskConical,
  },
];

export default function KpiGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {KPIs.map(kpi => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="kpi-card" style={{ animation: 'mv-fade 220ms ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, background: kpi.iconBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.iconColor }}>
                <Icon size={18} />
              </div>
              <span style={{ fontSize: 11, color: kpi.badgeColor, background: kpi.badgeBg, padding: '3px 8px', borderRadius: 10, fontWeight: 500 }}>
                {kpi.badge}
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{kpi.label}</div>
          </div>
        );
      })}
    </div>
  );
}
