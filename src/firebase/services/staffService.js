import { db } from '../firebase.js';
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  query, where, onSnapshot,
} from 'firebase/firestore';

const COL = 'staff';

const ROLE_PREFIX = { doctors: 'D', nurses: 'N', paramedical: 'P', admin: 'A', support: 'S' };

/** Real-time list filtered by role — returns unsubscribe fn */
export function subscribeStaffByRole(role, cb, onErr) {
  const q = query(collection(db, COL), where('role', '==', role));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      cb(list);
    },
    onErr,
  );
}

/** Add new staff member */
export async function addStaff(role, formData, currentCount) {
  const prefix = ROLE_PREFIX[role] ?? 'X';
  const id = `${prefix}${String(currentCount + 1).padStart(3, '0')}`;

  const words    = (formData.name || '').trim().split(' ').filter(Boolean);
  const initials = words.map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  await setDoc(doc(db, COL, id), { ...formData, id, role, initials });
  return id;
}

/** Update staff member */
export async function updateStaff(id, updates) {
  await updateDoc(doc(db, COL, id), updates);
}

/** Delete staff member */
export async function deleteStaff(id) {
  await deleteDoc(doc(db, COL, id));
}
