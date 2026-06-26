const tasks = [
  '2 lab reports pending review',
  '1 discharge summary pending',
  '3 bills awaiting payment',
  '4 follow-up appointments today',
];

export default function PendingTasks() {
  return (
    <div className="card">
      <h2 className="section-title mb-6">Pending Tasks</h2>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center justify-between rounded-xl border p-4">
            <span>{task}</span>

            <span className="badge-warning">Pending</span>
          </div>
        ))}
      </div>
    </div>
  );
}
