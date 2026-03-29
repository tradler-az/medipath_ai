import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import { TestTube, Search, ArrowLeft, Save, FileText } from 'lucide-react';

const Lab = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    testType: '',
    results: '',
    conditionsAdded: '',
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
        const data = await res.json();
        setPatientData(data);
      } else {
        setError('Patient not found');
      }
    } catch {
      setError('Search failed');
    }
    setLoading(false);
  };

  const saveLabResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/patients/${formData.patientId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testType: formData.testType,
          results: formData.results,
          conditionsAdded: formData.conditionsAdded.split(',').map(c => c.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setPatientData(await res.json());
        setError('');
        alert('Lab results saved!');
      } else {
        setError('Save failed');
      }
    } catch {
      setError('Backend endpoint WIP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 p-8">
      <header className="mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-8 px-6 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl hover:bg-white/20"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent mb-4">
          🧪 Laboratory
        </h1>
        <p className="text-xl text-white/70 max-w-2xl">
          Add lab test results and diagnose new conditions from biomarkers.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Search & Current Record */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Search size={28} className="text-emerald-400" />
            Patient Lab History
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
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white rounded-xl"
            >
              Search
            </button>
          </div>

          {patientData && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/30 rounded-2xl">
              <h3 className="font-bold text-xl text-emerald-300">Current Record</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {patientData.name}</div>
                <div><strong>Age/BMI:</strong> {patientData.age}/{patientData.bmi}</div>
                <div><strong>Conditions:</strong> {Array.isArray(patientData.conditions) ? patientData.conditions.join(', ') : JSON.stringify(patientData.conditions)}</div>
                <div><strong>Updated:</strong> {patientData.updated_at}</div>
              </div>
            </div>
          )}
          {error && <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">{error}</div>}
        </div>

        {/* Lab Test Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <TestTube size={28} className="text-orange-400" />
            Add Lab Results
          </h2>
          <div className="space-y-4">
            <input
              name="testType"
              value={formData.testType}
              onChange={handleInputChange}
              placeholder="Test Type (e.g. HbA1c, Lipid Panel)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
            />
            <textarea
              name="results"
              value={formData.results}
              onChange={handleInputChange}
              placeholder="Raw Results (e.g. HbA1c 7.2%, LDL 180 mg/dL)"
              rows="2"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-vertical"
            />
            <textarea
              name="conditionsAdded"
              value={formData.conditionsAdded}
              onChange={handleInputChange}
              placeholder="New Diagnoses (comma separated, e.g. Type 2 Diabetes, Dyslipidemia)"
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-vertical"
            />
            <button
              onClick={saveLabResults}
              disabled={loading || !formData.patientId}
              className="w-full flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
            >
              <Save size={24} />
              {loading ? 'Saving...' : 'Save Lab Results & Update Conditions'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-yellow-200 mb-2">🔬 Lab Standards</h3>
        <p className="text-yellow-100">
          Results trigger AI risk updates • Conditions auto-added to patient record • Clinical reference ranges built-in
        </p>
      </div>
    </div>
  );
};

export default Lab;

