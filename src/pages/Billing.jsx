import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, IndianRupee, Pencil, Eye, Check, ChevronDown, Printer } from 'lucide-react';
import {
  subscribeBills,
  addBill,
  updateBill,
  recordPayment,
} from '../firebase/services/billingService.js';
import { subscribePatients } from '../firebase/services/patientService.js';
import { useLocation } from 'react-router-dom';

const BILL_TYPES = ['OPD', 'IPD', 'Lab', 'Pharmacy', 'Emergency'];

const STATUS_STYLE = {
  Paid: { bg: '#dcfce7', color: '#15803d' },
  Partial: { bg: '#fef9c3', color: '#854d0e' },
  Pending: { bg: '#fee2e2', color: '#991b1b' },
};

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

const calcTotal = (items, discount) =>
  Math.max(
    0,
    items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0) -
      (Number(discount) || 0),
  );

function initForm(bill = null) {
  if (!bill)
    return {
      patient: '',
      type: 'OPD',
      items: [{ description: '', qty: 1, rate: 0 }],
      discount: 0,
      notes: '',
    };
  return {
    patient: bill.patient,
    type: bill.type,
    items: bill.items.map((i) => ({ ...i })),
    discount: bill.discount || 0,
    notes: bill.notes || '',
  };
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-strong)',
  borderRadius: 6,
  fontFamily: 'inherit',
  fontSize: 14,
  outline: 'none',
  color: 'var(--fg-on-light)',
  background: 'var(--bg-canvas)',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--fg-on-light-muted)',
  marginBottom: 4,
};

