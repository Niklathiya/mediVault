import { db } from '../firebase.js';
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, getDocs, onSnapshot, runTransaction,
} from 'firebase/firestore';

const COL = 'bills';

/** Real-time list — returns unsubscribe fn */
export function subscribeBills(cb, onErr) {
  const q = query(collection(db, COL), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr);
}

/** Add new bill with sequential INV-YYYY-XXXX id */
export async function addBill(formData) {
  const counterRef = doc(db, 'counters', 'bills');
  const newId = await runTransaction(db, async (tx) => {
    const counter = await tx.get(counterRef);
    const next = counter.exists() ? counter.data().next : 1;
    tx.update(counterRef, { next: next + 1 });
    const year = new Date().getFullYear();
    return `INV-${year}-${String(next).padStart(4, '0')}`;
  });

  const today = new Date();
  const dateLabel = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const total = (formData.items || []).reduce(
    (s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0
  ) - (Number(formData.discount) || 0);

  const data = {
    ...formData,
    date: dateLabel,
    amount: Math.max(0, total),
    paid: 0,
    status: 'Pending',
    payments: [],
  };

  await setDoc(doc(db, COL, newId), data);
  return newId;
}

/** Update bill fields */
export async function updateBill(id, updates) {
  await updateDoc(doc(db, COL, id), updates);
}

/** Record a payment against a bill */
export async function recordPayment(id, paymentEntry, newPaid, newStatus) {
  const ref = doc(db, COL, id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Bill not found');
    const existing = snap.data().payments || [];
    tx.update(ref, {
      paid:     newPaid,
      status:   newStatus,
      payments: [...existing, paymentEntry],
    });
  });
}

/** Delete a bill */
export async function deleteBill(id) {
  await deleteDoc(doc(db, COL, id));
}

/** Fetch all Pending or Partial bills for a patient */
export async function getPatientPendingBills(patientId) {
  const snap = await getDocs(
    query(collection(db, COL), where('patientId', '==', patientId))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((b) => b.status === 'Pending' || b.status === 'Partial');
}
