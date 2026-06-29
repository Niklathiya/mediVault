/**
 * One-time Firestore seed script.
 * Call from browser console: import('/src/firebase/seed.js').then(m => m.seedDatabase(console.log))
 * Or trigger from the DevSeed page at /dev/seed.
 */

import { db } from './firebase.js';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';

// ── PATIENTS ──────────────────────────────────────────────────────────────────

const PATIENTS_BASIC = [
  {
    id: 'PT-0128', name: 'Kiran Desai', initials: 'KD', dob: '1992-03-14', age: '34',
    sex: 'Male', blood: 'B+', phone: '98765 43210', email: 'kiran.desai@email.com',
    address: '12 MG Road, Bengaluru, Karnataka 560001',
    hasAllergy: false, allergies: [], tags: ['Diabetes', 'Hypertension'],
    emergency: { name: 'Priya Desai', relation: 'Spouse', phone: '98765 43211' },
    insurance: 'Star Health · POL-001234', status: 'active', registered: '2026-06-10',
  },
  {
    id: 'PT-0127', name: 'Meena Agarwal', initials: 'MA', dob: '1974-07-22', age: '52',
    sex: 'Female', blood: 'O+', phone: '87654 32109', email: 'meena.agarwal@email.com',
    address: '45 Civil Lines, Allahabad, UP 211001',
    hasAllergy: true, allergies: ['Penicillin', 'Aspirin'], tags: ['Hypertension', 'Cardiac'],
    emergency: { name: 'Ramesh Agarwal', relation: 'Husband', phone: '87654 00002' },
    insurance: 'Max Bupa · POL-002345', status: 'admitted', registered: '2026-06-08',
  },
  {
    id: 'PT-0126', name: 'Suresh Rao', initials: 'SR', dob: '1958-11-05', age: '67',
    sex: 'Male', blood: 'A+', phone: '76543 21098', email: 'suresh.rao@email.com',
    address: '78 Anna Salai, Chennai, TN 600002',
    hasAllergy: false, allergies: [], tags: ['Cardiac', 'Diabetes'],
    emergency: { name: 'Kavitha Rao', relation: 'Daughter', phone: '76543 00003' },
    insurance: 'HDFC Ergo · POL-003456', status: 'discharged', registered: '2026-06-05',
  },
  {
    id: 'PT-0125', name: 'Anjali Shah', initials: 'AS', dob: '1998-01-30', age: '28',
    sex: 'Female', blood: 'AB-', phone: '65432 10987', email: 'anjali.shah@email.com',
    address: '9 Satellite Road, Ahmedabad, GJ 380015',
    hasAllergy: true, allergies: ['Latex'], tags: [],
    emergency: { name: 'Nikhil Shah', relation: 'Brother', phone: '65432 00004' },
    insurance: '', status: 'admitted', registered: '2026-06-02',
  },
  {
    id: 'PT-0124', name: 'Mohan Trivedi', initials: 'MT', dob: '1981-06-18', age: '45',
    sex: 'Male', blood: 'O-', phone: '54321 09876', email: 'mohan.trivedi@email.com',
    address: '33 Residency Road, Indore, MP 452001',
    hasAllergy: false, allergies: [], tags: ['Asthma'],
    emergency: { name: 'Sunita Trivedi', relation: 'Wife', phone: '54321 00005' },
    insurance: 'Oriental Insurance · POL-004567', status: 'active', registered: '2026-05-30',
  },
  {
    id: 'PT-0123', name: 'Lakshmi Nair', initials: 'LN', dob: '1988-09-10', age: '38',
    sex: 'Female', blood: 'A-', phone: '43210 98765', email: 'lakshmi.nair@email.com',
    address: '22 Pattom, Thiruvananthapuram, KL 695004',
    hasAllergy: false, allergies: [], tags: ['Thyroid'],
    emergency: { name: 'Arun Nair', relation: 'Husband', phone: '43210 00006' },
    insurance: 'LIC Health · POL-005678', status: 'active', registered: '2026-05-28',
  },
  {
    id: 'PT-0122', name: 'Deepak Verma', initials: 'DV', dob: '1969-12-25', age: '55',
    sex: 'Male', blood: 'B-', phone: '32109 87654', email: 'deepak.verma@email.com',
    address: '5 Civil Lines, Lucknow, UP 226001',
    hasAllergy: false, allergies: [], tags: ['Cardiac'],
    emergency: { name: 'Seema Verma', relation: 'Wife', phone: '32109 00007' },
    insurance: 'United India · POL-006789', status: 'archived', registered: '2026-05-15',
  },
  {
    id: 'PT-0121', name: 'Sonal Mehta', initials: 'SM', dob: '1983-04-02', age: '41',
    sex: 'Female', blood: 'AB+', phone: '21098 76543', email: 'sonal.mehta@email.com',
    address: '16 Koregaon Park, Pune, MH 411001',
    hasAllergy: true, allergies: ['Sulfa drugs'], tags: ['Diabetes'],
    emergency: { name: 'Rajesh Mehta', relation: 'Husband', phone: '21098 00008' },
    insurance: 'Care Health · POL-007890', status: 'archived', registered: '2026-05-10',
  },
];

