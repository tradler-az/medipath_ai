import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import { Package, Search, ArrowLeft, Save, Pill } from 'lucide-react';

const Pharmacy = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    duration: '',
    instructions: '',
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

  const addPrescription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/patients/${formData.patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medication: formData.medication,
          dosage: formData.dosage,
          duration: formData.duration,
          instructions: formData.instructions,
        }),
      });
      if (res.ok) {
        setPatientData(await res.json());
        setError('');
        alert('Prescription added!');
      } else {
        setError('Save failed');
      }
    } catch {
      setError('Backend WIP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-red-900 p-8">
      <header className="mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-8 px-6 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl hover:bg-white/20"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent mb-4">
          💊 Pharmacy
        </h1>
        <p className="text-xl text-white/70 max-w-2xl">
          Prescription management, medication history, and preventive recommendations.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Patient Medication History */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Search size={28} className="text-orange-400" />
            Medication History
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
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl"
            >
              Load
            </button>
          </div>

          {patientData && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl">
              <h3 className="font-bold text-xl text-amber-300">Current Medications</h3>
              <div className="text-sm">
                <strong>Patient:</strong> {patientData.name}<br/>
                <strong>Conditions:</strong> {JSON.stringify(patientData.conditions)}<br/>
                <strong>Meds:</strong> {patientData.meds || 'None recorded'}<br/>
              </div>
            </div>
          )}
          {error && <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">{error}</div>}
        </div>

        {/* Prescription Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Pill size={28} className="text-red-400" />
            New Prescription
          </h2>
          <div className="space-y-4">
            <input
              name="medication"
              value={formData.medication}
              onChange={handleInputChange}
              placeholder="Medication Name (e.g. Metformin 500mg)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />
            <input
              name="dosage"
              value={formData.dosage}
              onChange={handleInputChange}
              placeholder="Dosage (e.g. 1 tab twice daily)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />
            <input
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="Duration (e.g. 3 months)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="Special Instructions (e.g. Take with food, Monitor kidney function)"
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-vertical"
            />
            <button
              onClick={addPrescription}
              disabled={loading || !formData.patientId}
              className="w-full flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
            >
              <Package size={24} />
              {loading ? 'Adding...' : 'Add Prescription'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-yellow-200 mb-2">💰 Pharmacy Alerts</h3>
        <p className="text-yellow-100">
          Drug interaction warnings • Preventive meds suggested by AI • Stock alerts
        </p>
      </div>
    </div>
  );
};

export default Pharmacy;

