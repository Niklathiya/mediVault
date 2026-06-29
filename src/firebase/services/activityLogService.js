import { db } from '../firebase.js';
import {
  collection, doc, addDoc, query, orderBy, limit, onSnapshot,
} from 'firebase/firestore';

const COL = 'activityLogs';

/** Real-time activity log — latest 200 entries, ordered by date desc, time sorted client-side */
export function subscribeLogs(cb, onErr) {
  const q = query(collection(db, COL), orderBy('date', 'desc'), limit(200));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (b.time || '').localeCompare(a.time || '');
      });
      cb(list);
    },
    onErr,
  );
}

/** Append a new activity log entry */
export async function addLog(data) {
  const today = new Date().toISOString().slice(0, 10);
  const time  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return addDoc(collection(db, COL), { ...data, date: today, time });
}