const PT_0128_SUBS = {
  visits: [
    { id: 'V001', date: '2026-06-22', dateLabel: '22 Jun 2026', dateBig: '22', dateMonth: 'Jun 2026',
      doctor: 'Dr. Priya Mehta', dept: 'General Medicine',
      complaint: 'High blood sugar, fatigue, increased thirst',
      diagnosis: 'Type 2 Diabetes — uncontrolled',
      treatment: 'Metformin dose adjusted, dietary counselling',
      notes: 'Patient advised to maintain food diary and follow up in 4 weeks.' },
    { id: 'V002', date: '2026-06-08', dateLabel: '08 Jun 2026', dateBig: '08', dateMonth: 'Jun 2026',
      doctor: 'Dr. Priya Mehta', dept: 'General Medicine',
      complaint: 'Routine checkup, BP monitoring',
      diagnosis: 'Hypertension — controlled',
      treatment: 'Continue Amlodipine 5mg, low-sodium diet',
      notes: 'BP improved since last visit. Weight stable.' },
  ],
  prescriptions: [
    { id: 'RX001', date: '22 Jun 2026', drug: 'Metformin 500mg', dosage: '1-0-1', frequency: 'Twice daily', duration: '30 days', doctor: 'Dr. Priya Mehta' },
    { id: 'RX002', date: '22 Jun 2026', drug: 'Amlodipine 5mg', dosage: '1-0-0', frequency: 'Once daily', duration: '30 days', doctor: 'Dr. Priya Mehta' },
    { id: 'RX003', date: '08 Jun 2026', drug: 'Telmisartan 40mg', dosage: '0-0-1', frequency: 'Once daily (evening)', duration: '30 days', doctor: 'Dr. Priya Mehta' },
  ],
  labs: [
    { id: 'L001', date: '20 Jun 2026', test: 'HbA1c', result: '7.2%', normal: '< 5.7%', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L002', date: '20 Jun 2026', test: 'Fasting Glucose', result: '126 mg/dL', normal: '70–100', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L003', date: '20 Jun 2026', test: 'Creatinine', result: '0.9 mg/dL', normal: '0.6–1.2', status: 'Normal', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L004', date: '20 Jun 2026', test: 'Lipid Profile (LDL)', result: '138 mg/dL', normal: '< 100', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
  ],
  vitals: [
    { id: 'VT001', date: '22 Jun 2026', bp: '138/88', bpSys: 138, bpDia: 88, pulse: '78', spo2: '98', temp: '98.4', wt: '72' },
    { id: 'VT002', date: '08 Jun 2026', bp: '142/90', bpSys: 142, bpDia: 90, pulse: '82', spo2: '97', temp: '98.6', wt: '73' },
  ],
  billings: [
    { id: 'INV-2026-0035', date: '22 Jun 2026', type: 'OPD', amount: 1200, paid: 1200, status: 'paid' },
    { id: 'INV-2026-0020', date: '08 Jun 2026', type: 'OPD', amount: 800, paid: 800, status: 'paid' },
  ],
  admissions: [
    { id: 'IPD-2026-042', ipNo: 'IP/2026/042', admittedOn: '2026-06-23', admittedTime: '09:15 AM',
      admittingDoctor: 'Dr. Priya Mehta', ward: 'General', bedNo: '4A',
      dischargedOn: null, dischargedTime: null, status: 'admitted' },
  ],
  documents: [
    { id: 'DOC001', name: 'Blood Report June 2026', type: 'Lab Report', date: '20 Jun 2026', notes: 'HbA1c and FBS panel' },
    { id: 'DOC002', name: 'ECG Report', type: 'Cardiology', date: '08 Jun 2026', notes: '' },
  ],
};

const PT_0127_SUBS = {
  visits: [
    { id: 'V003', date: '2026-06-08', dateLabel: '08 Jun 2026', dateBig: '08', dateMonth: 'Jun 2026',
      doctor: 'Dr. Arjun Rao', dept: 'Cardiology',
      complaint: 'Chest pain, shortness of breath',
      diagnosis: 'Hypertensive crisis, suspected STEMI',
      treatment: 'Admitted to ICU for monitoring and cardiac intervention',
      notes: 'Referred to ICU. Cardiac team on standby.' },
  ],
  prescriptions: [
    { id: 'RX004', date: '08 Jun 2026', drug: 'Amlodipine 10mg', dosage: '1-0-0', frequency: 'Once daily', duration: '30 days', doctor: 'Dr. Arjun Rao' },
    { id: 'RX005', date: '08 Jun 2026', drug: 'Losartan 50mg', dosage: '1-0-0', frequency: 'Once daily', duration: '30 days', doctor: 'Dr. Arjun Rao' },
    { id: 'RX006', date: '22 Jun 2026', drug: 'Atorvastatin 40mg', dosage: '0-0-1', frequency: 'Once daily (evening)', duration: '30 days', doctor: 'Dr. Arjun Rao' },
  ],
  labs: [
    { id: 'L005', date: '09 Jun 2026', test: 'ECG', result: 'Sinus rhythm', normal: 'Normal sinus', status: 'Normal', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.1)', doctor: 'Dr. Arjun Rao' },
    { id: 'L006', date: '09 Jun 2026', test: 'Troponin I', result: '0.12 ng/mL', normal: '< 0.04', status: 'High', statusColor: '#d95050', statusBg: 'rgba(217,80,80,0.1)', doctor: 'Dr. Arjun Rao' },
  ],
  vitals: [
    { id: 'VT003', date: '22 Jun 2026', bp: '148/94', bpSys: 148, bpDia: 94, pulse: '84', spo2: '96', temp: '99.1', wt: '68' },
    { id: 'VT004', date: '09 Jun 2026', bp: '158/98', bpSys: 158, bpDia: 98, pulse: '88', spo2: '96', temp: '99.1', wt: '68' },
  ],
  billings: [
    { id: 'INV-2026-0040', date: '08 Jun 2026', type: 'IPD', amount: 55000, paid: 20000, status: 'partial' },
  ],
  admissions: [
    { id: 'IPD-2026-041', ipNo: 'IP/2026/041', admittedOn: '2026-06-22', admittedTime: '02:30 PM',
      admittingDoctor: 'Dr. Arjun Rao', ward: 'ICU', bedNo: '2',
      dischargedOn: null, dischargedTime: null, status: 'admitted' },
  ],
  documents: [
    { id: 'DOC003', name: 'ECG Strip — 09 Jun 2026', type: 'Cardiology', date: '09 Jun 2026', notes: 'STEMI pattern' },
  ],
};

// PT-0126 — Suresh Rao, 67M, Cardiac + Diabetes, discharged
const PT_0126_SUBS = {
  visits: [
    { id: 'V010', date: '2026-06-05', dateLabel: '05 Jun 2026', dateBig: '05', dateMonth: 'Jun 2026', doctor: 'Dr. Arjun Rao', dept: 'Cardiology', complaint: 'Chest tightness, breathlessness on exertion', diagnosis: 'Stable angina, Type 2 Diabetes', treatment: 'Nitrate therapy, insulin dose adjusted', notes: 'Referred for stress echo. Dietary counselling given.' },
    { id: 'V011', date: '2026-05-20', dateLabel: '20 May 2026', dateBig: '20', dateMonth: 'May 2026', doctor: 'Dr. Priya Mehta', dept: 'General Medicine', complaint: 'Fatigue, high blood sugar', diagnosis: 'Poorly controlled T2DM', treatment: 'Insulin adjustment, Metformin continued', notes: 'HbA1c 9.1% — target < 7%. Follow up in 2 weeks.' },
  ],
  prescriptions: [
    { id: 'RX010', date: '05 Jun 2026', drug: 'Isosorbide Mononitrate 10mg', dosage: '1-0-1', frequency: 'Twice daily', duration: '30 days', doctor: 'Dr. Arjun Rao' },
    { id: 'RX011', date: '05 Jun 2026', drug: 'Atorvastatin 40mg', dosage: '0-0-1', frequency: 'Once daily (evening)', duration: '30 days', doctor: 'Dr. Arjun Rao' },
    { id: 'RX012', date: '20 May 2026', drug: 'Metformin 1g', dosage: '1-0-1', frequency: 'Twice daily with meals', duration: '30 days', doctor: 'Dr. Priya Mehta' },
  ],
  labs: [
    { id: 'L010', date: '04 Jun 2026', test: 'HbA1c', result: '9.1%', normal: '< 5.7%', status: 'High', statusColor: '#d95050', statusBg: 'rgba(217,80,80,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L011', date: '04 Jun 2026', test: 'Troponin I', result: '0.02 ng/mL', normal: '< 0.04', status: 'Normal', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.1)', doctor: 'Dr. Arjun Rao' },
    { id: 'L012', date: '04 Jun 2026', test: 'LDL Cholesterol', result: '162 mg/dL', normal: '< 100', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Arjun Rao' },
  ],
  vitals: [
    { id: 'VT010', date: '05 Jun 2026', bp: '146/92', bpSys: 146, bpDia: 92, pulse: '80', spo2: '97', temp: '98.2', wt: '82' },
    { id: 'VT011', date: '20 May 2026', bp: '150/96', bpSys: 150, bpDia: 96, pulse: '84', spo2: '96', temp: '98.4', wt: '83' },
  ],
  billings: [
    { id: 'INV-2026-0030', date: '05 Jun 2026', type: 'OPD', amount: 1500, paid: 1500, status: 'paid' },
  ],
  admissions: [],
  documents: [
    { id: 'DOC010', name: 'Stress Echo Report — Jun 2026', type: 'Cardiology', date: '05 Jun 2026', notes: 'Mild ischaemia on exertion' },
  ],
};

// PT-0125 — Anjali Shah, 28F, Latex allergy, admitted
const PT_0125_SUBS = {
  visits: [
    { id: 'V012', date: '2026-06-02', dateLabel: '02 Jun 2026', dateBig: '02', dateMonth: 'Jun 2026', doctor: 'Dr. Kavita Singh', dept: 'Maternity', complaint: 'Labour pains, scheduled delivery', diagnosis: 'Term pregnancy — active labour', treatment: 'Admitted for normal delivery, labour monitored', notes: 'Latex allergy documented. Latex-free gloves used throughout.' },
  ],
  prescriptions: [
    { id: 'RX013', date: '02 Jun 2026', drug: 'Iron + Folic Acid', dosage: '1-0-0', frequency: 'Once daily', duration: '30 days', doctor: 'Dr. Kavita Singh' },
    { id: 'RX014', date: '02 Jun 2026', drug: 'Calcium Carbonate 500mg', dosage: '0-1-0', frequency: 'Once daily', duration: '30 days', doctor: 'Dr. Kavita Singh' },
  ],
  labs: [
    { id: 'L013', date: '01 Jun 2026', test: 'Haemoglobin', result: '11.2 g/dL', normal: '12–16', status: 'Low', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Kavita Singh' },
    { id: 'L014', date: '01 Jun 2026', test: 'Blood Group & Rh', result: 'AB Negative', normal: '—', status: 'Normal', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.1)', doctor: 'Dr. Kavita Singh' },
  ],
  vitals: [
    { id: 'VT012', date: '02 Jun 2026', bp: '118/76', bpSys: 118, bpDia: 76, pulse: '88', spo2: '99', temp: '98.6', wt: '68' },
  ],
  billings: [
    { id: 'INV-2026-0039', date: '02 Jun 2026', type: 'IPD', amount: 18000, paid: 18000, status: 'paid' },
  ],
  admissions: [
    { id: 'IPD-2026-039', ipNo: 'IP/2026/039', admittedOn: '2026-06-28', admittedTime: '06:45 AM', admittingDoctor: 'Dr. Kavita Singh', ward: 'Maternity', bedNo: '3', dischargedOn: null, dischargedTime: null, status: 'admitted' },
  ],
  documents: [
    { id: 'DOC011', name: 'Antenatal Card', type: 'Maternity', date: '01 Jun 2026', notes: 'Complete ANC records' },
  ],
};

// PT-0124 — Mohan Trivedi, 45M, Asthma, active
const PT_0124_SUBS = {
  visits: [
    { id: 'V013', date: '2026-05-30', dateLabel: '30 May 2026', dateBig: '30', dateMonth: 'May 2026', doctor: 'Dr. Priya Mehta', dept: 'Pulmonology', complaint: 'Wheezing, nocturnal breathlessness', diagnosis: 'Moderate persistent asthma', treatment: 'Inhaler technique reviewed, step-up therapy initiated', notes: 'Peak flow meter given. Review in 4 weeks.' },
    { id: 'V014', date: '2026-05-10', dateLabel: '10 May 2026', dateBig: '10', dateMonth: 'May 2026', doctor: 'Dr. Priya Mehta', dept: 'General Medicine', complaint: 'Asthma follow-up, routine check', diagnosis: 'Asthma — partially controlled', treatment: 'Continue Budesonide + Salbutamol, add Montelukast', notes: 'Advised to avoid triggers. Spirometry done.' },
  ],
  prescriptions: [
    { id: 'RX015', date: '30 May 2026', drug: 'Budesonide 200mcg Inhaler', dosage: '2 puffs-0-2 puffs', frequency: 'Twice daily', duration: '30 days', doctor: 'Dr. Priya Mehta' },
    { id: 'RX016', date: '30 May 2026', drug: 'Salbutamol 100mcg (SOS)', dosage: '2 puffs SOS', frequency: 'As needed', duration: '30 days', doctor: 'Dr. Priya Mehta' },
    { id: 'RX017', date: '10 May 2026', drug: 'Montelukast 10mg', dosage: '0-0-1', frequency: 'Once daily (night)', duration: '30 days', doctor: 'Dr. Priya Mehta' },
  ],
  labs: [
    { id: 'L015', date: '28 May 2026', test: 'Spirometry (FEV1/FVC)', result: '68%', normal: '> 80%', status: 'Low', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L016', date: '28 May 2026', test: 'IgE (Total)', result: '420 IU/mL', normal: '< 100', status: 'High', statusColor: '#d95050', statusBg: 'rgba(217,80,80,0.1)', doctor: 'Dr. Priya Mehta' },
  ],
  vitals: [
    { id: 'VT013', date: '30 May 2026', bp: '124/78', bpSys: 124, bpDia: 78, pulse: '86', spo2: '95', temp: '98.4', wt: '79' },
    { id: 'VT014', date: '10 May 2026', bp: '122/76', bpSys: 122, bpDia: 76, pulse: '88', spo2: '94', temp: '98.2', wt: '79' },
  ],
  billings: [
    { id: 'INV-2026-0028', date: '30 May 2026', type: 'OPD', amount: 900, paid: 900, status: 'paid' },
  ],
  admissions: [],
  documents: [
    { id: 'DOC012', name: 'Spirometry Report — May 2026', type: 'Pulmonology', date: '28 May 2026', notes: 'Moderate obstruction pattern' },
  ],
};

// PT-0123 — Lakshmi Nair, 38F, Thyroid, active
const PT_0123_SUBS = {
  visits: [
    { id: 'V015', date: '2026-05-28', dateLabel: '28 May 2026', dateBig: '28', dateMonth: 'May 2026', doctor: 'Dr. Priya Mehta', dept: 'Endocrinology', complaint: 'Weight gain, fatigue, cold intolerance', diagnosis: 'Hypothyroidism — suboptimally controlled', treatment: 'Levothyroxine dose increased to 75 mcg', notes: 'TSH 8.4 mIU/L. Repeat TSH in 6 weeks.' },
    { id: 'V016', date: '2026-04-15', dateLabel: '15 Apr 2026', dateBig: '15', dateMonth: 'Apr 2026', doctor: 'Dr. Priya Mehta', dept: 'General Medicine', complaint: 'Annual thyroid check', diagnosis: 'Hypothyroidism on treatment', treatment: 'Continue Levothyroxine 50mcg', notes: 'TSH 5.2 — borderline. Dose adjustment considered.' },
  ],
  prescriptions: [
    { id: 'RX018', date: '28 May 2026', drug: 'Levothyroxine 75mcg', dosage: '1-0-0', frequency: 'Once daily (empty stomach)', duration: '60 days', doctor: 'Dr. Priya Mehta' },
    { id: 'RX019', date: '15 Apr 2026', drug: 'Levothyroxine 50mcg', dosage: '1-0-0', frequency: 'Once daily (empty stomach)', duration: '60 days', doctor: 'Dr. Priya Mehta' },
  ],
  labs: [
    { id: 'L017', date: '27 May 2026', test: 'TSH', result: '8.4 mIU/L', normal: '0.4–4.0', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L018', date: '27 May 2026', test: 'Free T4', result: '0.7 ng/dL', normal: '0.8–1.8', status: 'Low', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L019', date: '14 Apr 2026', test: 'TSH', result: '5.2 mIU/L', normal: '0.4–4.0', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
  ],
  vitals: [
    { id: 'VT015', date: '28 May 2026', bp: '112/72', bpSys: 112, bpDia: 72, pulse: '62', spo2: '99', temp: '97.8', wt: '67' },
  ],
  billings: [
    { id: 'INV-2026-0025', date: '28 May 2026', type: 'OPD', amount: 800, paid: 800, status: 'paid' },
  ],
  admissions: [],
  documents: [
    { id: 'DOC013', name: 'Thyroid Function Report — May 2026', type: 'Lab Report', date: '27 May 2026', notes: 'TSH 8.4, Free T4 0.7' },
  ],
};

// PT-0122 — Deepak Verma, 55M, Cardiac, archived
const PT_0122_SUBS = {
  visits: [
    { id: 'V017', date: '2026-05-15', dateLabel: '15 May 2026', dateBig: '15', dateMonth: 'May 2026', doctor: 'Dr. Arjun Rao', dept: 'Cardiology', complaint: 'Palpitations, mild exertional dyspnoea', diagnosis: 'Paroxysmal AF, stable ischaemic heart disease', treatment: 'Rate control, anticoagulation initiated', notes: 'Holter monitor ordered. Review in 2 weeks.' },
  ],
  prescriptions: [
    { id: 'RX020', date: '15 May 2026', drug: 'Metoprolol 50mg', dosage: '1-0-1', frequency: 'Twice daily', duration: '30 days', doctor: 'Dr. Arjun Rao' },
    { id: 'RX021', date: '15 May 2026', drug: 'Rivaroxaban 15mg', dosage: '0-1-0', frequency: 'Once daily with evening meal', duration: '30 days', doctor: 'Dr. Arjun Rao' },
  ],
  labs: [
    { id: 'L020', date: '14 May 2026', test: 'INR / PT', result: '1.1', normal: '0.9–1.1 (therapeutic 2–3)', status: 'Normal', statusColor: '#15803d', statusBg: 'rgba(78,179,116,0.1)', doctor: 'Dr. Arjun Rao' },
    { id: 'L021', date: '14 May 2026', test: 'BNP (NT-proBNP)', result: '480 pg/mL', normal: '< 300', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Arjun Rao' },
  ],
  vitals: [
    { id: 'VT016', date: '15 May 2026', bp: '134/84', bpSys: 134, bpDia: 84, pulse: '92', spo2: '97', temp: '98.2', wt: '88' },
  ],
  billings: [
    { id: 'INV-2026-0018', date: '15 May 2026', type: 'OPD', amount: 1200, paid: 1200, status: 'paid' },
  ],
  admissions: [],
  documents: [
    { id: 'DOC014', name: 'Holter Monitor Report — May 2026', type: 'Cardiology', date: '15 May 2026', notes: 'Paroxysmal AF episodes recorded' },
    { id: 'DOC015', name: '2D Echocardiogram — May 2026', type: 'Cardiology', date: '15 May 2026', notes: 'EF 48%, mild LV dysfunction' },
  ],
};

// PT-0121 — Sonal Mehta, 41F, Sulfa allergy, Diabetes, archived
const PT_0121_SUBS = {
  visits: [
    { id: 'V018', date: '2026-05-10', dateLabel: '10 May 2026', dateBig: '10', dateMonth: 'May 2026', doctor: 'Dr. Priya Mehta', dept: 'General Medicine', complaint: 'Blood sugar review, skin rash (drug reaction)', diagnosis: 'Type 2 Diabetes, Sulfa drug hypersensitivity', treatment: 'Sulfonamides stopped permanently, antihistamine given', notes: 'Allergy (Sulfa drugs) flagged in record. HbA1c 7.8%.' },
    { id: 'V019', date: '2026-04-01', dateLabel: '01 Apr 2026', dateBig: '01', dateMonth: 'Apr 2026', doctor: 'Dr. Priya Mehta', dept: 'General Medicine', complaint: 'Routine diabetes follow-up', diagnosis: 'Type 2 Diabetes — controlled', treatment: 'Continue Glimepiride + Metformin', notes: 'BP normal. Weight stable. HbA1c 7.4%.' },
  ],
  prescriptions: [
    { id: 'RX022', date: '10 May 2026', drug: 'Cetirizine 10mg', dosage: '0-0-1', frequency: 'Once daily (night)', duration: '7 days', doctor: 'Dr. Priya Mehta' },
    { id: 'RX023', date: '01 Apr 2026', drug: 'Glimepiride 2mg', dosage: '1-0-0', frequency: 'Once daily before breakfast', duration: '30 days', doctor: 'Dr. Priya Mehta' },
    { id: 'RX024', date: '01 Apr 2026', drug: 'Metformin 500mg', dosage: '1-0-1', frequency: 'Twice daily with meals', duration: '30 days', doctor: 'Dr. Priya Mehta' },
  ],
  labs: [
    { id: 'L022', date: '09 May 2026', test: 'HbA1c', result: '7.8%', normal: '< 5.7%', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
    { id: 'L023', date: '09 May 2026', test: 'Fasting Blood Sugar', result: '148 mg/dL', normal: '70–100', status: 'High', statusColor: '#d9a441', statusBg: 'rgba(217,164,65,0.1)', doctor: 'Dr. Priya Mehta' },
  ],
  vitals: [
    { id: 'VT017', date: '10 May 2026', bp: '126/80', bpSys: 126, bpDia: 80, pulse: '74', spo2: '98', temp: '98.6', wt: '71' },
    { id: 'VT018', date: '01 Apr 2026', bp: '124/78', bpSys: 124, bpDia: 78, pulse: '72', spo2: '99', temp: '98.4', wt: '70' },
  ],
  billings: [
    { id: 'INV-2026-0012', date: '10 May 2026', type: 'OPD', amount: 700, paid: 700, status: 'paid' },
  ],
  admissions: [],
  documents: [
    { id: 'DOC016', name: 'HbA1c Report — May 2026', type: 'Lab Report', date: '09 May 2026', notes: 'HbA1c 7.8%, FBS 148' },
  ],
};

// ── ADMISSIONS ────────────────────────────────────────────────────────────────

const EMPTY_CASEFILE = {
  carePlan: {}, medications: [], treatmentDates: [], treatmentList: [],
  clinicalNotes: [], nursingNotes: [], pathology: [], radiology: [],
  cardiology: [], equipment: [], dressing: [], traction: [], rounds: [],
};

const ADMISSIONS_DATA = [
  {
    id: 'IPD-2026-042', ipNo: 'IP/2026/042', mrNo: 'PT-0128',
    patientName: 'Kiran Desai', initials: 'KD', hasAllergy: false,
    age: '34', sex: 'Male', blood: 'B+', ward: 'General', bedNo: '4A',
    admittedOn: '2026-06-23', admittedTime: '09:15 AM',
    reason: 'Abdominal pain, fever', provisionalDx: 'Acute Appendicitis',
    diet: 'Nil by mouth', esiLevel: '2', esiColor: 'Red', allergies: '',
    admittingDoctor: 'Dr. Priya Mehta', status: 'admitted', dischargedOn: null,
    triage: { bp: '128/84', pulse: '92', rr: '18', spo2: '98', rbs: '110', temp: '101.2' },
    consent: true, pastHistory: true, triageDone: true, history: false, carePlan: false,
    casefile: {
      carePlan: {
        systemicExam: { rs: 'NVBS, clear', cvs: 'S1 S2 normal, no murmur', pa: 'Soft, RIF tenderness, guarding+', cns: 'Conscious, oriented', gcs: '15/15', pupils: 'Equal, reacting', reflexes: 'Intact', loc: 'Alert' },
        plan: { conservative: 'IV fluids, analgesics, antipyretics', operative: 'Laparoscopic appendectomy', surgery: '', other: '', investigationRadiology: 'USG Abdomen, CXR', investigationPathology: 'CBC, CRP, LFT, Urine R&M', investigationOther: '', referenceDoctor: 'Dr. Amit Sharma (Surgery)', diet: 'Nil by mouth', physiotherapy: 'Post-op breathing exercises', dischargeNeeds: 'OPD review in 7 days' },
      },
      medications: [
        { sr: 1, drug: 'Ceftriaxone', dose: '1g', route: 'IV', frequency: 'BD', qty: 14 },
        { sr: 2, drug: 'Metronidazole', dose: '500mg', route: 'IV', frequency: 'TDS', qty: 21 },
        { sr: 3, drug: 'Paracetamol', dose: '1g', route: 'IV', frequency: 'SOS', qty: 6 },
        { sr: 4, drug: 'Pantoprazole', dose: '40mg', route: 'IV', frequency: 'OD', qty: 7 },
      ],
      treatmentDates: ['2026-06-23','2026-06-24','2026-06-25','2026-06-26','2026-06-27','2026-06-28'],
      treatmentList: [
        { drug: 'Ceftriaxone 1g IV', dose: '1g', route: 'IV', freq: 'BD', cells: { '2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON','2026-06-26':'ON','2026-06-27':'ON','2026-06-28':'ON' } },
        { drug: 'Metronidazole 500mg IV', dose: '500mg', route: 'IV', freq: 'TDS', cells: { '2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON','2026-06-26':'ON','2026-06-27':'ON','2026-06-28':'ON' } },
        { drug: 'Paracetamol 1g IV', dose: '1g', route: 'IV', freq: 'SOS', cells: { '2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'OFF','2026-06-26':'OFF','2026-06-27':'ON','2026-06-28':'OFF' } },
        { drug: 'Pantoprazole 40mg IV', dose: '40mg', route: 'IV', freq: 'OD', cells: { '2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON','2026-06-26':'ON','2026-06-27':'ON','2026-06-28':'ON' } },
      ],
      clinicalNotes: [
        { id: 1, date: '2026-06-23', time: '10:30 AM', doctor: 'Dr. Priya Mehta', note: 'Patient admitted with acute onset abdominal pain, RIF tenderness and guarding. CBC: WBC 14,800. CRP elevated. USG confirms appendix inflammation. Surgical consult obtained. Plan: laparoscopic appendectomy.' },
        { id: 2, date: '2026-06-24', time: '09:00 AM', doctor: 'Dr. Priya Mehta', note: 'Post-op day 1. Vitals stable — BP 120/78, Pulse 82, Temp 99°F. Wound site clean and dry. Pain controlled. Bowel sounds returning. Tolerating sips of water.' },
        { id: 3, date: '2026-06-25', time: '08:45 AM', doctor: 'Dr. Priya Mehta', note: 'Improving satisfactorily. Tolerating oral fluids. IV antibiotics continued. Plan to start soft diet tomorrow. Catheter removal done.' },
      ],
      nursingNotes: [
        { id: 1, dateTime: '23 Jun 2026 · 09:30 AM', note: 'Patient admitted, IV access established (18G, right forearm). Pre-operative preparations initiated.', sign: 'Nurse Asha Kumar' },
        { id: 2, dateTime: '23 Jun 2026 · 02:00 PM', note: 'Patient returned from OT — laparoscopic appendectomy done. Vitals q30 min. Alert and stable.', sign: 'Nurse Preethi R.' },
        { id: 3, dateTime: '24 Jun 2026 · 06:00 AM', note: 'Morning check — wound dressing changed. No ooze. Urinary output 800 mL/shift. IV site clean.', sign: 'Nurse Asha Kumar' },
        { id: 4, dateTime: '24 Jun 2026 · 06:00 PM', note: 'Evening assessment — comfortable. Temp 98.6°F. Pain score 3/10. Ambulation encouraged.', sign: 'Nurse Preethi R.' },
        { id: 5, dateTime: '25 Jun 2026 · 06:00 AM', note: 'Tolerating soft fluids. IV site healthy — no phlebitis. Patient in stable condition.', sign: 'Nurse Asha Kumar' },
      ],
      pathology: [
        { date: '23 Jun 2026', time: '09:30 AM', investigation: 'Complete Blood Count (CBC)', sign: 'Lab Tech Suresh' },
        { date: '23 Jun 2026', time: '09:30 AM', investigation: 'C-Reactive Protein (CRP)', sign: 'Lab Tech Suresh' },
        { date: '23 Jun 2026', time: '09:30 AM', investigation: 'Liver Function Test (LFT)', sign: 'Lab Tech Suresh' },
        { date: '24 Jun 2026', time: '07:00 AM', investigation: 'Repeat CBC & CRP', sign: 'Lab Tech Ravi' },
        { date: '25 Jun 2026', time: '07:00 AM', investigation: 'Post-op CBC', sign: 'Lab Tech Ravi' },
      ],
      radiology: [
        { date: '23 Jun 2026', time: '10:00 AM', investigation: 'USG Abdomen', portable: false, rtEr: false, plateNo: 'RD-23061', sign: 'Rad. Tech.' },
        { date: '23 Jun 2026', time: '10:30 AM', investigation: 'Chest X-Ray (PA view)', portable: false, rtEr: false, plateNo: 'RD-23062', sign: 'Rad. Tech.' },
        { date: '25 Jun 2026', time: '08:00 AM', investigation: 'Post-op CXR', portable: false, rtEr: false, plateNo: 'RD-25063', sign: 'Rad. Tech.' },
      ],
      cardiology: [
        { date: '23 Jun 2026', time: '09:15 AM', investigation: 'ECG (12-lead)', doctor: 'Dr. Arjun Rao', sign: 'Dr. Arjun Rao' },
      ],
      equipment: [
        { onDate: '23 Jun 2026', type: 'IV Cannula 18G', onTime: '09:30 AM', sign: 'Nurse Asha', offDate: null, offTime: null, offSign: '' },
        { onDate: '23 Jun 2026', type: 'Urinary Catheter (F16)', onTime: '01:00 PM', sign: 'Nurse Asha', offDate: '25 Jun 2026', offTime: '08:00 AM', offSign: 'Nurse Preethi' },
        { onDate: '23 Jun 2026', type: 'Pulse Oximeter', onTime: '09:15 AM', sign: 'Nurse Asha', offDate: '24 Jun 2026', offTime: '06:00 PM', offSign: 'Nurse Preethi' },
      ],
      dressing: [
        { date: '24 Jun 2026', time: '06:00 AM', procedure: 'Wound dressing – umbilical port site', doctor: 'Dr. Priya Mehta', sign: 'Nurse Asha Kumar' },
        { date: '25 Jun 2026', time: '06:30 AM', procedure: 'Wound dressing – RIF port site', doctor: 'Dr. Priya Mehta', sign: 'Nurse Preethi R.' },
      ],
      traction: [],
      rounds: [
        { date: '23 Jun 2026', first: true,  routine: false, daySpcl: false, nightSpcl: false, consultant: 'Dr. Priya Mehta',  signature: 'Dr. P. Mehta' },
        { date: '24 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Priya Mehta',  signature: 'Dr. P. Mehta' },
        { date: '25 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Priya Mehta',  signature: 'Dr. P. Mehta' },
        { date: '26 Jun 2026', first: false, routine: false, daySpcl: true,  nightSpcl: false, consultant: 'Dr. Amit Sharma',  signature: 'Dr. A. Sharma' },
        { date: '27 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Priya Mehta',  signature: 'Dr. P. Mehta' },
        { date: '28 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Priya Mehta',  signature: 'Dr. P. Mehta' },
      ],
    },
  },
  {
    id: 'IPD-2026-041', ipNo: 'IP/2026/041', mrNo: 'PT-0127',
    patientName: 'Meena Agarwal', initials: 'MA', hasAllergy: true,
    age: '52', sex: 'Female', blood: 'O+', ward: 'ICU', bedNo: '2',
    admittedOn: '2026-06-22', admittedTime: '02:30 PM',
    reason: 'Myocardial Infarction', provisionalDx: 'STEMI — anterior wall',
    diet: 'Cardiac diet', esiLevel: '1', esiColor: 'Red', allergies: 'Penicillin, Aspirin',
    admittingDoctor: 'Dr. Arjun Rao', status: 'admitted', dischargedOn: null,
    triage: { bp: '90/60', pulse: '110', rr: '22', spo2: '92', rbs: '180', temp: '99.4' },
    consent: true, pastHistory: true, triageDone: true, history: true, carePlan: true,
    casefile: {
      carePlan: {
        systemicExam: { rs: 'Bilateral crackles at bases', cvs: 'S1 S2 present, S3 gallop', pa: 'Soft, non-tender', cns: 'Drowsy but arousable', gcs: '13/15', pupils: 'Equal, reactive', reflexes: 'Normal', loc: 'Drowsy' },
        plan: { conservative: 'O₂, IV heparin, antiplatelet therapy', operative: 'Coronary angiography + PTCA', surgery: '', other: 'Cardiac monitoring, ICU care', investigationRadiology: 'CXR, 2D Echo, PTCA', investigationPathology: 'Troponin, CPK-MB, CBC, LFT, ABG', investigationOther: '', referenceDoctor: 'Dr. Arjun Rao (Cardiology)', diet: 'Cardiac diet, fluid restriction', physiotherapy: 'Gradual ambulation post-stabilisation', dischargeNeeds: 'Cardiology OPD follow-up' },
      },
      medications: [
        { sr: 1, drug: 'Aspirin', dose: '300mg', route: 'Oral', frequency: 'Stat then OD', qty: 30 },
        { sr: 2, drug: 'Clopidogrel', dose: '75mg', route: 'Oral', frequency: 'OD', qty: 30 },
        { sr: 3, drug: 'Enoxaparin', dose: '60mg', route: 'SC', frequency: 'BD', qty: 14 },
        { sr: 4, drug: 'Atorvastatin', dose: '80mg', route: 'Oral', frequency: 'OD (night)', qty: 30 },
        { sr: 5, drug: 'Metoprolol', dose: '25mg', route: 'Oral', frequency: 'BD', qty: 60 },
        { sr: 6, drug: 'Ramipril', dose: '2.5mg', route: 'Oral', frequency: 'OD', qty: 30 },
        { sr: 7, drug: 'Furosemide', dose: '40mg', route: 'IV', frequency: 'BD', qty: 14 },
        { sr: 8, drug: 'Dobutamine', dose: '5 mcg/kg/min', route: 'IV infusion', frequency: 'Continuous', qty: 1 },
      ],
      treatmentDates: ['2026-06-22','2026-06-23','2026-06-24','2026-06-25','2026-06-26','2026-06-27','2026-06-28'],
      treatmentList: [
        { drug: 'Aspirin 300mg Oral', dose: '300mg', route: 'Oral', freq: 'OD', cells: { '2026-06-22':'ON','2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON','2026-06-26':'ON','2026-06-27':'ON','2026-06-28':'ON' } },
        { drug: 'Clopidogrel 75mg', dose: '75mg', route: 'Oral', freq: 'OD', cells: { '2026-06-22':'ON','2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON','2026-06-26':'ON','2026-06-27':'ON','2026-06-28':'ON' } },
        { drug: 'Enoxaparin 60mg SC', dose: '60mg', route: 'SC', freq: 'BD', cells: { '2026-06-22':'ON','2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON','2026-06-26':'OFF','2026-06-27':'OFF','2026-06-28':'OFF' } },
        { drug: 'Furosemide 40mg IV', dose: '40mg', route: 'IV', freq: 'BD', cells: { '2026-06-22':'ON','2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON','2026-06-26':'ON','2026-06-27':'ON','2026-06-28':'ON' } },
        { drug: 'Dobutamine infusion', dose: '5mcg/kg/min', route: 'IV', freq: 'Cont.', cells: { '2026-06-22':'ON','2026-06-23':'ON','2026-06-24':'OFF','2026-06-25':'OFF','2026-06-26':'OFF','2026-06-27':'OFF','2026-06-28':'OFF' } },
      ],
      clinicalNotes: [
        { id: 1, date: '2026-06-22', time: '03:00 PM', doctor: 'Dr. Arjun Rao', note: 'Patient admitted in emergency with STEMI (anterior wall). ECG shows ST elevation V1–V4. Troponin markedly elevated. BP 90/60, HR 110. Oxygen, aspirin load, heparin started. PTCA arranged urgently.' },
        { id: 2, date: '2026-06-23', time: '08:00 AM', doctor: 'Dr. Arjun Rao', note: 'Post-PTCA day 1. Haemodynamically stabilising. BP 100/70, HR 95. Echo: EF 35%, anterior wall hypokinesia. Dobutamine continued. Bilateral crackles — furosemide increased.' },
        { id: 3, date: '2026-06-24', time: '09:00 AM', doctor: 'Dr. Arjun Rao', note: 'Improving. BP 110/72, HR 88. Crackles reduced. Dobutamine weaned off. Tolerating oral medications.' },
        { id: 4, date: '2026-06-25', time: '08:30 AM', doctor: 'Dr. Arjun Rao', note: 'Stable. BP 118/75, HR 80. Ambulation started — 5m walk with assistance. Oral ramipril and metoprolol tolerated.' },
        { id: 5, date: '2026-06-26', time: '09:00 AM', doctor: 'Dr. Arjun Rao', note: 'Continued recovery. Enoxaparin stopped. Patient educated on cardiac diet, medications, and activity restrictions.' },
        { id: 6, date: '2026-06-27', time: '08:30 AM', doctor: 'Dr. Arjun Rao', note: 'Walking 20m independently. Discharge planning initiated. Allergy (Penicillin/Aspirin) documented.' },
      ],
      nursingNotes: [
        { id: 1, dateTime: '22 Jun 2026 · 02:45 PM', note: 'Patient arrived via ambulance in distress. O₂ 6L/min started, IV access × 2. ECG done, cardiologist called.', sign: 'Nurse Kavitha S.' },
        { id: 2, dateTime: '22 Jun 2026 · 08:00 PM', note: 'Post-PTCA — patient stable in ICU. Vitals q15 min. Urinary catheter inserted. Dobutamine drip running.', sign: 'Nurse Ramya P.' },
        { id: 3, dateTime: '23 Jun 2026 · 06:00 AM', note: 'BP 100/70, HR 95, SpO₂ 93%. I/O monitored strictly. 600 mL urine output overnight.', sign: 'Nurse Kavitha S.' },
        { id: 4, dateTime: '24 Jun 2026 · 06:00 AM', note: 'Dobutamine weaned per order. BP improving. Switched IV to oral meds. Patient alert and communicative.', sign: 'Nurse Ramya P.' },
        { id: 5, dateTime: '25 Jun 2026 · 06:00 AM', note: 'Ambulation initiated — patient walked short distance. Tolerated well. Oral intake improved.', sign: 'Nurse Kavitha S.' },
        { id: 6, dateTime: '26 Jun 2026 · 06:00 AM', note: 'Enoxaparin last dose given yesterday. Discharge paperwork being prepared.', sign: 'Nurse Ramya P.' },
      ],
      pathology: [
        { date: '22 Jun 2026', time: '02:45 PM', investigation: 'Troponin I (high-sensitivity)', sign: 'Lab Tech Suresh' },
        { date: '22 Jun 2026', time: '02:45 PM', investigation: 'CPK-MB isoenzyme', sign: 'Lab Tech Suresh' },
        { date: '22 Jun 2026', time: '02:45 PM', investigation: 'CBC, LFT, RFT, Coagulation profile', sign: 'Lab Tech Suresh' },
        { date: '23 Jun 2026', time: '06:00 AM', investigation: 'Repeat Troponin & CBC', sign: 'Lab Tech Ravi' },
        { date: '24 Jun 2026', time: '06:00 AM', investigation: 'ABG (arterial blood gas)', sign: 'Lab Tech Ravi' },
        { date: '25 Jun 2026', time: '07:00 AM', investigation: 'Lipid profile, BNP', sign: 'Lab Tech Ravi' },
        { date: '26 Jun 2026', time: '07:00 AM', investigation: 'Renal function, electrolytes', sign: 'Lab Tech Suresh' },
        { date: '27 Jun 2026', time: '07:00 AM', investigation: 'CBC, Coagulation profile', sign: 'Lab Tech Suresh' },
        { date: '28 Jun 2026', time: '07:00 AM', investigation: 'Pre-discharge CBC & LFT', sign: 'Lab Tech Ravi' },
      ],
      radiology: [
        { date: '22 Jun 2026', time: '03:00 PM', investigation: 'Chest X-Ray (portable)', portable: true, rtEr: true, plateNo: 'RD-22060', sign: 'Rad. Tech.' },
        { date: '23 Jun 2026', time: '09:00 AM', investigation: '2D Echo (bedside)', portable: true, rtEr: false, plateNo: 'ECHO-041', sign: 'Dr. Arjun Rao' },
        { date: '25 Jun 2026', time: '10:00 AM', investigation: 'Repeat CXR', portable: false, rtEr: false, plateNo: 'RD-25064', sign: 'Rad. Tech.' },
      ],
      cardiology: [
        { date: '22 Jun 2026', time: '02:50 PM', investigation: 'ECG (12-lead) — STEMI confirmed', doctor: 'Dr. Arjun Rao', sign: 'Dr. Arjun Rao' },
        { date: '23 Jun 2026', time: '08:00 AM', investigation: 'Post-PTCA ECG', doctor: 'Dr. Arjun Rao', sign: 'Dr. Arjun Rao' },
        { date: '25 Jun 2026', time: '08:00 AM', investigation: 'Holter monitor (24 hr)', doctor: 'Dr. Arjun Rao', sign: 'Dr. Arjun Rao' },
        { date: '27 Jun 2026', time: '08:00 AM', investigation: 'Stress Echo', doctor: 'Dr. Arjun Rao', sign: 'Dr. Arjun Rao' },
      ],
      equipment: [
        { onDate: '22 Jun 2026', type: 'IV Cannula × 2 (16G)', onTime: '02:45 PM', sign: 'Nurse Kavitha', offDate: null, offTime: null, offSign: '' },
        { onDate: '22 Jun 2026', type: 'Urinary Catheter (F14)', onTime: '08:00 PM', sign: 'Nurse Ramya', offDate: '25 Jun 2026', offTime: '09:00 AM', offSign: 'Nurse Kavitha' },
        { onDate: '22 Jun 2026', type: 'Cardiac Monitor', onTime: '02:45 PM', sign: 'Nurse Kavitha', offDate: null, offTime: null, offSign: '' },
        { onDate: '22 Jun 2026', type: 'Dobutamine Infusion Pump', onTime: '03:30 PM', sign: 'Nurse Ramya', offDate: '24 Jun 2026', offTime: '10:00 AM', offSign: 'Nurse Kavitha' },
      ],
      dressing: [
        { date: '23 Jun 2026', time: '08:00 AM', procedure: 'Cath lab entry site dressing (femoral)', doctor: 'Dr. Arjun Rao', sign: 'Nurse Kavitha S.' },
        { date: '25 Jun 2026', time: '08:00 AM', procedure: 'IV site re-dressing (bilateral forearms)', doctor: 'Dr. Arjun Rao', sign: 'Nurse Ramya P.' },
      ],
      traction: [],
      rounds: [
        { date: '22 Jun 2026', first: true,  routine: false, daySpcl: false, nightSpcl: false, consultant: 'Dr. Arjun Rao',   signature: 'Dr. A. Rao' },
        { date: '23 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Arjun Rao',   signature: 'Dr. A. Rao' },
        { date: '24 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Arjun Rao',   signature: 'Dr. A. Rao' },
        { date: '25 Jun 2026', first: false, routine: false, daySpcl: true,  nightSpcl: false, consultant: 'Dr. Priya Mehta', signature: 'Dr. P. Mehta' },
        { date: '26 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Arjun Rao',   signature: 'Dr. A. Rao' },
        { date: '27 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Arjun Rao',   signature: 'Dr. A. Rao' },
        { date: '28 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Arjun Rao',   signature: 'Dr. A. Rao' },
        { date: '28 Jun 2026', first: false, routine: false, daySpcl: false, nightSpcl: true,  consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
      ],
    },
  },
  {
    id: 'IPD-2026-040', ipNo: 'IP/2026/040', mrNo: 'PT-0124',
    patientName: 'Ankit Mehta', initials: 'AM', hasAllergy: false,
    age: '28', sex: 'Male', blood: 'A+', ward: 'Surgery', bedNo: '7B',
    admittedOn: '2026-06-21', admittedTime: '11:00 AM',
    reason: 'Hernia Repair (elective)', provisionalDx: 'Inguinal Hernia (Right)',
    diet: 'Normal post-op', esiLevel: '3', esiColor: 'Yellow', allergies: '',
    admittingDoctor: 'Dr. Priya Mehta', status: 'admitted', dischargedOn: null,
    triage: { bp: '122/80', pulse: '76', rr: '16', spo2: '99', rbs: '90', temp: '98.4' },
    consent: true, pastHistory: false, triageDone: true, history: false, carePlan: false,
    casefile: EMPTY_CASEFILE,
  },
  {
    id: 'IPD-2026-039', ipNo: 'IP/2026/039', mrNo: 'PT-0125',
    patientName: 'Priya Joshi', initials: 'PJ', hasAllergy: true,
    age: '28', sex: 'Female', blood: 'AB-', ward: 'Maternity', bedNo: '3',
    admittedOn: '2026-06-28', admittedTime: '06:45 AM',
    reason: 'Normal delivery / labour', provisionalDx: 'Term pregnancy — active labour',
    diet: 'Normal', esiLevel: '3', esiColor: 'Yellow', allergies: 'Latex',
    admittingDoctor: 'Dr. Kavita Singh', status: 'admitted', dischargedOn: null,
    triage: { bp: '120/80', pulse: '82', rr: '18', spo2: '98', rbs: '95', temp: '98.6' },
    consent: true, pastHistory: false, triageDone: true, history: false, carePlan: false,
    casefile: EMPTY_CASEFILE,
  },
  {
    id: 'IPD-2026-038', ipNo: 'IP/2026/038', mrNo: 'PT-0123',
    patientName: 'Vijay Kumar', initials: 'VK', hasAllergy: false,
    age: '45', sex: 'Male', blood: 'O-', ward: 'General', bedNo: '6C',
    admittedOn: '2026-06-19', admittedTime: '08:20 AM',
    reason: 'Dengue fever, thrombocytopenia', provisionalDx: 'Dengue Fever with Thrombocytopenia',
    diet: 'Normal', esiLevel: '2', esiColor: 'Red', allergies: '',
    admittingDoctor: 'Dr. Arjun Rao', status: 'admitted', dischargedOn: null,
    triage: { bp: '110/70', pulse: '98', rr: '20', spo2: '96', rbs: '88', temp: '102.4' },
    consent: true, pastHistory: false, triageDone: true, history: true, carePlan: false,
    casefile: EMPTY_CASEFILE,
  },
  {
    id: 'IPD-2026-037', ipNo: 'IP/2026/037', mrNo: 'PT-0122',
    patientName: 'Rekha Nair', initials: 'RN', hasAllergy: false,
    age: '38', sex: 'Female', blood: 'A-', ward: 'Ortho', bedNo: '2A',
    admittedOn: '2026-06-16', admittedTime: '10:00 AM',
    reason: 'Femur fracture, fall', provisionalDx: 'Fracture right femur',
    diet: 'Normal diet', esiLevel: '3', esiColor: 'Yellow', allergies: '',
    admittingDoctor: 'Dr. Kavita Singh', status: 'discharged', dischargedOn: '2026-06-26',
    triage: { bp: '122/78', pulse: '88', rr: '16', spo2: '99', rbs: '95', temp: '98.6' },
    consent: true, pastHistory: true, triageDone: true, history: true, carePlan: true,
    casefile: {
      carePlan: {
        systemicExam: { rs: 'Clear, NVBS', cvs: 'S1 S2 normal', pa: 'Soft, non-tender', cns: 'Conscious, oriented', gcs: '15/15', pupils: 'Equal, reacting', reflexes: 'Intact, right knee reflex present', loc: 'Alert' },
        plan: { conservative: 'Analgesics, skin traction initially', operative: 'ORIF right femur', surgery: 'Intramedullary nailing', other: '', investigationRadiology: 'X-ray femur AP & lateral, CXR', investigationPathology: 'CBC, PT/aPTT, LFT, Group & Cross-match', investigationOther: '', referenceDoctor: 'Dr. Kavita Singh (Ortho)', diet: 'High protein diet', physiotherapy: 'Bed exercises, gradual weight bearing', dischargeNeeds: 'Physio follow-up, crutch walking training' },
      },
      medications: [
        { sr: 1, drug: 'Tramadol', dose: '50mg', route: 'IV', frequency: 'BD', qty: 14 },
        { sr: 2, drug: 'Cefazolin', dose: '1g', route: 'IV', frequency: 'TDS', qty: 21 },
        { sr: 3, drug: 'Enoxaparin', dose: '40mg', route: 'SC', frequency: 'OD', qty: 10 },
        { sr: 4, drug: 'Calcium + Vit D3', dose: '500mg/400IU', route: 'Oral', frequency: 'BD', qty: 20 },
        { sr: 5, drug: 'Pantoprazole', dose: '40mg', route: 'IV', frequency: 'OD', qty: 10 },
        { sr: 6, drug: 'Ondansetron', dose: '4mg', route: 'IV', frequency: 'SOS', qty: 5 },
      ],
      treatmentDates: ['2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24','2026-06-25'],
      treatmentList: [
        { drug: 'Tramadol 50mg IV', dose: '50mg', route: 'IV', freq: 'BD', cells: { '2026-06-16':'ON','2026-06-17':'ON','2026-06-18':'ON','2026-06-19':'ON','2026-06-20':'ON','2026-06-21':'ON','2026-06-22':'OFF','2026-06-23':'OFF','2026-06-24':'OFF','2026-06-25':'OFF' } },
        { drug: 'Cefazolin 1g IV', dose: '1g', route: 'IV', freq: 'TDS', cells: { '2026-06-16':'ON','2026-06-17':'ON','2026-06-18':'ON','2026-06-19':'ON','2026-06-20':'OFF','2026-06-21':'OFF','2026-06-22':'OFF','2026-06-23':'OFF','2026-06-24':'OFF','2026-06-25':'OFF' } },
        { drug: 'Enoxaparin 40mg SC', dose: '40mg', route: 'SC', freq: 'OD', cells: { '2026-06-16':'ON','2026-06-17':'ON','2026-06-18':'ON','2026-06-19':'ON','2026-06-20':'ON','2026-06-21':'ON','2026-06-22':'ON','2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON' } },
        { drug: 'Calcium + Vit D3', dose: '500mg', route: 'Oral', freq: 'BD', cells: { '2026-06-16':'OFF','2026-06-17':'ON','2026-06-18':'ON','2026-06-19':'ON','2026-06-20':'ON','2026-06-21':'ON','2026-06-22':'ON','2026-06-23':'ON','2026-06-24':'ON','2026-06-25':'ON' } },
      ],
      clinicalNotes: [
        { id: 1, date: '2026-06-16', time: '11:30 AM', doctor: 'Dr. Kavita Singh', note: 'Patient with right femur fracture (fall). X-ray confirms mid-shaft fracture. Neurovascular status intact. Skin traction applied. Surgery planned after pre-op workup.' },
        { id: 2, date: '2026-06-17', time: '09:00 AM', doctor: 'Dr. Kavita Singh', note: 'Pre-op assessment complete. CBC, coagulation normal. Anaesthesia fitness obtained. Informed consent done for ORIF. Scheduled for OT tomorrow.' },
        { id: 3, date: '2026-06-18', time: '04:00 PM', doctor: 'Dr. Kavita Singh', note: 'Post-ORIF day 0. Intramedullary nail inserted under spinal anaesthesia. NV status intact post-op. IV antibiotics started. Wound closed in layers.' },
        { id: 4, date: '2026-06-20', time: '08:30 AM', doctor: 'Dr. Kavita Singh', note: 'Post-op day 2. Wound healing well. Drain removed. Bed exercises started — static quads, ankle pumps. Oral analgesics commenced.' },
        { id: 5, date: '2026-06-24', time: '09:00 AM', doctor: 'Dr. Kavita Singh', note: 'Walking with walker — weight bearing tolerated. X-ray satisfactory. Discharge planned for 26 Jun. Physiotherapy referral given.' },
      ],
      nursingNotes: [
        { id: 1, dateTime: '16 Jun 2026 · 10:30 AM', note: 'Patient admitted from casualty. Right leg immobilised, skin traction applied. IV access established, analgesics given.', sign: 'Nurse Geeta M.' },
        { id: 2, dateTime: '18 Jun 2026 · 04:30 PM', note: 'Patient returned from OT post-ORIF. Wound dressing intact, drain in-situ, IV antibiotics running.', sign: 'Nurse Geeta M.' },
        { id: 3, dateTime: '19 Jun 2026 · 06:00 AM', note: 'Drain output 80 mL. Wound dry. Patient comfortable on analgesics. IV site healthy.', sign: 'Nurse Geeta M.' },
        { id: 4, dateTime: '20 Jun 2026 · 06:00 AM', note: 'Drain removed per surgeon order. Physiotherapy started — patient cooperative and motivated.', sign: 'Nurse Geeta M.' },
        { id: 5, dateTime: '23 Jun 2026 · 06:00 AM', note: 'Patient walking short distances with walker. Wound healing well, no infection signs.', sign: 'Nurse Geeta M.' },
        { id: 6, dateTime: '25 Jun 2026 · 09:00 AM', note: 'Discharge preparations completed. Wound dressing changed. Patient and family counselled on home exercises.', sign: 'Nurse Geeta M.' },
      ],
      pathology: [
        { date: '16 Jun 2026', time: '11:00 AM', investigation: 'CBC, LFT, RFT', sign: 'Lab Tech Suresh' },
        { date: '16 Jun 2026', time: '11:00 AM', investigation: 'PT/aPTT, Blood Group & Cross-match', sign: 'Lab Tech Suresh' },
        { date: '18 Jun 2026', time: '06:00 AM', investigation: 'Pre-op CBC', sign: 'Lab Tech Ravi' },
        { date: '19 Jun 2026', time: '07:00 AM', investigation: 'Post-op CBC', sign: 'Lab Tech Ravi' },
      ],
      radiology: [
        { date: '16 Jun 2026', time: '11:30 AM', investigation: 'X-Ray Right Femur (AP + Lateral)', portable: false, rtEr: false, plateNo: 'RD-16055', sign: 'Rad. Tech.' },
        { date: '16 Jun 2026', time: '11:45 AM', investigation: 'Chest X-Ray (PA view)', portable: false, rtEr: false, plateNo: 'RD-16056', sign: 'Rad. Tech.' },
        { date: '19 Jun 2026', time: '08:00 AM', investigation: 'Post-ORIF X-Ray Right Femur', portable: false, rtEr: false, plateNo: 'RD-19057', sign: 'Rad. Tech.' },
        { date: '24 Jun 2026', time: '09:00 AM', investigation: 'Follow-up X-Ray Right Femur', portable: false, rtEr: false, plateNo: 'RD-24058', sign: 'Rad. Tech.' },
      ],
      cardiology: [
        { date: '16 Jun 2026', time: '11:00 AM', investigation: 'ECG (pre-op screening)', doctor: 'Dr. Arjun Rao', sign: 'Dr. Arjun Rao' },
      ],
      equipment: [
        { onDate: '16 Jun 2026', type: 'Skin Traction (right leg, 3kg)', onTime: '11:00 AM', sign: 'Nurse Geeta', offDate: '18 Jun 2026', offTime: '12:00 PM', offSign: 'Nurse Geeta' },
        { onDate: '16 Jun 2026', type: 'IV Cannula 18G', onTime: '10:30 AM', sign: 'Nurse Geeta', offDate: '20 Jun 2026', offTime: '10:00 AM', offSign: 'Nurse Geeta' },
        { onDate: '18 Jun 2026', type: 'Wound Drain (Romovac)', onTime: '04:30 PM', sign: 'Nurse Geeta', offDate: '20 Jun 2026', offTime: '06:00 AM', offSign: 'Nurse Geeta' },
      ],
      dressing: [
        { date: '19 Jun 2026', time: '07:00 AM', procedure: 'Post-ORIF wound dressing', doctor: 'Dr. Kavita Singh', sign: 'Nurse Geeta M.' },
        { date: '21 Jun 2026', time: '07:00 AM', procedure: 'Wound inspection & redressing', doctor: 'Dr. Kavita Singh', sign: 'Nurse Geeta M.' },
        { date: '24 Jun 2026', time: '07:00 AM', procedure: 'Pre-discharge wound dressing', doctor: 'Dr. Kavita Singh', sign: 'Nurse Geeta M.' },
      ],
      traction: [
        { startDate: '16 Jun 2026', startTime: '11:00 AM', procedure: 'Skin traction – right femur (3kg weight)', endDate: '18 Jun 2026', endTime: '12:00 PM', sign: 'Nurse Geeta M.' },
      ],
      rounds: [
        { date: '16 Jun 2026', first: true,  routine: false, daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '17 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '18 Jun 2026', first: false, routine: false, daySpcl: true,  nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '19 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '20 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '21 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '22 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '23 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
        { date: '24 Jun 2026', first: false, routine: false, daySpcl: true,  nightSpcl: false, consultant: 'Dr. Arjun Rao',   signature: 'Dr. A. Rao' },
        { date: '25 Jun 2026', first: false, routine: true,  daySpcl: false, nightSpcl: false, consultant: 'Dr. Kavita Singh', signature: 'Dr. K. Singh' },
      ],
    },
  },
  {
    id: 'IPD-2026-036', ipNo: 'IP/2026/036', mrNo: 'PT-0121',
    patientName: 'Santosh Gupta', initials: 'SG', hasAllergy: true,
    age: '55', sex: 'Male', blood: 'B-', ward: 'General', bedNo: '1B',
    admittedOn: '2026-06-14', admittedTime: '03:15 PM',
    reason: 'Typhoid fever', provisionalDx: 'Enteric Fever (Typhoid)',
    diet: 'Bland diet', esiLevel: '3', esiColor: 'Yellow', allergies: 'Codeine',
    admittingDoctor: 'Dr. Priya Mehta', status: 'discharged', dischargedOn: '2026-06-27',
    triage: { bp: '108/68', pulse: '96', rr: '20', spo2: '97', rbs: '92', temp: '103.2' },
    consent: true, pastHistory: true, triageDone: true, history: true, carePlan: false,
    casefile: EMPTY_CASEFILE,
  },
];

// ── STAFF ─────────────────────────────────────────────────────────────────────

const STAFF_DATA = [
  { id: 'D001', role: 'doctors', initials: 'PM', name: 'Dr. Priya Mehta', specialization: 'General Surgery', qualification: 'MS, MBBS', dept: 'Surgery', regNo: 'MH-GMC-14821', phone: '98001 11001', email: 'p.mehta@medivault.org', joiningDate: '15 Mar 2010', status: 'Active' },
  { id: 'D002', role: 'doctors', initials: 'AR', name: 'Dr. Arjun Rao', specialization: 'Interventional Cardiology', qualification: 'DM, MD, MBBS', dept: 'Cardiology', regNo: 'MH-GMC-18304', phone: '98001 11002', email: 'a.rao@medivault.org', joiningDate: '03 Jul 2013', status: 'Active' },
  { id: 'D003', role: 'doctors', initials: 'KS', name: 'Dr. Kavita Singh', specialization: 'Obstetrics & Gynaecology', qualification: 'MS (OBG), MBBS', dept: 'Maternity', regNo: 'MH-GMC-20117', phone: '98001 11003', email: 'k.singh@medivault.org', joiningDate: '20 Jan 2015', status: 'Active' },
  { id: 'D004', role: 'doctors', initials: 'RI', name: 'Dr. Rajan Iyer', specialization: 'Orthopaedic Surgery', qualification: 'MS (Ortho), MBBS', dept: 'Orthopaedics', regNo: 'MH-GMC-09842', phone: '98001 11004', email: 'r.iyer@medivault.org', joiningDate: '01 Apr 2008', status: 'On Leave' },
  { id: 'D005', role: 'doctors', initials: 'NP', name: 'Dr. Neha Patel', specialization: 'Paediatrics', qualification: 'MD (Paed), MBBS', dept: 'Paediatrics', regNo: 'MH-GMC-22508', phone: '98001 11005', email: 'n.patel@medivault.org', joiningDate: '10 Sep 2017', status: 'Active' },
  { id: 'D006', role: 'doctors', initials: 'VK', name: 'Dr. Vivek Kulkarni', specialization: 'Neurology', qualification: 'DM (Neuro), MD, MBBS', dept: 'Neurology', regNo: 'MH-GMC-16634', phone: '98001 11006', email: 'v.kulkarni@medivault.org', joiningDate: '22 Feb 2012', status: 'Active' },
  { id: 'N001', role: 'nurses', initials: 'LV', name: 'Lata Verma', designation: 'Head Nurse', ward: 'ICU', shift: 'Day', regNo: 'NMC-22341', phone: '98002 22001', email: 'l.verma@medivault.org', joiningDate: '01 Jan 2012', status: 'Active' },
  { id: 'N002', role: 'nurses', initials: 'SJ', name: 'Sunita Joshi', designation: 'Staff Nurse', ward: 'General', shift: 'Night', regNo: 'NMC-28904', phone: '98002 22002', email: 's.joshi@medivault.org', joiningDate: '15 Jun 2016', status: 'Active' },
  { id: 'N003', role: 'nurses', initials: 'MN', name: 'Meera Nair', designation: 'ICU Nurse', ward: 'ICU', shift: 'Rotation', regNo: 'NMC-31205', phone: '98002 22003', email: 'm.nair@medivault.org', joiningDate: '08 Mar 2019', status: 'Active' },
  { id: 'N004', role: 'nurses', initials: 'RS', name: 'Rekha Sharma', designation: 'Staff Nurse', ward: 'Maternity', shift: 'Day', regNo: 'NMC-29678', phone: '98002 22004', email: 'r.sharma@medivault.org', joiningDate: '20 Oct 2018', status: 'On Leave' },
  { id: 'N005', role: 'nurses', initials: 'PA', name: 'Pooja Ahuja', designation: 'Nursing Assistant', ward: 'Semi-Private', shift: 'Night', regNo: 'NMC-34512', phone: '98002 22005', email: 'p.ahuja@medivault.org', joiningDate: '05 May 2021', status: 'Active' },
  { id: 'P001', role: 'paramedical', initials: 'RK', name: 'Ravi Kumar', role_title: 'Lab Technician', dept: 'Pathology', qualification: 'DMLT', phone: '98003 33001', email: 'r.kumar@medivault.org', joiningDate: '01 Apr 2018', status: 'Active' },
  { id: 'P002', role: 'paramedical', initials: 'AD', name: 'Asha Devi', role_title: 'Radiologist Technician', dept: 'Radiology', qualification: 'B.Sc Radiology', phone: '98003 33002', email: 'a.devi@medivault.org', joiningDate: '12 Nov 2015', status: 'Active' },
  { id: 'P003', role: 'paramedical', initials: 'MD', name: 'Mohan Das', role_title: 'Physiotherapist', dept: 'Physiotherapy', qualification: 'BPTh', phone: '98003 33003', email: 'm.das@medivault.org', joiningDate: '18 Feb 2020', status: 'Active' },
  { id: 'P004', role: 'paramedical', initials: 'SP', name: 'Swati Pillai', role_title: 'Pharmacist', dept: 'Pharmacy', qualification: 'B.Pharm', phone: '98003 33004', email: 's.pillai@medivault.org', joiningDate: '07 Aug 2019', status: 'Active' },
  { id: 'A001', role: 'admin', initials: 'SG', name: 'Sanjay Gupta', role_title: 'Administrator', dept: 'Administration', phone: '98004 44001', email: 's.gupta@medivault.org', joiningDate: '01 Jun 2009', status: 'Active' },
  { id: 'A002', role: 'admin', initials: 'AT', name: 'Anita Tiwari', role_title: 'Accounts Officer', dept: 'Finance', phone: '98004 44002', email: 'a.tiwari@medivault.org', joiningDate: '10 Mar 2014', status: 'Active' },
  { id: 'A003', role: 'admin', initials: 'VS', name: 'Vikram Singh', role_title: 'Receptionist', dept: 'Front Desk', phone: '98004 44003', email: 'v.singh@medivault.org', joiningDate: '25 Jul 2017', status: 'Active' },
  { id: 'A004', role: 'admin', initials: 'PM', name: 'Pallavi Mishra', role_title: 'Medical Records Officer', dept: 'Records', phone: '98004 44004', email: 'p.mishra@medivault.org', joiningDate: '14 Jan 2020', status: 'Active' },
  { id: 'S001', role: 'support', initials: 'GY', name: 'Ganesh Yadav', role_title: 'Security Guard', shift: 'Day', phone: '98005 55001', joiningDate: '01 Mar 2016', status: 'Active' },
  { id: 'S002', role: 'support', initials: 'KD', name: 'Kamla Devi', role_title: 'Housekeeping', shift: 'Day', phone: '98005 55002', joiningDate: '15 Sep 2018', status: 'Active' },
  { id: 'S003', role: 'support', initials: 'RB', name: 'Ramu Bhai', role_title: 'Ward Boy', shift: 'Night', phone: '98005 55003', joiningDate: '20 Feb 2020', status: 'Active' },
  { id: 'S004', role: 'support', initials: 'SA', name: 'Santosh Ahir', role_title: 'Ambulance Driver', shift: 'Rotation', phone: '98005 55004', joiningDate: '11 Nov 2017', status: 'On Leave' },
  { id: 'S005', role: 'support', initials: 'BD', name: 'Bhavna Desai', role_title: 'Laundry Staff', shift: 'Day', phone: '98005 55005', joiningDate: '05 Apr 2019', status: 'Active' },
];

// ── HOSPITAL SETTINGS ─────────────────────────────────────────────────────────

const SETTINGS_DATA = {
  profile: {
    name: 'BAPS Pramukh Swami Hospital',
    tagline: 'Arogyam Sarvada',
    address: 'Shahibaug, Ahmedabad, Gujarat 380004',
    phone: '+91 79 2286 0000',
    email: 'contact@bapshospital.org',
  },
  wards: [
    { name: 'General Ward', beds: 20 },
    { name: 'Semi-Private', beds: 10 },
    { name: 'Private', beds: 8 },
    { name: 'ICU', beds: 4 },
  ],
};

// ── BILLS ─────────────────────────────────────────────────────────────────────

const BILLS_DATA = [
  {
    id: 'INV-2026-0042', patient: 'Kiran Desai', patientId: 'PT-0128', age: 34, sex: 'M',
    date: '25 Jun 2026', type: 'IPD',
    items: [
      { description: 'IPD (3 days)', qty: 1, rate: 18000 },
      { description: 'Surgery OT', qty: 1, rate: 7000 },
      { description: 'Medications', qty: 1, rate: 2000 },
      { description: 'Lab Tests', qty: 1, rate: 1500 },
    ],
    discount: 0, notes: '', amount: 28500, paid: 28500, status: 'Paid',
    payments: [{ amount: 28500, date: '25 Jun 2026', mode: 'Cash', note: 'Cash payment' }],
  },
  {
    id: 'INV-2026-0041', patient: 'Meena Agarwal', patientId: 'PT-0127', age: 52, sex: 'F',
    date: '24 Jun 2026', type: 'IPD',
    items: [
      { description: 'ICU (4 days)', qty: 1, rate: 30000 },
      { description: 'Investigations', qty: 1, rate: 16000 },
      { description: 'Nursing', qty: 1, rate: 6000 },
    ],
    discount: 0, notes: 'TPA claim in progress', amount: 52000, paid: 26000, status: 'Partial',
    payments: [{ amount: 26000, date: '24 Jun 2026', mode: 'Insurance', note: 'Insurance advance' }],
  },
  {
    id: 'INV-2026-0040', patient: 'Mohan Trivedi', patientId: 'PT-0124', age: 45, sex: 'M',
    date: '23 Jun 2026', type: 'IPD',
    items: [
      { description: 'Surgery OT', qty: 1, rate: 18000 },
      { description: 'Anaesthesia', qty: 1, rate: 10000 },
      { description: 'Post-op care', qty: 1, rate: 7000 },
    ],
    discount: 0, notes: '', amount: 35000, paid: 0, status: 'Pending', payments: [],
  },
  {
    id: 'INV-2026-0039', patient: 'Anjali Shah', patientId: 'PT-0125', age: 28, sex: 'F',
    date: '22 Jun 2026', type: 'IPD',
    items: [
      { description: 'Delivery room', qty: 1, rate: 8000 },
      { description: 'OB care', qty: 1, rate: 6000 },
      { description: 'Neonatal', qty: 1, rate: 4000 },
    ],
    discount: 0, notes: '', amount: 18000, paid: 18000, status: 'Paid',
    payments: [{ amount: 18000, date: '22 Jun 2026', mode: 'Cash', note: 'Cash payment' }],
  },
  {
    id: 'INV-2026-0038', patient: 'Lakshmi Nair', patientId: 'PT-0123', age: 38, sex: 'F',
    date: '21 Jun 2026', type: 'IPD',
    items: [
      { description: 'General ward (7 days)', qty: 1, rate: 10000 },
      { description: 'Lab reports', qty: 1, rate: 4000 },
    ],
    discount: 0, notes: '', amount: 14000, paid: 7000, status: 'Partial',
    payments: [{ amount: 7000, date: '21 Jun 2026', mode: 'Cash', note: 'Cash payment' }],
  },
  {
    id: 'INV-2026-0037', patient: 'Deepak Verma', patientId: 'PT-0122', age: 55, sex: 'M',
    date: '18 Jun 2026', type: 'IPD',
    items: [
      { description: 'Ortho surgery', qty: 1, rate: 40000 },
      { description: 'Physiotherapy', qty: 1, rate: 8000 },
      { description: 'Implant', qty: 1, rate: 20000 },
    ],
    discount: 0, notes: '', amount: 68000, paid: 68000, status: 'Paid',
    payments: [{ amount: 68000, date: '18 Jun 2026', mode: 'Cheque', note: 'Cheque' }],
  },
  {
    id: 'INV-2026-0036', patient: 'Sonal Mehta', patientId: 'PT-0121', age: 41, sex: 'F',
    date: '16 Jun 2026', type: 'OPD',
    items: [
      { description: 'General ward (12 days)', qty: 1, rate: 18000 },
      { description: 'Medicines', qty: 1, rate: 4000 },
    ],
    discount: 0, notes: '', amount: 22000, paid: 0, status: 'Pending', payments: [],
  },
  {
    id: 'INV-2026-0035', patient: 'Kiran Desai', patientId: 'PT-0128', age: 34, sex: 'M',
    date: '22 Jun 2026', type: 'OPD',
    items: [{ description: 'OPD Consultation', qty: 1, rate: 800 }, { description: 'Lab Charges', qty: 1, rate: 400 }],
    discount: 0, notes: '', amount: 1200, paid: 1200, status: 'Paid',
    payments: [{ amount: 1200, date: '22 Jun 2026', mode: 'Cash', note: 'Cash payment' }],
  },
  {
    id: 'INV-2026-0020', patient: 'Kiran Desai', patientId: 'PT-0128', age: 34, sex: 'M',
    date: '08 Jun 2026', type: 'OPD',
    items: [{ description: 'OPD Consultation', qty: 1, rate: 800 }],
    discount: 0, notes: '', amount: 800, paid: 800, status: 'Paid',
    payments: [{ amount: 800, date: '08 Jun 2026', mode: 'Cash', note: 'Cash payment' }],
  },
  {
    id: 'INV-2026-0040B', patient: 'Meena Agarwal', patientId: 'PT-0127', age: 52, sex: 'F',
    date: '08 Jun 2026', type: 'IPD',
    items: [{ description: 'IPD Advance', qty: 1, rate: 55000 }],
    discount: 0, notes: '', amount: 55000, paid: 20000, status: 'Partial',
    payments: [{ amount: 20000, date: '08 Jun 2026', mode: 'Online', note: 'Online transfer' }],
  },
];

// ── ACTIVITY LOGS ─────────────────────────────────────────────────────────────

const LOGS_DATA = [
  { id: 'LOG001', date: '2026-06-26', time: '11:42 AM', type: 'registration', action: 'Registered new patient', detail: 'Kiran Desai (PT-0128) · Age 34, Male, Blood B+', fullDetail: 'Reception registered Kiran Desai (PT-0128) · Age 34, Male, Blood Group B+ · Walk-in at OPD · Referred by Dr. Priya Mehta · Contact: 98765-43210', user: 'Reception', module: 'Patients' },
  { id: 'LOG002', date: '2026-06-26', time: '11:15 AM', type: 'admission', action: 'New IPD admission created', detail: 'Kiran Desai admitted to General Ward · Bed 4A', fullDetail: 'Dr. Priya Mehta admitted Kiran Desai (IPD-2026-042) · Ward: General · Bed 4A · Diagnosis: Acute Appendicitis · Priority: High · Emergency contact notified', user: 'Dr. Priya Mehta', module: 'IPD' },
  { id: 'LOG003', date: '2026-06-26', time: '10:58 AM', type: 'lab', action: 'Lab result uploaded', detail: 'HbA1c result for Kiran Desai — 7.2% (High)', fullDetail: 'Lab Technician uploaded HbA1c = 7.2% for Kiran Desai (PT-0128) · Reference range: 4.0–5.6% · Marked HIGH · Attending physician Dr. Priya Mehta notified automatically', user: 'Lab Technician', module: 'Labs' },
  { id: 'LOG004', date: '2026-06-26', time: '10:30 AM', type: 'billing', action: 'Invoice generated', detail: 'INV-2026-0035 · ₹1,200 for Kiran Desai', fullDetail: 'Reception generated invoice INV-2026-0035 for Kiran Desai (PT-0128) · Consultation fee: ₹800 · Lab charges: ₹400 · Total: ₹1,200 · Payment received', user: 'Reception', module: 'Billing' },
  { id: 'LOG005', date: '2026-06-26', time: '09:55 AM', type: 'prescription', action: 'Prescription issued', detail: 'Metformin 500mg + Amlodipine 5mg for Kiran Desai', fullDetail: 'Dr. Priya Mehta prescribed Metformin 500mg BD + Amlodipine 5mg OD for Kiran Desai (PT-0128) · Duration: 30 days · Dispensed from pharmacy · 2 refills allowed', user: 'Dr. Priya Mehta', module: 'Patients' },
  { id: 'LOG006', date: '2026-06-26', time: '09:22 AM', type: 'discharge', action: 'Patient discharged', detail: 'Rekha Nair (IPD-2026-037) discharged from Ortho', fullDetail: 'Dr. Kavita Singh discharged Rekha Nair (IPD-2026-037) from Ortho Ward · Stay: 10 days · Final diagnosis: Fracture right femur, ORIF done · Follow-up scheduled in 7 days · Discharge summary auto-generated', user: 'Dr. Kavita Singh', module: 'IPD' },
  { id: 'LOG007', date: '2026-06-25', time: '06:10 PM', type: 'alert', action: 'Allergy alert triggered', detail: 'Penicillin allergy flagged for Meena Agarwal', fullDetail: 'System auto-flagged Penicillin allergy for Meena Agarwal (PT-0127) · Triggered when nurse attempted to record Amoxicillin prescription · Attending doctor notified immediately · Prescription blocked', user: 'System', module: 'Patients' },
  { id: 'LOG008', date: '2026-06-25', time: '05:44 PM', type: 'billing', action: 'Payment recorded', detail: 'INV-2026-0020 · ₹800 marked as Paid', fullDetail: 'Cashier recorded payment for INV-2026-0020 · Patient: Kiran Desai (PT-0128) · Amount: ₹800 · Payment mode: Cash · Receipt no: RCP-0094 · Balance: ₹0', user: 'Cashier', module: 'Billing' },
  { id: 'LOG009', date: '2026-06-25', time: '04:30 PM', type: 'lab', action: 'Lab order placed', detail: 'CBC + LFT ordered for Meena Agarwal (IPD-2026-041)', fullDetail: 'Dr. Arjun Rao ordered CBC + LFT for Meena Agarwal (IPD-2026-041) · Priority: Urgent · Sent to Pathology lab · Expected TAT: 2 hours · Sample collected at bedside', user: 'Dr. Arjun Rao', module: 'Labs' },
  { id: 'LOG010', date: '2026-06-25', time: '03:15 PM', type: 'admission', action: 'Bed transfer', detail: 'Lakshmi Nair moved from ICU Bed 3 to General Bed 6C', fullDetail: 'Nurse Station transferred Lakshmi Nair (IPD-2026-038) from ICU Bed 3 to General Ward Bed 6C · Reason: Condition stabilized · Approved by Dr. Arjun Rao · Ward nurse notified', user: 'Nurse Station', module: 'IPD' },
  { id: 'LOG011', date: '2026-06-25', time: '02:00 PM', type: 'settings', action: 'Settings updated', detail: 'Hospital working hours changed to 08:00 – 21:00', fullDetail: 'Admin updated hospital working hours from 08:00–20:00 to 08:00–21:00 · Change effective immediately · All 28 staff members notified via system alert', user: 'Admin', module: 'Settings' },
  { id: 'LOG012', date: '2026-06-25', time: '11:30 AM', type: 'registration', action: 'Patient registered', detail: 'Suresh Rao (PT-0126) added to system', fullDetail: 'Reception registered Suresh Rao (PT-0126) · Age 67, Male, Blood A+ · Emergency case · Referred from City Clinic · Contact: 76543-21098', user: 'Reception', module: 'Patients' },
  { id: 'LOG013', date: '2026-06-25', time: '10:05 AM', type: 'prescription', action: 'Prescription issued', detail: 'Atorvastatin 80mg for Meena Agarwal', fullDetail: 'Dr. Arjun Rao prescribed Atorvastatin 80mg OD (night) for Meena Agarwal (PT-0127) · Duration: 30 days · Diagnosis: Post-STEMI · No known drug allergies to this drug · Dispensed from pharmacy', user: 'Dr. Arjun Rao', module: 'Patients' },
  { id: 'LOG014', date: '2026-06-24', time: '07:45 PM', type: 'discharge', action: 'Discharge summary generated', detail: 'Auto-summary created for IPD-2026-037 (Rekha Nair)', fullDetail: 'System auto-generated discharge summary for Rekha Nair (IPD-2026-037) · Length of stay: 10 days · Procedure: ORIF right femur (successful) · Post-discharge care instructions included · Copy sent to patient email', user: 'System', module: 'IPD' },
  { id: 'LOG015', date: '2026-06-24', time: '05:20 PM', type: 'alert', action: 'Critical lab value flagged', detail: 'SpO₂ 92% — critical low for Meena Agarwal', fullDetail: 'System flagged critical SpO₂ = 92% for Meena Agarwal (IPD-2026-041) · Reference: > 95% · Marked CRITICAL LOW · Attending physician Dr. Arjun Rao notified via system alert · Oxygen therapy started immediately', user: 'System', module: 'Labs' },
];

// ── SEED FUNCTION ─────────────────────────────────────────────────────────────

export async function seedDatabase(onProgress = () => {}) {
  try {
    // Batch 1: patients (8 docs)
    const b1 = writeBatch(db);
    for (const p of PATIENTS_BASIC) {
      const { id, ...data } = p;
      b1.set(doc(db, 'patients', id), data);
    }
    await b1.commit();
    onProgress('✓ 8 patients written');

    // Batch 2: PT-0128 subcollections
    const b2 = writeBatch(db);
    for (const [sub, items] of Object.entries(PT_0128_SUBS)) {
      for (const item of items) {
        const { id, ...data } = item;
        b2.set(doc(collection(db, 'patients', 'PT-0128', sub), id), data);
      }
    }
    await b2.commit();
    onProgress('✓ PT-0128 subcollections written');

    // Batch 3: PT-0127 subcollections
    const b3 = writeBatch(db);
    for (const [sub, items] of Object.entries(PT_0127_SUBS)) {
      for (const item of items) {
        const { id, ...data } = item;
        b3.set(doc(collection(db, 'patients', 'PT-0127', sub), id), data);
      }
    }
    await b3.commit();
    onProgress('✓ PT-0127 subcollections written');

    // Batch 4: admissions (7 docs)
    const b4 = writeBatch(db);
    for (const a of ADMISSIONS_DATA) {
      const { id, ...data } = a;
      b4.set(doc(db, 'admissions', id), data);
    }
    await b4.commit();
    onProgress('✓ 7 admissions written');

    // Batch 5: staff (24 docs) + counters
    const b5 = writeBatch(db);
    for (const s of STAFF_DATA) {
      const { id, ...data } = s;
      b5.set(doc(db, 'staff', id), data);
    }
    b5.set(doc(db, 'counters', 'patients'),   { next: 129 });
    b5.set(doc(db, 'counters', 'admissions'), { next: 43 });
    await b5.commit();
    onProgress('✓ 24 staff + counters written');

    // Batch 6: settings + bills
    const b6 = writeBatch(db);
    b6.set(doc(db, 'settings', 'hospital'), SETTINGS_DATA.profile);
    b6.set(doc(db, 'settings', 'wards'), { list: SETTINGS_DATA.wards });
    for (const bill of BILLS_DATA) {
      const { id, ...data } = bill;
      b6.set(doc(db, 'bills', id), data);
    }
    await b6.commit();
    onProgress('✓ Hospital settings + 10 bills written');

    // Batch 7: activity logs
    const b7 = writeBatch(db);
    for (const log of LOGS_DATA) {
      const { id, ...data } = log;
      b7.set(doc(db, 'activityLogs', id), data);
    }
    b7.set(doc(db, 'counters', 'bills'), { next: 43 });
    await b7.commit();
    onProgress('✓ 15 activity logs + bill counter written');

    // Batch 8: subcollections for PT-0126 through PT-0121
    const b8 = writeBatch(db);
    const REMAINING_SUBS = {
      'PT-0126': PT_0126_SUBS,
      'PT-0125': PT_0125_SUBS,
      'PT-0124': PT_0124_SUBS,
      'PT-0123': PT_0123_SUBS,
      'PT-0122': PT_0122_SUBS,
      'PT-0121': PT_0121_SUBS,
    };
    for (const [ptId, subs] of Object.entries(REMAINING_SUBS)) {
      for (const [sub, items] of Object.entries(subs)) {
        for (const item of items) {
          const { id, ...data } = item;
          b8.set(doc(collection(db, 'patients', ptId, sub), id), data);
        }
      }
    }
    await b8.commit();
    onProgress('✓ Subcollections for PT-0126 → PT-0121 written');

    onProgress('🎉 Seed complete! Patients, admissions, staff, bills, logs, settings all written.');
    return { success: true };
  } catch (err) {
    onProgress('✗ Error: ' + err.message);
    return { success: false, error: err.message };
  }
}
