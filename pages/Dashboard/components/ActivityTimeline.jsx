const activities = [
  'Patient Raj Patel admitted to ICU',
  'Lab report uploaded for PT-1002',
  'Billing generated for PT-1005',
  'Dr. Shah updated clinical notes',
];

export default function ActivityTimeline() {
  return (
    <div className="card">
      <h2 className="section-title mb-6">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="mt-2 h-3 w-3 rounded-full bg-cyan-600" />

            <p className="description">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
