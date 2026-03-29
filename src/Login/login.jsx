import { useState } from 'react';
import { useAuthStore } from '../stores/auth.js';
import { useNavigate, Link } from 'react-router-dom';
import { Hospital, User, Lock, ArrowRight } from 'lucide-react';

const ROLES = [
  { id: 'reception', label: 'Receptionist', desc: 'Patient registration & intake' },
  { id: 'lab', label: 'Lab Technician', desc: 'Test results & diagnostics' },
  { id: 'consultant', label: 'Consultant', desc: 'Clinical diagnoses & treatment plans' },
  { id: 'pharmacy', label: 'Pharmacist', desc: 'Prescriptions & medication management' },
  { id: 'admin', label: 'Admin', desc: 'System administration' },
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('reception');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo login (backend not ready yet)
    const demoCreds = {
      username: username || 'demo',
      password: password || 'demo',
    };

    const result = await login({
      ...demoCreds,
      role: selectedRole,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Hospital className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3">
            MediPATH AI
          </h1>
          <p className="text-xl text-white/60">Hospital Staff Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <User size={18} />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all"
                placeholder="Enter password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-4 flex items-center gap-2">
                Role
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ROLES.map((role) => (
                  <label key={role.id} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl cursor-pointer transition-all group">
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={selectedRole === role.id}
                      onChange={() => setSelectedRole(role.id)}
                      className="w-4 h-4 text-cyan-500 focus:ring-cyan-400 bg-white/10 border-white/30"
                    />
                    <div>
                      <div className="font-medium text-white group-hover:text-cyan-300">{role.label}</div>
                      <div className="text-xs text-white/50">{role.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <ArrowRight size={20} />
                  Sign In
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-sm text-white/50">
              Demo: username <code className="bg-white/10 px-2 py-1 rounded font-mono text-xs">demo</code> / 
              password <code className="bg-white/10 px-2 py-1 rounded font-mono text-xs">demo</code>
            </p>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link to="/predict" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            ↗ Quick Predict (Public)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