export default function Billing() {
  const location = useLocation();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState('All bills');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [modal, setModal] = useState(null); // { mode: 'view'|'edit'|'new', bill }
  const [form, setForm] = useState(initForm());
  const [payModal, setPayModal] = useState(null); // bill being paid
  const [payForm, setPayForm] = useState({ amount: '', mode: 'Cash', note: '' });

  const openView = (bill) => setModal({ mode: 'view', bill });
  const openEdit = (bill) => {
    setForm(initForm(bill));
    setModal({ mode: 'edit', bill });
  };
  const openNew = () => {
    setForm(initForm());
    setModal({ mode: 'new', bill: null });
  };
  const closeModal = () => setModal(null);

  useEffect(() => {
    if (!loading && bills.length > 0 && location.state?.openBillId) {
      const bill = bills.find((b) => b.id === location.state.openBillId);
      if (bill) {
        const mode = location.state.mode;
        window.history.replaceState({}, document.title);
        setTimeout(() => {
          if (mode === 'edit') {
            openEdit(bill);
          } else {
            openView(bill);
          }
        }, 0);
      }
    }
  }, [loading, bills, location.state]);

  useEffect(() => {
    const unsubB = subscribeBills(
      (data) => {
        setBills(data);
        setLoading(false);
      },
      (err) => {
        console.error('bills error:', err);
        setLoading(false);
      },
    );
    const unsubP = subscribePatients((data) => setPatients(data), console.error);
    return () => {
      unsubB();
      unsubP();
    };
  }, []);

  const filtered = (
    filter === 'All bills' ? bills : bills.filter((b) => b.status === filter)
  ).filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return b.patient.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
  });

  const totalBilled = bills.reduce((s, b) => s + b.amount, 0);
  const totalCollected = bills.reduce((s, b) => s + b.paid, 0);
  const totalOutstanding = bills.reduce((s, b) => s + (b.amount - b.paid), 0);

  const openPayModal = (bill) => {
    setPayForm({ amount: bill.amount - bill.paid, mode: 'Cash', note: '' });
    setPayModal(bill);
  };
  const closePayModal = () => setPayModal(null);

  const savePayment = async () => {
    const amt = Number(payForm.amount);
    if (!amt || !payModal) return;
    const now = new Date();
    const dateLabel = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newEntry = {
      amount: amt,
      date: dateLabel,
      note: payForm.note || '',
      mode: payForm.mode || 'Cash',
    };
    const newPaid = payModal.paid + amt;
    const newStatus = newPaid >= payModal.amount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
    await recordPayment(payModal.id, newEntry, newPaid, newStatus);
    closePayModal();
  };

  const printBill = (bill) => {
    const subtotal = bill.items.reduce((s, i) => s + i.qty * i.rate, 0);
    const total = subtotal - (bill.discount || 0);
    const balance = total - bill.paid;
    const rows = bill.items
      .map(
        (i) =>
          `<tr><td>${i.description}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">₹${Number(i.rate).toLocaleString('en-IN')}</td><td style="text-align:right">₹${Number(i.qty * i.rate).toLocaleString('en-IN')}</td></tr>`,
      )
      .join('');
    const payments = (bill.payments || [])
      .map(
        (p) =>
          `<tr><td>${p.date}</td><td>${p.mode || ''}</td><td style="text-align:right">₹${Number(p.amount).toLocaleString('en-IN')}</td><td>${p.note || ''}</td></tr>`,
      )
      .join('');
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${bill.id}</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px;color:#0f172a;font-size:14px}
      h1{font-size:22px;font-weight:700;margin-bottom:4px}
      .sub{color:#64748b;font-size:13px;margin-bottom:28px}
      .meta{display:flex;gap:32px;margin-bottom:24px;padding:14px 16px;background:#f1f5f9;border-radius:8px;font-size:13px}
      .meta span{color:#64748b}
      table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px}
      th{text-align:left;padding:8px 10px;background:#f1f5f9;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#64748b}
      td{padding:9px 10px;border-bottom:1px solid #f1f5f9}
      .totals{max-width:260px;margin-left:auto;font-size:13px}
      .totals tr td{padding:5px 0;border:none}
      .totals tr td:last-child{text-align:right;font-weight:600}
      .total-row td{font-size:15px;font-weight:700;color:#0f172a;padding-top:10px}
      .balance{color:${balance > 0 ? '#991b1b' : '#15803d'}}
      .badge{display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;background:${bill.status === 'Paid' ? '#dcfce7' : bill.status === 'Partial' ? '#fef9c3' : '#fee2e2'};color:${bill.status === 'Paid' ? '#15803d' : bill.status === 'Partial' ? '#854d0e' : '#991b1b'}}
      h3{font-size:13px;font-weight:600;margin-bottom:8px;margin-top:20px;color:#334155}
      @media print{body{padding:24px}}
    </style></head><body>
      <h1>Invoice — ${bill.id}</h1>
      <p class="sub">${bill.patient} &nbsp;·&nbsp; ${bill.type} &nbsp;·&nbsp; ${bill.date} &nbsp;&nbsp;<span class="badge">${bill.status}</span></p>
      <div class="meta"><div><span>Patient</span><br><strong>${bill.patient}</strong></div><div><span>Bill Type</span><br><strong>${bill.type}</strong></div><div><span>Date</span><br><strong>${bill.date}</strong></div>${bill.notes ? `<div><span>Notes</span><br><strong>${bill.notes}</strong></div>` : ''}</div>
      <h3>Line Items</h3>
      <table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <table class="totals"><tbody>
        <tr><td>Subtotal</td><td>₹${Number(subtotal).toLocaleString('en-IN')}</td></tr>
        ${bill.discount ? `<tr><td>Discount</td><td>− ₹${Number(bill.discount).toLocaleString('en-IN')}</td></tr>` : ''}
        <tr class="total-row"><td>Total</td><td>₹${Number(total).toLocaleString('en-IN')}</td></tr>
        <tr><td>Paid</td><td style="color:#15803d">₹${Number(bill.paid).toLocaleString('en-IN')}</td></tr>
        <tr><td>Balance</td><td class="balance">₹${Number(balance).toLocaleString('en-IN')}</td></tr>
      </tbody></table>
      ${payments ? `<h3>Payment History</h3><table><thead><tr><th>Date</th><th>Mode</th><th style="text-align:right">Amount</th><th>Note</th></tr></thead><tbody>${payments}</tbody></table>` : ''}
      <script>window.onload=()=>{ window.print(); }</script>
    </body></html>`);
    win.document.close();
  };

  const updateItem = (idx, field, val) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    }));
  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { description: '', qty: 1, rate: 0 }] }));
  const removeItem = (idx) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const saveBill = async () => {
    if (!modal) return;
    const total = calcTotal(form.items, form.discount);
    if (modal.mode === 'new') {
      const now = new Date();
      const dateLabel = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      await addBill({
        patient: form.patient,
        age: 0,
        sex: '-',
        date: dateLabel,
        type: form.type,
        items: form.items,
        discount: Number(form.discount) || 0,
        notes: form.notes || '',
        amount: total,
        paid: 0,
        status: 'Pending',
        payments: [],
      });
    } else {
      await updateBill(modal.bill.id, {
        items: form.items,
        discount: Number(form.discount) || 0,
        notes: form.notes || '',
        amount: total,
      });
    }
    closeModal();
  };

  const billTotal = calcTotal(form.items, form.discount);
  const viewBill = modal !== null && modal.mode === 'view' ? modal.bill : null;
  const editOpen = modal !== null && (modal.mode === 'edit' || modal.mode === 'new');
  const isNewBill = editOpen && modal !== null && modal.mode === 'new';
  const payBillOpen = payModal !== null;

  if (loading)
    return (
      <div
        style={{
          padding: 60,
          textAlign: 'center',
          color: 'var(--fg-on-light-muted)',
          fontSize: 14,
        }}
      >
        Loading billing records…
      </div>
    );

  return (
    <div style={{ animation: 'mv-fade 200ms ease both' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--fg-on-light-muted)',
            fontWeight: 600,
          }}
        >
          Finance
        </div>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            margin: '8px 0 0',
            color: 'var(--fg-on-light)',
          }}
        >
          Billing
        </h1>
        <p style={{ margin: '6px 0 0', color: 'var(--fg-on-light-muted)', fontSize: 14 }}>
          Track invoices, payments and collections.
        </p>
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: 'Total Billed', value: fmt(totalBilled), color: 'var(--fg-on-light)' },
          { label: 'Collected', value: fmt(totalCollected), color: '#15803d' },
          { label: 'Outstanding', value: fmt(totalOutstanding), color: '#991b1b' },
          { label: 'Total Bills', value: bills.length, color: 'var(--fg-on-light)' },
        ].map((k) => (
          <div
            key={k.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-card)',
              borderRadius: 10,
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'var(--fg-on-light-muted)',
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {k.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 300, lineHeight: 1, color: k.color }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter + New bill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={filter}
              onMouseDown={() => setFilterOpen((o) => !o)}
              onChange={(e) => {
                setFilter(e.target.value);
                setFilterOpen(false);
              }}
              onBlur={() => setFilterOpen(false)}
              style={{
                padding: '9px 36px 9px 14px',
                border: '1px solid var(--border-ui)',
                borderRadius: 8,
                background: 'var(--surface)',
                fontSize: 13,
                color: 'var(--fg-on-light)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                fontFamily: 'inherit',
              }}
            >
              {['All bills', 'Pending', 'Partial', 'Paid'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={13}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: `translateY(-50%) rotate(${filterOpen ? '180deg' : '0deg'})`,
                transition: 'transform 180ms ease',
                color: 'var(--fg-on-light-muted)',
                pointerEvents: 'none',
              }}
            />
          </div>
          <input
            type="text"
            placeholder="Search patient or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '9px 14px',
              border: '1px solid var(--border-ui)',
              borderRadius: 8,
              background: 'var(--surface)',
              fontSize: 13,
              color: 'var(--fg-on-light)',
              outline: 'none',
              width: 220,
              fontFamily: 'inherit',
            }}
          />
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> New bill
        </button>
      </div>

      {/* Bills table */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-card)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1.4fr 80px 110px 110px 110px 90px 80px',
            padding: '11px 20px',
            background: 'var(--surface-subtle)',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--fg-on-light-muted)',
            fontWeight: 600,
          }}
        >
          <div>Bill No.</div>
          <div>Patient</div>
          <div>Type</div>
          <div>Date</div>
          <div>Total</div>
          <div>Paid</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        {filtered.map((b) => {
          const s = STATUS_STYLE[b.status] || STATUS_STYLE.Pending;
          return (
            <div
              key={b.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1.4fr 80px 110px 110px 110px 90px 80px',
                padding: '13px 20px',
                borderTop: '1px solid var(--border-card)',
                alignItems: 'center',
                fontSize: 13,
                transition: 'background 120ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0891b2' }}>{b.id}</div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--fg-on-light)' }}>{b.patient}</div>
                {b.age > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)', marginTop: 1 }}>
                    Age {b.age} · {b.sex}
                  </div>
                )}
              </div>
              <div>
                <span
                  style={{
                    background: 'var(--surface-subtle)',
                    color: 'var(--fg-on-light)',
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {b.type}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)' }}>{b.date}</div>
              <div style={{ fontWeight: 600, color: 'var(--fg-on-light)' }}>{fmt(b.amount)}</div>
              <div style={{ fontWeight: 600, color: '#15803d' }}>{fmt(b.paid)}</div>
              <div>
                <span
                  style={{
                    background: s.bg,
                    color: s.color,
                    padding: '2px 9px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {b.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(b);
                  }}
                  title="Edit bill"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(15,23,42,0.10)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: 'var(--fg-on-light)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openView(b);
                  }}
                  title="View bill"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(15,23,42,0.10)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: 'var(--fg-on-light)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <Eye size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── VIEW MODAL ─────────────────────────────────────────────────────── */}
      {viewBill &&
        createPortal(
          <div className="modal-backdrop" onClick={closeModal}>
            <div
              className="modal-panel"
              style={{
                maxWidth: 900,
                maxHeight: 'calc(100vh - 48px)',
                overflowY: 'auto',
                boxShadow: '0 24px 80px rgba(15,23,42,0.18)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 28px',
                  borderBottom: '1px solid var(--border-card)',
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg-on-light)' }}>
                    Invoice — {viewBill.id}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>
                    {viewBill.patient} · {viewBill.type} · {viewBill.date}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {viewBill.amount - viewBill.paid > 0 && (
                    <button
                      onClick={() => openPayModal(viewBill)}
                      style={{
                        background: '#15803d',
                        color: 'white',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: 8,
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <IndianRupee size={14} /> Record Payment
                    </button>
                  )}
                  <button
                    onClick={() => printBill(viewBill)}
                    style={{
                      background: 'rgba(8,145,178,0.08)',
                      border: '1px solid rgba(8,145,178,0.20)',
                      color: '#0891b2',
                      padding: '9px 16px',
                      borderRadius: 8,
                      fontFamily: 'inherit',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Printer size={14} /> Print
                  </button>
                  <button
                    onClick={closeModal}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--fg-on-light)',
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Status row */}
              <div
                style={{
                  padding: '12px 28px',
                  background: 'var(--bg-canvas)',
                  borderBottom: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    background: STATUS_STYLE[viewBill.status]?.bg,
                    color: STATUS_STYLE[viewBill.status]?.color,
                    padding: '3px 10px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {viewBill.status}
                </span>
                <span style={{ fontSize: 13, color: 'var(--fg-on-light-muted)' }}>
                  Patient:{' '}
                  <strong style={{ color: 'var(--fg-on-light)' }}>{viewBill.patient}</strong>
                </span>
                <span style={{ fontSize: 13, color: 'var(--fg-on-light-muted)' }}>
                  Due: <strong style={{ color: 'var(--fg-on-light)' }}>{viewBill.date}</strong>
                </span>
                {viewBill.notes ? (
                  <span
                    style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', fontStyle: 'italic' }}
                  >
                    {viewBill.notes}
                  </span>
                ) : null}
              </div>

              {/* Two-column body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px' }}>
                {/* Left: line items */}
                <div style={{ padding: '24px 28px', borderRight: '1px solid var(--border-card)' }}>
                  {/* Items header */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 50px 90px 90px',
                      padding: '8px 0',
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--fg-on-light-muted)',
                      fontWeight: 600,
                      borderBottom: '1px solid var(--border-ui)',
                      marginBottom: 4,
                    }}
                  >
                    <div>Description</div>
                    <div style={{ textAlign: 'center' }}>Qty</div>
                    <div style={{ textAlign: 'right' }}>Rate</div>
                    <div style={{ textAlign: 'right' }}>Amount</div>
                  </div>

                  {/* Item rows */}
                  {viewBill.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 50px 90px 90px',
                        padding: '10px 0',
                        fontSize: 13,
                        borderBottom: '1px solid rgba(15,23,42,0.04)',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ color: 'var(--fg-on-light)' }}>{item.description}</div>
                      <div style={{ textAlign: 'center', color: 'var(--fg-on-light-muted)' }}>
                        {item.qty}
                      </div>
                      <div style={{ textAlign: 'right', color: 'var(--fg-on-light-muted)' }}>
                        {fmt(item.rate)}
                      </div>
                      <div
                        style={{ textAlign: 'right', fontWeight: 600, color: 'var(--fg-on-light)' }}
                      >
                        {fmt(item.qty * item.rate)}
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: '2px solid var(--border-ui)',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 260,
                        marginLeft: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
                      >
                        <span style={{ color: 'var(--fg-on-light-muted)' }}>Subtotal</span>
                        <span>{fmt(viewBill.items.reduce((s, i) => s + i.qty * i.rate, 0))}</span>
                      </div>
                      {viewBill.discount > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                            paddingBottom: 10,
                            borderBottom: '1px solid var(--border-card)',
                          }}
                        >
                          <span style={{ color: 'var(--fg-on-light-muted)' }}>Discount</span>
                          <span style={{ color: '#15803d' }}>− {fmt(viewBill.discount)}</span>
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 16,
                          fontWeight: 700,
                        }}
                      >
                        <span>Total</span>
                        <span style={{ color: '#0891b2' }}>{fmt(viewBill.amount)}</span>
                      </div>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
                      >
                        <span style={{ color: 'var(--fg-on-light-muted)' }}>Paid</span>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>
                          {fmt(viewBill.paid)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 14,
                          fontWeight: 700,
                          paddingTop: 8,
                          borderTop: '1px solid var(--border-card)',
                        }}
                      >
                        <span>Balance due</span>
                        <span
                          style={{
                            color: viewBill.amount - viewBill.paid > 0 ? '#991b1b' : '#15803d',
                          }}
                        >
                          {fmt(viewBill.amount - viewBill.paid)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: payment history */}
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--fg-on-light)',
                      marginBottom: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <IndianRupee size={14} style={{ color: '#15803d' }} /> Payment History
                  </div>

                  {(viewBill.payments || []).length > 0 ? (
                    <div
                      style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}
                    >
                      {viewBill.payments.map((py, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '10px 12px',
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--border-card)',
                            borderRadius: 8,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                              {fmt(py.amount)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--fg-on-light-muted)' }}>
                              {py.date}
                            </div>
                          </div>
                          {py.note ? (
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--fg-on-light-muted)',
                                marginTop: 3,
                              }}
                            >
                              {py.note}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 12,
                        color: 'var(--fg-on-light-muted)',
                        fontStyle: 'italic',
                        margin: '0 0 12px',
                      }}
                    >
                      No payments recorded.
                    </p>
                  )}

                  {viewBill.amount - viewBill.paid > 0 && (
                    <button
                      style={{
                        width: '100%',
                        background: '#15803d',
                        color: 'white',
                        border: 'none',
                        padding: 10,
                        borderRadius: 8,
                        fontFamily: 'inherit',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Plus size={14} /> Add payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── EDIT / NEW BILL MODAL ──────────────────────────────────────────── */}
      {editOpen &&
        createPortal(
          <div className="modal-backdrop" onClick={closeModal}>
            <div
              className="modal-panel"
              style={{ maxWidth: 560, background: 'var(--surface)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h2
                  style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--fg-on-light)' }}
                >
                  {isNewBill ? 'Add Bill' : 'Edit Bill'}
                </h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--fg-on-light-muted)',
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form body */}
              <div
                style={{ padding: '22px 24px', overflowY: 'auto', maxHeight: 'calc(90vh - 150px)' }}
              >
                {/* Patient + Bill Type */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <label style={{ display: 'block' }}>
                    <span style={labelStyle}>Patient{isNewBill ? ' *' : ''}</span>
                    {isNewBill ? (
                      <select
                        value={form.patient}
                        onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}
                        style={{ ...inputStyle, marginTop: 4 }}
                      >
                        <option value="">— Select patient —</option>
                        {patients
                          .filter((p) => p.status !== 'archived')
                          .map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} ({p.id})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div
                        style={{
                          ...inputStyle,
                          marginTop: 4,
                          background: 'var(--surface-subtle)',
                          border: '1px solid rgba(15,23,42,0.08)',
                          fontWeight: 500,
                        }}
                      >
                        {form.patient}
                      </div>
                    )}
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={labelStyle}>Bill Type</span>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      style={{ ...inputStyle, marginTop: 4 }}
                    >
                      {BILL_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Line Items */}
                <div style={{ marginBottom: 12 }}>
                  <span style={labelStyle}>Line Items</span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px 100px 100px',
                      gap: 6,
                      marginBottom: 6,
                      fontSize: 11,
                      color: 'var(--fg-on-light-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <div>Description</div>
                    <div style={{ textAlign: 'center' }}>Qty</div>
                    <div>Rate (₹)</div>
                    <div>Amount (₹)</div>
                  </div>

                  {form.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 60px 100px 100px',
                        gap: 6,
                        marginBottom: 6,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="e.g. Consultation fee"
                        style={{
                          padding: '8px 10px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 6,
                          fontFamily: 'inherit',
                          fontSize: 13,
                          outline: 'none',
                          color: 'var(--fg-on-light)',
                          background: 'var(--bg-canvas)',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="number"
                        value={item.qty}
                        min={1}
                        onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                        style={{
                          padding: '8px 6px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 6,
                          fontFamily: 'inherit',
                          fontSize: 13,
                          outline: 'none',
                          textAlign: 'center',
                          color: 'var(--fg-on-light)',
                          background: 'var(--bg-canvas)',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="number"
                        value={item.rate}
                        min={0}
                        placeholder="0"
                        onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 6,
                          fontFamily: 'inherit',
                          fontSize: 13,
                          outline: 'none',
                          color: 'var(--fg-on-light)',
                          background: 'var(--bg-canvas)',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          readOnly
                          value={(Number(item.qty) || 0) * (Number(item.rate) || 0)}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            border: '1px solid rgba(15,23,42,0.08)',
                            borderRadius: 6,
                            fontFamily: 'inherit',
                            fontSize: 13,
                            background: 'var(--surface-subtle)',
                            outline: 'none',
                            color: 'var(--fg-on-light)',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        />
                        {form.items.length > 1 && (
                          <button
                            onClick={() => removeItem(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#d95050',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              fontSize: 18,
                              lineHeight: 1,
                              flexShrink: 0,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addItem}
                    style={{
                      background: 'transparent',
                      border: '1px dashed rgba(8,145,178,0.35)',
                      color: '#0891b2',
                      padding: '8px 14px',
                      borderRadius: 6,
                      fontFamily: 'inherit',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: '100%',
                      marginTop: 2,
                    }}
                  >
                    + Add item
                  </button>
                </div>

                {/* Discount + Notes */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <label style={{ display: 'block' }}>
                    <span style={labelStyle}>Discount (₹)</span>
                    <input
                      type="number"
                      value={form.discount}
                      min={0}
                      placeholder="0"
                      onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                      style={{ ...inputStyle, marginTop: 4 }}
                    />
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={labelStyle}>Notes</span>
                    <input
                      value={form.notes}
                      placeholder="Insurance, TPA, etc."
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      style={{ ...inputStyle, marginTop: 4 }}
                    />
                  </label>
                </div>

                {/* Bill total */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--surface-subtle)',
                    borderRadius: 8,
                    fontSize: 13,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--fg-on-light-muted)' }}>Bill total</span>
                  <strong style={{ color: '#0891b2', fontSize: 16 }}>{fmt(billTotal)}</strong>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-card)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  background: 'var(--surface-subtle)',
                  borderRadius: '0 0 14px 14px',
                }}
              >
                <button
                  onClick={closeModal}
                  style={{
                    background: 'transparent',
                    color: 'var(--fg-on-light)',
                    border: '1px solid var(--border-strong)',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button onClick={saveBill} className="btn-primary">
                  <Check size={15} /> Save Bill
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── RECORD PAYMENT MODAL ──────────────────────────────────────────── */}
      {payBillOpen &&
        createPortal(
          <div className="modal-backdrop" onClick={closePayModal}>
            <div
              className="modal-panel"
              style={{ maxWidth: 440 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-on-light)' }}>
                    Record Payment
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-on-light-muted)', marginTop: 2 }}>
                    {payModal.id} · {payModal.patient}
                  </div>
                </div>
                <button
                  onClick={closePayModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--fg-on-light-muted)',
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Balance summary */}
              <div
                style={{
                  padding: '12px 24px',
                  background: '#fef9c3',
                  borderBottom: '1px solid var(--border-card)',
                  display: 'flex',
                  gap: 24,
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--fg-on-light-muted)' }}>
                  Total:{' '}
                  <strong style={{ color: 'var(--fg-on-light)' }}>{fmt(payModal.amount)}</strong>
                </span>
                <span style={{ color: 'var(--fg-on-light-muted)' }}>
                  Paid: <strong style={{ color: '#15803d' }}>{fmt(payModal.paid)}</strong>
                </span>
                <span style={{ color: 'var(--fg-on-light-muted)' }}>
                  Balance:{' '}
                  <strong style={{ color: '#991b1b' }}>
                    {fmt(payModal.amount - payModal.paid)}
                  </strong>
                </span>
              </div>

              {/* Form */}
              <div
                style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Amount (₹)</span>
                  <input
                    type="number"
                    value={payForm.amount}
                    min={1}
                    max={payModal.amount - payModal.paid}
                    onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                    style={{ ...inputStyle, marginTop: 4 }}
                    autoFocus
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Payment Mode</span>
                  <select
                    value={payForm.mode}
                    onChange={(e) => setPayForm((f) => ({ ...f, mode: e.target.value }))}
                    style={{ ...inputStyle, marginTop: 4, cursor: 'pointer' }}
                  >
                    {['Cash', 'Card', 'UPI', 'Cheque', 'Insurance'].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'block' }}>
                  <span style={labelStyle}>Note (optional)</span>
                  <input
                    value={payForm.note}
                    placeholder="e.g. Cash received at counter"
                    onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))}
                    style={{ ...inputStyle, marginTop: 4 }}
                  />
                </label>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '14px 24px',
                  borderTop: '1px solid var(--border-card)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  background: 'var(--surface-subtle)',
                  borderRadius: '0 0 16px 16px',
                }}
              >
                <button
                  onClick={closePayModal}
                  style={{
                    background: 'transparent',
                    color: 'var(--fg-on-light)',
                    border: '1px solid var(--border-strong)',
                    padding: '9px 16px',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={savePayment}
                  style={{
                    background: '#15803d',
                    color: 'white',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <IndianRupee size={14} /> Save Payment
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
