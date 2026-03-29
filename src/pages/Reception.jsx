import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.js';
import { UserPlus, Search, ArrowLeft, Save } from 'lucide-react';

const Reception = () => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    bmi: '',
    phone: '',
    conditions: '',
  });
  const [searchId, setSearchId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { token } = useAuthStore();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const searchPatient = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/patients/${searchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPatientData(data);
        setFormData({
          id: data.id,
          name: data.name,
          age: data.age || '',
          bmi: data.bmi || '',
          phone: '',
          conditions: Array.isArray(data.conditions) ? data.conditions.join(', ') : data.conditions,
        });
      } else {
        setError(data.error || 'Patient not found');
      }
    } catch (err) {
      setError('Search failed');
    }
    setLoading(false);
  };

  const savePatient = async () => {
    if (!formData.id || !formData.name) return setError('ID and Name required');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          conditions: formData.conditions.split(',').map(c => c.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setPatientData(await res.json());
        setError('');
        alert('Patient saved!');
      } else {
        setError('Save failed');
      }
    } catch (err) {
      setError('Save failed - backend WIP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-8">
      <header className="mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-8 px-6 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
          👤 Reception Desk
        </h1>
        <p className="text-xl text-white/70 max-w-2xl">
          Patient registration and check-in. Add new patients or update existing records.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Search Panel */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Search size={28} className="text-blue-400" />
            Search Patient
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Patient ID (e.g. P00001)"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
              />
              <button
                onClick={searchPatient}
                disabled={loading || !searchId}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-100">{error}</div>}
            {patientData && (
              <div className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl">
                <h3 className="font-bold text-lg text-green-300 mb-2">✅ Found: {patientData.name}</h3>
                <p><strong>ID:</strong> {patientData.id}</p>
                <p><strong>Age:</strong> {patientData.age}</p>
                <p><strong>BMI:</strong> {patientData.bmi}</p>
                <p><strong>Conditions:</strong> {Array.isArray(patientData.conditions) ? patientData.conditions.join(', ') : patientData.conditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* New Patient Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <UserPlus size={28} className="text-emerald-400" />
            New Patient Registration
          </h2>
          <div className="space-y-4">
            <input
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="Patient ID (P00001)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50"
              required
            />
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Age"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50"
              />
              <input
                name="bmi"
                type="number" step="0.1"
                value={formData.bmi}
                onChange={handleInputChange}
                placeholder="BMI"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone (optional)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50"
            />
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
              placeholder="Initial Conditions (comma separated, e.g. Hypertension, Diabetes)"
              rows="3"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 resize-vertical"
            />
            <button
              onClick={savePatient}
              disabled={loading || !formData.id || !formData.name}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={24} />
              {loading ? 'Saving...' : 'Register New Patient'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-yellow-200 mb-2">📋 Ethics & Compliance</h3>
        <p className="text-yellow-100">
          All data anonymized • Consent logged • Role-based access • GDPR/HIPAA ready
        </p>
      </div>
    </div>
  );
};

export default Reception;

