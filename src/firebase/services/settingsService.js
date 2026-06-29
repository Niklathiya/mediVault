import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/** Get hospital profile — returns { name, tagline, address, phone, email } */
export async function getHospitalProfile() {
  const snap = await getDoc(doc(db, 'settings', 'hospital'));
  return snap.exists() ? snap.data() : null;
}

/** Save / overwrite hospital profile */
export async function updateHospitalProfile(profileData) {
  await setDoc(doc(db, 'settings', 'hospital'), profileData, { merge: true });
}

/** Get wards config — returns { list: [{ name, beds }, ...] } */
export async function getWards() {
  const snap = await getDoc(doc(db, 'settings', 'wards'));
  return snap.exists() ? snap.data().list : [];
}

/** Save wards array */
export async function updateWards(wardsArray) {
  await setDoc(doc(db, 'settings', 'wards'), { list: wardsArray });
}
