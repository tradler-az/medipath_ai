import { useAuthStore } from '../stores/auth.js';
import { Link } from 'react-router-dom';
import { LogOut, User, Hospital } from 'lucide-react';

const ROLES = {
  'reception': { name: 'Reception', path: '/reception', icon: '👤', desc: 'Patient registration' },
  'lab': { name: 'Laboratory', path: '/lab', icon: '🧪', desc: 'Test results & conditions' },
  'consultant': { name: 'Consultant', path: '/consultant', icon: '👨‍⚕️', desc: 'Diagnoses & notes' },
  'pharmacy': { name: 'Pharmacy', path: '/pharmacy', icon: '💊', desc: 'Prescriptions & meds' },
  'admin': { name: 'Admin', path: '/admin', icon: '⚙️', desc: 'System management' },
};

const Dashboard = () => {
  const { user, role, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hospital className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-500 bg-clip-text text-transparent">
              MediPATH AI Hospital Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">Welcome, <strong>{user?.name || role}</strong></span>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl transition-all">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4">
            {ROLES[role]?.name || 'Dashboard'}
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Role-specific interface for {ROLES[role]?.desc || 'hospital data management'}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(ROLES).map(([r, config]) => (
            <Link
              key={r}
              to={config.path}
              className={`group p-8 rounded-3xl border-2 transition-all hover:scale-105 ${
                role === r
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-2xl shadow-cyan-500/25'
                  : 'border-white/20 bg-white/5 hover:border-cyan-400 hover:bg-cyan-500/5'
              }`}
            >
              <div className="text-4xl mb-4">{config.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{config.name}</h3>
              <p className="text-white/60 text-sm">{config.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User size={20} />
            Quick Patient Search
          </h3>
          {/* Prediction integration here */}
          <p className="text-white/50 italic">Coming soon: Search patients and view AI predictions</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

