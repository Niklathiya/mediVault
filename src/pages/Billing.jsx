import { useState } from 'react';
import { Plus, X, IndianRupee, Printer } from 'lucide-react';

const BILLS = [
  { id: 'INV-2026-0042', patient: 'Ramesh Patel', initials: 'RP', date: '25 Jun 2026', items: ['IPD (3 days)', 'Surgery OT', 'Medications', 'Lab Tests'], amount: 28500, paid: 28500, status: 'Paid' },
  { id: 'INV-2026-0041', patient: 'Sunita Sharma', initials: 'SS', date: '24 Jun 2026', items: ['ICU (4 days)', 'Investigations', 'Nursing'], amount: 52000, paid: 26000, status: 'Partial' },
  { id: 'INV-2026-0040', patient: 'Ankit Mehta', initials: 'AM', date: '23 Jun 2026', items: ['Surgery OT', 'Anaesthesia', 'Post-op care'], amount: 35000, paid: 0, status: 'Unpaid' },
  { id: 'INV-2026-0039', patient: 'Priya Joshi', initials: 'PJ', date: '22 Jun 2026', items: ['Delivery room', 'OB care', 'Neonatal'], amount: 18000, paid: 18000, status: 'Paid' },
  { id: 'INV-2026-0038', patient: 'Vijay Kumar', initials: 'VK', date: '21 Jun 2026', items: ['General ward (7 days)', 'Lab reports'], amount: 14000, paid: 7000, status: 'Partial' },
  { id: 'INV-2026-0037', patient: 'Rekha Nair', initials: 'RN', date: '18 Jun 2026', items: ['Ortho surgery', 'Physiotherapy', 'Implant'], amount: 68000, paid: 68000, status: 'Paid' },
  { id: 'INV-2026-0036', patient: 'Santosh Gupta', initials: 'SG', date: '16 Jun 2026', items: ['General ward (12 days)', 'Medicines'], amount: 22000, paid: 0, status: 'Unpaid' },
];

const STATUS_MAP = {
  Paid: { color: '#15803d', bg: 'rgba(21,128,61,0.10)' },
  Partial: { color: '#d9a441', bg: 'rgba(217,164,65,0.12)' },
  Unpaid: { color: '#d95050', bg: 'rgba(217,80,80,0.10)' },
};

const fmt = n => '₹' + n.toLocaleString('en-IN');

const TAB_BASE = { padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 120ms', fontFamily: 'inherit' };

export default function Billing() {
  const [filter, setFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);

  const filtered = filter === 'all' ? BILLS : BILLS.filter(b => b.status === filter);
  const totalRevenue = BILLS.reduce((s, b) => s + b.paid, 0);
  const totalPending = BILLS.reduce((s, b) => s + (b.amount - b.paid), 0);
  const paidCount = BILLS.filter(b => b.status === 'Paid').length;

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-on-light-muted)', fontWeight: 600 }}>
            {filtered.length} invoices
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', margin: '8px 0 0', color: 'var(--fg-on-light)' }}>Billing</h1>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> New invoice
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total collected', value: fmt(totalRevenue), color: '#15803d', bg: 'rgba(21,128,61,0.08)' },
          { label: 'Pending amount', value: fmt(totalPending), color: '#d9a441', bg: 'rgba(217,164,65,0.08)' },
          { label: 'Total invoices', value: BILLS.length, color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
          { label: 'Fully paid', value: paidCount, color: 'var(--fg-on-light-muted)', bg: 'var(--surface-subtle)' },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 300, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'var(--surface)', border: '1px solid var(--border-ui)', borderRadius: 24, padding: 4, marginBottom: 18, width: 'fit-content' }}>
        {['all', 'Paid', 'Partial', 'Unpaid'].map(s => {
          const isActive = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              ...TAB_BASE,
              background: isActive ? 'var(--fg-on-light)' : 'transparent',
              color: isActive ? 'var(--surface)' : 'var(--fg-on-light-muted)',
            }}>
              {s === 'all' ? 'All' : s}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr 80px',
          padding: '12px 20px', background: 'var(--surface-subtle)',
          fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--fg-on-light-muted)', fontWeight: 600,
        }}>
          <div>Patient</div><div>Invoice</div><div>Date</div><div>Amount</div><div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {filtered.map(b => {
          const s = STATUS_MAP[b.status];
          const balance = b.amount - b.paid;
          return (
            <div
              key={b.id}
              style={{
                display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr 80px',
                padding: '14px 20px', borderTop: '1px solid var(--border-card)',
                alignItems: 'center', cursor: 'pointer', transition: 'background 120ms',
              }}
              onClick={() => setSelectedBill(b)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--fg-on-light)', flexShrink: 0 }}>{b.initials}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)' }}>{b.patient}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', fontFamily: 'monospace' }}>{b.id}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-on-light-muted)' }}>{b.date.split(' ').slice(0, 2).join(' ')}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-on-light)' }}>{fmt(b.amount)}</div>
                {balance > 0 && <div style={{ fontSize: 11, color: '#d9a441' }}>Balance: {fmt(balance)}</div>}
              </div>
              <div><span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 500 }}>{b.status}</span></div>
              <div style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button
                  onClick={e => e.stopPropagation()}
                  style={{ background: 'transparent', border: '1px solid var(--border-ui)', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--fg-on-light-muted)', display: 'flex', alignItems: 'center' }}
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill detail modal */}
      {selectedBill && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedBill(null)}
        >
          <div
            className="modal-panel"
            style={{ maxWidth: 480, background: 'var(--surface)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-on-light)' }}>{selectedBill.id}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>{selectedBill.patient} · {selectedBill.date}</div>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                style={{ background: 'transparent', border: '1px solid var(--border-ui)', color: 'var(--fg-on-light-muted)', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div style={{ padding: '18px 24px' }}>
              {selectedBill.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < selectedBill.items.length - 1 ? '1px solid var(--border-card)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light)' }}>{item}</span>
                  <span style={{ fontSize: 13, color: 'var(--fg-on-light-muted)' }}>{fmt(Math.floor(selectedBill.amount / selectedBill.items.length))}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ background: 'var(--surface-subtle)', padding: '16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--fg-on-light-muted)' }}>Total amount</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-on-light)' }}>{fmt(selectedBill.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--fg-on-light-muted)' }}>Paid</span>
                <span style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>{fmt(selectedBill.paid)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-ui)', paddingTop: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-on-light)' }}>Balance due</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: selectedBill.amount - selectedBill.paid > 0 ? '#d95050' : '#15803d' }}>
                  {fmt(selectedBill.amount - selectedBill.paid)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '14px 24px', display: 'flex', gap: 10 }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <IndianRupee size={14} /> Record payment
              </button>
              <button
                style={{
                  background: 'transparent', border: '1px solid var(--border-ui)', borderRadius: 8,
                  padding: '10px 14px', cursor: 'pointer', color: 'var(--fg-on-light-muted)',
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit',
                }}
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
