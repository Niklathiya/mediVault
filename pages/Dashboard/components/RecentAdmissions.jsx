const admissions = [
  {
    patient: 'Raj Patel',
    room: 'ICU-12',
    doctor: 'Dr. Shah',
  },
  {
    patient: 'Priya Mehta',
    room: 'WARD-08',
    doctor: 'Dr. Patel',
  },
  {
    patient: 'Amit Kumar',
    room: 'PRIVATE-03',
    doctor: 'Dr. Desai',
  },
];

export default function RecentAdmissions() {
  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="section-title">Recent Admissions</h2>

        <button className="text-sm text-cyan-600">View All</button>
      </div>

      <div className="space-y-4">
        {admissions.map((item, index) => (
          <div key={index} className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <h4 className="font-semibold">{item.patient}</h4>

              <p className="description">{item.doctor}</p>
            </div>

            <span className="badge-info">{item.room}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
