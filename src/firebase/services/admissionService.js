import { db } from '../firebase.js';
import {
  collection, doc, getDoc, setDoc, updateDoc,
  query, orderBy, onSnapshot, runTransaction,
} from 'firebase/firestore';

const COL = 'admissions';

/** Real-time list — returns unsubscribe fn */
export function subscribeAdmissions(cb, onErr) {
  const q = query(collection(db, COL), orderBy('admittedOn', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr);
}

/** Single admission document (includes casefile inline) */
export async function getAdmission(id) {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Add new admission with sequential IPD-YYYY-NNN id */
export async function addAdmission(formData) {
  const counterRef = doc(db, 'counters', 'admissions');
  const newId = await runTransaction(db, async (tx) => {
    const counter = await tx.get(counterRef);
    const next = counter.exists() ? counter.data().next : 1;
    tx.update(counterRef, { next: next + 1 });
    const year = new Date().getFullYear();
    return `IPD-${year}-${String(next).padStart(3, '0')}`;
  });

  const seq = newId.split('-')[2];
  const data = {
    ...formData,
    id:     newId,
    ipNo:   `IP/${new Date().getFullYear()}/${seq}`,
    status: 'admitted',
    dischargedOn:   null,
    dischargedTime: null,
    casefile: {
      carePlan: {}, medications: [], treatmentDates: [], treatmentList: [],
      clinicalNotes: [], nursingNotes: [], pathology: [], radiology: [],
      cardiology: [], equipment: [], dressing: [], traction: [], rounds: [],
    },
  };

  await setDoc(doc(db, COL, newId), data);
  return newId;
}

/** Update any fields on the admission doc */
export async function updateAdmission(id, updates) {
  await updateDoc(doc(db, COL, id), updates);
}

/** Discharge: set status, dischargedOn, dischargedTime */
export async function dischargeAdmission(id, dischargedOn, dischargedTime) {
  await updateDoc(doc(db, COL, id), {
    status: 'discharged',
    dischargedOn,
    dischargedTime: dischargedTime || '—',
  });
}
