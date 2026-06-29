# Firebase Migration Plan — MediVault

> Complete inventory of all static data to convert to live Firestore reads.
> **150+ hardcoded records · 6 top-level collections · 11 subcollections · 3 migration phases**

---

## Table of Contents

1. [Firebase Collections](#1-firebase-collections)
2. [Subcollections Detail](#2-subcollections-detail)
3. [Migration Phases](#3-migration-phases)
4. [Page → Collection Cross-Reference](#4-page--collection-cross-reference)
5. [Implementation Notes](#5-implementation-notes)

---

## 1. Firebase Collections

### `patients` — Patient Master Records
**Phase 1 · 8 records to migrate**

| Property | Details |
|---|---|
| **Path** | `firestore / patients / {patientId}` |
| **Static constants** | `INIT_PATIENTS` in Patients.jsx, `PATIENTS` in PatientDetail.jsx |
| **Also feeds** | `PATIENTS` dropdown in NewAdmissionModal.jsx, `SEARCH_POOL.patients` in AdminLayout.jsx |

**Fields:**
```
mrNo, name, initials, age, sex, dob, blood,
phone, email, address, registered, status,
hasAllergy, allergies[], tags[], insurance,
emergency { name, relation, phone }
```

**Subcollections:** `visits`, `prescriptions`, `labs`, `vitals`, `billings`, `documents`

---

### `admissions` — IPD Admission Records
**Phase 1 · 7 records to migrate**

| Property | Details |
|---|---|
| **Path** | `firestore / admissions / {admissionId}` |
| **Static constants** | `INIT_ADMISSIONS` in Admissions.jsx, `ADMISSIONS` in AdmissionDetail.jsx |
| **Also feeds** | Admissions tab in PatientDetail.jsx, `SEARCH_POOL.admissions` in AdminLayout.jsx |

**Fields:**
```
ipNo, mrNo (ref → patients), patientName, initials,
hasAllergy, age, sex, blood, ward, bedNo,
admittedOn, admittedTime, reason, provisionalDx,
diet, esiLevel, esiColor, allergies, admittingDoctor,
status, dischargedOn, dischargedTime,
triage { bp, pulse, rr, spo2, rbs, temp },
consent, pastHistory, triageDone, history, carePlan
```

**Subcollections (casefile):** `medications`, `treatmentList`, `clinicalNotes`, `nursingNotes`, `pathology`, `radiology`, `cardiology`, `equipment`, `dressing`, `traction`, `rounds`

---

### `staff` — Staff Directory
**Phase 1 · 24 records to migrate**

| Property | Details |
|---|---|
| **Path** | `firestore / staff / {staffId}` |
| **Static constants** | `STAFF.doctors` (6), `STAFF.nurses` (5), `STAFF.paramedical` (4), `STAFF.admin` (4), `STAFF.support` (5) in Staff.jsx |
| **Also feeds** | `DOCTORS` dropdown in NewAdmissionModal.jsx, `SEARCH_POOL.doctors` in AdminLayout.jsx |

**Fields:**
```
id, role (doctor | nurse | paramedical | admin | support),
name, initials, dept, specialty,
phone, email, qualification, joined, status,
schedule {} (doctors), shift (nurses/support)
```

> **Note:** Use a single `staff` collection filtered by `role` field — do not create 5 separate collections.

---

### `bills` — Billing Records
**Phase 2 · 7 records to migrate**

| Property | Details |
|---|---|
| **Path** | `firestore / bills / {billId}` |
| **Static constants** | `INITIAL_BILLS`, `PATIENT_OPTIONS` (dropdown) in Billing.jsx |

**Fields:**
```
id, mrNo (ref → patients), patientName,
admissionId (ref → admissions), date, dueDate,
items [ { description, qty, rate, amount } ],
payments [ { date, amount, method, ref } ],
status (paid | partial | pending | overdue),
total, paid, outstanding
```

> **Note:** `items[]` and `payments[]` can stay as nested arrays inside the document — no subcollections needed, since they're always loaded together with the bill.

---

### `activityLogs` — Audit Trail
**Phase 2 · 15 entries to migrate**

| Property | Details |
|---|---|
| **Path** | `firestore / activityLogs / {logId}` |
| **Static constants** | `LOGS` (15 entries), `KPI` (6 hardcoded totals), `STORAGE` (4 records) in ActivityLog.jsx |

**Fields:**
```
id, type, action, user, module,
details, timestamp, recordId
```

> **Note:** The hardcoded KPI totals (128 patients, 43 admissions, 85 OPD visits…) should become **Firestore aggregation queries** — not stored values. Write logs automatically via Cloud Functions that trigger on document writes in other collections.

---

### `analytics` — Aggregated Monthly Metrics
**Phase 3 · Computed — no direct static migration**

| Property | Details |
|---|---|
| **Path** | `firestore / analytics / {YYYY-MM}` |
| **Static constants** | `MONTHLY_KPI`, `WARD_MONTHLY`, `DIAG_MONTHLY`, `BILL_MONTHLY`, `TREND` in Analytics.jsx |

**Fields per month document:**
```
month, patients, admissions, discharged, avgLOS,
revenue, outstanding,
wardBreakdown { General, ICU, Surgery, Maternity, Ortho },
topDiagnoses [ { name, count } ],
billingStatus { paid, partial, pending }
```

> **Option A** — Store pre-computed summaries here, updated nightly by a Cloud Function.  
> **Option B** — Compute on the client at load time using aggregation queries on `admissions` + `bills`.  
> Start with **Option B** (simpler). Move to A when data volume makes client-side aggregation slow.

---

## 2. Subcollections Detail

### Under `patients / {patientId}`

| Subcollection | Key fields | Currently in |
|---|---|---|
| `visits` | id, date, doctor, dept, complaint, diagnosis, treatment, notes | `PatientDetail.jsx → PATIENTS.visits` |
| `prescriptions` | id, date, drug, dosage, frequency, duration, doctor | `PatientDetail.jsx → PATIENTS.prescriptions` |
| `labs` | id, date, test, result, normal, status, doctor | `PatientDetail.jsx → PATIENTS.labs` |
| `vitals` | id, date, bp, bpSys, bpDia, pulse, spo2, temp, wt | `PatientDetail.jsx → PATIENTS.vitals` |
| `billings` | references to `bills` collection | `PatientDetail.jsx → PATIENTS.billings` |
| `documents` | id, name, type, date, notes | `PatientDetail.jsx → PATIENTS.documents` |

### Under `admissions / {admissionId}`

| Subcollection | Key fields | Currently in |
|---|---|---|
| `medications` | sr, drug, dose, route, frequency, qty | `AdmissionDetail.jsx → casefile.medications` |
| `treatmentList` | drug, dose, route, freq, cells{date: ON/OFF} | `AdmissionDetail.jsx → casefile.treatmentList` |
| `clinicalNotes` | id, date, time, doctor, note | `AdmissionDetail.jsx → casefile.clinicalNotes` |
| `nursingNotes` | id, dateTime, note, sign | `AdmissionDetail.jsx → casefile.nursingNotes` |
| `pathology` | date, time, investigation, sign | `AdmissionDetail.jsx → casefile.pathology` |
| `radiology` | date, time, investigation, portable, rtEr, plateNo, sign | `AdmissionDetail.jsx → casefile.radiology` |
| `cardiology` | date, time, investigation, doctor, sign | `AdmissionDetail.jsx → casefile.cardiology` |
| `equipment` | onDate, type, onTime, sign, offDate, offTime, offSign | `AdmissionDetail.jsx → casefile.equipment` |
| `dressing` | date, time, procedure, doctor, sign | `AdmissionDetail.jsx → casefile.dressing` |
| `traction` | startDate, startTime, procedure, endDate, endTime, sign | `AdmissionDetail.jsx → casefile.traction` |
| `rounds` | date, first, routine, daySpcl, nightSpcl, consultant, signature | `AdmissionDetail.jsx → casefile.rounds` |

---

## 3. Migration Phases

### Phase 1 — Core
> The app is non-functional without these. Build this first.

| Collection | Why first |
|---|---|
| `patients` | Every other collection references a patient by `mrNo`. Set this up before anything else. |
| `admissions` | Core IPD workflow. Has the most subcollections — plan the data model carefully before coding. |
| `staff` | Needed for dropdown feeds in admission & billing forms and for the global search pool. |

**Files affected:** Patients.jsx, PatientDetail.jsx, Admissions.jsx, AdmissionDetail.jsx, Staff.jsx, NewAdmissionModal.jsx, AdminLayout.jsx (search)

---

### Phase 2 — Transactional
> Financial and audit data. Depends on Phase 1 being complete.

| Collection | Why second |
|---|---|
| `bills` | References `patients` (mrNo) and `admissions`. Hook up after Phase 1. |
| `activityLogs` | Auto-generate via Cloud Functions that trigger on writes to Phase 1 collections. |
| Search pool | Replace `AdminLayout.jsx SEARCH_POOL` with live Firestore queries on `patients` + `staff`. |

**Files affected:** Billing.jsx, ActivityLog.jsx, AdminLayout.jsx (search queries)

---

### Phase 3 — Derived
> Aggregated and computed data. Everything computed from Phase 1 + 2.

| Collection | Why third |
|---|---|
| `analytics` | Computed from `patients`, `admissions`, `bills`. Start client-side, move to Cloud Functions later. |
| KPI totals | ActivityLog.jsx hardcoded counts → Firestore `count()` aggregation queries. |
| Dashboard stats | KpiGrid, RecentAdmissions, WelcomeSection etc. pull from live queries instead of static arrays. |

**Files affected:** Analytics.jsx, ActivityLog.jsx (KPI section), Dashboard/ components

---

## 4. Page → Collection Cross-Reference

| Page / File | Static constants (current) | Collections after migration |
|---|---|---|
| `Patients.jsx` | `INIT_PATIENTS` | `patients` |
| `PatientDetail.jsx` | `PATIENTS` | `patients/{id}` + subcollections: `visits`, `prescriptions`, `labs`, `vitals`, `documents`, ref to `admissions` |
| `Admissions.jsx` | `INIT_ADMISSIONS` | `admissions` |
| `AdmissionDetail.jsx` | `ADMISSIONS` | `admissions/{id}` + 11 casefile subcollections |
| `Staff.jsx` | `STAFF` | `staff` (filtered by `role`) |
| `Billing.jsx` | `INITIAL_BILLS`, `PATIENT_OPTIONS` | `bills`, `patients` (for dropdown) |
| `ActivityLog.jsx` | `LOGS`, `KPI`, `STORAGE` | `activityLogs` + aggregation queries |
| `Analytics.jsx` | `MONTHLY_KPI`, `WARD_MONTHLY`, `DIAG_MONTHLY`, `BILL_MONTHLY`, `TREND` | computed from `admissions` + `bills` (or `analytics` pre-computed docs) |
| `AdminLayout.jsx` | `SEARCH_POOL` | live queries on `patients`, `admissions`, `staff` |
| `NewAdmissionModal.jsx` | `PATIENTS`, `DOCTORS` | `patients`, `staff` (role = doctor) |
| `RegisterPatientModal.jsx` | *(no static data)* | writes to `patients` |

> **WARDS list stays static.** `['General Ward', 'ICU', 'Surgery', 'Maternity', 'Orthopaedic', 'Paediatric']` is configuration, not data. Keep it hardcoded. Move to a `config/wards` document only if hospitals need custom ward names.

---

## 5. Implementation Notes

### Sequential IDs
Current IDs like `IPD-2026-042` and `PT-0128` are formatted sequential strings. Firestore auto-IDs are random. To preserve sequential IDs you need a **counter document + transaction**:

```js
// firestore / counters / admissions → { next: 43 }
const ref = doc(db, 'counters', 'admissions');
const newId = await runTransaction(db, async (tx) => {
  const snap = await tx.get(ref);
  const next = snap.data().next;
  tx.update(ref, { next: next + 1 });
  return `IPD-${new Date().getFullYear()}-${String(next).padStart(3, '0')}`;
});
```

---

### Replace `TODAY` constant
Multiple files use `const TODAY = '2026-06-28'`. Replace with:

```js
const TODAY = new Date().toISOString().slice(0, 10); // '2026-06-28'
```

Use Firestore `serverTimestamp()` for any field that records *when* an action happened (created, updated, discharged).

---

### Casefile subcollections vs. nested arrays
The 11 casefile subcollections under each admission (medications, rounds, clinical notes, etc.) could be stored as arrays inside the admission document instead. Decision guide:

| Use **subcollections** when… | Use **nested arrays** when… |
|---|---|
| Lists can grow large (e.g. nursing notes for a 30-day stay) | Lists are always small (e.g. max 10 items) |
| You need paginated reads | You always load the full list at once |
| You need to query across admissions (e.g. "all ECGs this month") | You only ever read within one admission |

**Recommendation:** Use subcollections for `clinicalNotes`, `nursingNotes`, `rounds`. Use arrays for `medications`, `equipment` (smaller, always loaded together).

---

### Search architecture
The current `SEARCH_POOL` in AdminLayout.jsx is a small in-memory array. For live search with Firestore:

- **Simple approach:** Fetch all patients + staff on app load, filter in memory (fine for < 500 records).
- **Scalable approach:** Use Firestore `where('name', '>=', query).where('name', '<=', query + '')` for prefix search, or integrate **Algolia / Typesense** for full-text search.

Start with the simple approach. Add a search service in Phase 3 when the patient list grows.

---

### Cloud Functions to write in Phase 2
When any document is **created** in these collections, auto-write to `activityLogs`:

| Trigger | Action logged |
|---|---|
| `patients` created | `"Patient registered"` |
| `admissions` created | `"Patient admitted"` |
| `admissions` updated (status → discharged) | `"Patient discharged"` |
| `bills` created | `"Invoice generated"` |
| `bills` updated (status → paid) | `"Payment recorded"` |

---

*Last updated: 28 Jun 2026 · MediVault v1 Firebase Migration*
