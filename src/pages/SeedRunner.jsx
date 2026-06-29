import { useState, useEffect } from 'react';

export default function SeedRunner() {
  const [lines, setLines]   = useState([]);
  const [status, setStatus] = useState('idle'); // idle | running | done | error

  const run = async () => {
    setLines([]);
    setStatus('running');
    try {
      const log = (msg) => setLines((prev) => [...prev, String(msg)]);
      const { seedDatabase } = await import('../firebase/seed.js');
      await seedDatabase(log);
      setStatus('done');
    } catch (err) {
      setLines((prev) => [...prev, '❌ ' + err.message]);
      setStatus('error');
    }
  };

  useEffect(() => { run(); }, []);

  const color = { idle: '#666', running: '#0891b2', done: '#16a34a', error: '#d95050' }[status];
  const label = { idle: 'Waiting…', running: 'Seeding…', done: '✅ Done!', error: '❌ Failed' }[status];

  return (
    <div style={{ fontFamily: 'monospace', padding: 32, background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ marginBottom: 16, fontSize: 20, fontWeight: 700, color }}>
        🌱 mediVault Seed Runner — {label}
      </div>
      <div style={{ background: '#1e293b', borderRadius: 10, padding: 20, fontSize: 13, lineHeight: 2, maxWidth: 700 }}>
        {lines.length === 0 && status === 'running' && (
          <div style={{ color: '#94a3b8' }}>Connecting to Firestore…</div>
        )}
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.startsWith('❌') ? '#f87171' : l.startsWith('✅') ? '#4ade80' : '#94a3b8' }}>
            {l}
          </div>
        ))}
      </div>
      {status === 'done' && (
        <div style={{ marginTop: 20, color: '#4ade80', fontSize: 14 }}>
          Database seeded successfully. You can now navigate to{' '}
          <a href="/" style={{ color: '#38bdf8' }}>the app</a> and remove the /seed route.
        </div>
      )}
      {status === 'error' && (
        <button
          onClick={run}
          style={{ marginTop: 16, background: '#0891b2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
