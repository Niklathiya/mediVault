import { db } from '../firebase.js';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, runTransaction, addDoc,
} from 'firebase/firestore';

const COL = 'patients';

/** Real-time list — returns unsubscribe fn */
export function subscribePatients(cb, onErr) {
  const q = query(collection(db, COL), orderBy('name'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr);
}

/** Single patient document */
export async function getPatient(id) {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Patient doc + all subcollections in one call */
export async function getPatientFull(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;

  const [visits, prescriptions, labs, vitals, billings, documents, admissions] =
    await Promise.all([
      getDocs(collection(db, COL, id, 'visits')).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      getDocs(collection(db, COL, id, 'prescriptions')).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      getDocs(collection(db, COL, id, 'labs')).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      getDocs(collection(db, COL, id, 'vitals')).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      getDocs(collection(db, COL, id, 'billings')).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      getDocs(collection(db, COL, id, 'documents')).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      getDocs(collection(db, COL, id, 'admissions')).then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    ]);

  return {
    id: snap.id, ...snap.data(),
    visits, prescriptions, labs, vitals, billings, documents, admissions,
  };
}

/** Add new patient with sequential PT-XXXX id */
export async function addPatient(formData) {
  const counterRef = doc(db, 'counters', 'patients');
  const newId = await runTransaction(db, async (tx) => {
    const counter = await tx.get(counterRef);
    const next = counter.exists() ? counter.data().next : 1;
    tx.update(counterRef, { next: next + 1 });
    return `PT-${String(next).padStart(4, '0')}`;
  });

  const words    = (formData.name || '').trim().split(' ').filter(Boolean);
  const initials = words.map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'PT';
  const allergyArr = (formData.allergies || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  const data = {
    name:       formData.name.trim(),
    initials,
    dob:        formData.dob || '',
    age:        formData.age || '',
    sex:        formData.sex || 'Male',
    blood:      formData.blood || 'O+',
    phone:      formData.phone || '',
    email:      formData.email || '',
    address:    formData.address || '',
    hasAllergy: allergyArr.length > 0,
    allergies:  allergyArr,
    tags:       (formData.tags || '').split(',').map((s) => s.trim()).filter(Boolean),
    emergency: {
      name:     formData.emergencyName || '',
      relation: formData.emergencyRelation || '',
      phone:    formData.emergencyPhone || '',
    },
    insurance:  formData.insurance || '',
    status:     'active',
    registered: new Date().toISOString().slice(0, 10),
  };

  await setDoc(doc(db, COL, newId), data);
  return newId;
}

/** Update patient document fields */
export async function updatePatient(id, updates) {
  await updateDoc(doc(db, COL, id), updates);
}

/** Toggle archived ↔ active */
export async function toggleArchivePatient(id, currentStatus) {
  await updateDoc(doc(db, COL, id), {
    status: currentStatus === 'archived' ? 'active' : 'archived',
  });
}

/** Delete a subcollection item */
export async function deletePatientSubItem(patientId, subcol, itemId) {
  await deleteDoc(doc(db, COL, patientId, subcol, itemId));
}

/** Add item to a patient subcollection */
export async function addPatientSubItem(patientId, subcol, data) {
  return await addDoc(collection(db, COL, patientId, subcol), data);
}

/** Update an existing subcollection item */
export async function updatePatientSubItem(patientId, subcol, itemId, updates) {
  await updateDoc(doc(db, COL, patientId, subcol, itemId), updates);
}
