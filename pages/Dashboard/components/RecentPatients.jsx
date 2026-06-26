const patients = [
  {
    id: 'PT-1001',
    name: 'Raj Patel',
    age: 45,
    ward: 'ICU',
    status: 'Active',
  },
  {
    id: 'PT-1002',
    name: 'Amit Shah',
    age: 38,
    ward: 'General',
    status: 'Active',
  },
  {
    id: 'PT-1003',
    name: 'Neha Patel',
    age: 29,
    ward: 'Private',
    status: 'Discharge Soon',
  },
];

export default function RecentPatients() {
  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="section-title">Recent Patients</h2>

        <button className="text-cyan-600">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left">Patient ID</th>

              <th className="py-3 text-left">Name</th>

              <th className="py-3 text-left">Age</th>

              <th className="py-3 text-left">Ward</th>

              <th className="py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b">
                <td className="py-4">{patient.id}</td>

                <td>{patient.name}</td>

                <td>{patient.age}</td>

                <td>{patient.ward}</td>

                <td>
                  <span className="badge-success">{patient.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
