# MediPATH AI Hospital Portal - Implementation TODO

## Approved Plan Steps (Role-based data input portal)
Status: [ ] Not started

### 1. Backend Setup (Flask + Auth + DB)
- [x] Install Python deps (flask-jwt-extended, flask-sqlalchemy, werkzeug)
- [ ] Migrate CSV to SQLite (patients table)
- [ ] Add /login, /patients (GET list, POST create, PUT update) with JWT role auth
- [ ] Role perms: reception=CRUD, lab=conditions/tests, consultant=diagnoses, pharmacy=meds

### 2. Frontend Structure (React)
- [x] src/stores/auth.js (zustand: login, role, token)
- [x] src/components/ProtectedRoute.jsx
- [x] src/pages/Dashboard.jsx (role tiles)
- [x] src/App.jsx: Router + ProtectedRoute + role routes
- [x] src/Login/login.jsx (demo auth, role selector)
- [ ] src/pages/: Login, Dashboard, ReceptionForm, LabForm, ConsultantForm, PharmacyForm

### 3. Role-Specific Forms
- [ ] Reception: New patient (name, age, BMI, contact)
- [ ] Lab: Add lab results → conditions (blood sugar → Diabetes)
- [ ] Consultant: Diagnoses, specialist notes
- [ ] Pharmacy: Prescriptions, med history (preventive flags)

### 4. Ethics & Hospital Integration
- [ ] Patient consent UI
- [ ] Data encryption (HTTPS), audit logs
- [ ] HIS integration hooks (HL7 FHIR)
- [ ] Regional risk alerts (e.g., malaria vaccines)

### 5. Test & Deploy
- [ ] End-to-end: Register → Lab test → Prediction → Pharmacy
- [ ] Update progress here after each step

**Data Ethics**: Anonymized IDs, consent required, audit trail, GDPR/HIPAA compliant.
**Hospital Flow**: Reception → Triage/Lab → Consultant → Pharmacy → Predictive alerts.

