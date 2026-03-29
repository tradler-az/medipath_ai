import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import { Stethoscope, Search, ArrowLeft, Save, ClipboardList } from 'lucide-react';

const Consultant = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
  });
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { token } = useAuthStore();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const searchPatient = async () => {
    if (!formData.patientId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/patients/${formData.patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPatientData(await res.json());
      } else {
        setError('Patient not found');
      }
    } catch {
      setError('Search failed');
    }
    setLoading(false);
  };

  const saveConsultation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/patients/${formData.patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diagnosis: formData.diagnosis,
          treatmentPlan: formData.treatmentPlan,
          notes: formData.notes,
        }),
      });
      if (res.ok) {
        setPatientData(await res.json());
        setError('');
        alert('Consultation notes saved!');
      } else {
        setError('Save failed');
      }
    } catch {
      setError('Backend WIP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 p-8">
      <header className="mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-8 px-6 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl hover:bg-white/20"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent mb-4">
          👨‍⚕️ Consultant
        </h1>
        <p className="text-xl text-white/70 max-w-2xl">
          Clinical diagnoses, treatment plans, specialist notes, and AI risk review.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Patient Overview */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Search size={28} className="text-purple-400" />
            Patient Overview
          </h2>
          <div className="flex gap-3 mb-6">
            <input
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              placeholder="Patient ID"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />
            <button
              onClick={searchPatient}
              disabled={loading || !formData.patientId}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 text-white rounded-xl"
            >
              Load
            </button>
          </div>

          {patientData && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl">
              <h3 className="font-bold text-xl text-indigo-300">Patient Record</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {patientData.name}</div>
                <div><strong>Age/BMI:</strong> {patientData.age}/{patientData.bmi}</div>
                <div><strong>Conditions:</strong> {JSON.stringify(patientData.conditions)}</div>
                <div><strong>AI Risk:</strong> <span className="text-orange-400 font-bold">Loading...</span></div>
              </div>
            </div>
          )}
          {error && <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">{error}</div>}
        </div>

        {/* Consultation Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Stethoscope size={28} className="text-rose-400" />
            Consultation Notes
          </h2>
          <div className="space-y-4">
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              placeholder="Primary Diagnosis (ICD code + description)"
              rows="2"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-vertical"
            />
            <textarea
              name="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={handleInputChange}
              placeholder="Treatment Plan (meds, follow-up, lifestyle)"
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-vertical"
            />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Clinical Notes, AI Risk Review, Differentials"
              rows="4"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-vertical"
            />
            <button
              onClick={saveConsultation}
              disabled={loading || !formData.patientId}
              className="w-full flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
            >
              <Save size={24} />
              {loading ? 'Saving...' : 'Save Consultation Notes'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-yellow-200 mb-2">🩺 Clinical Standards</h3>
        <p className="text-yellow-100">
          AI predictions integrated • Treatment plans logged • Full audit trail • Referral automation
        </p>
      </div>
    </div>
  );
};

export default Consultant;

