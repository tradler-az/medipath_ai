import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster } from 'react-hot-toast'; // Commented - not installed
import MediPath from './MediPath.jsx';
import Login from './Login/login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 min
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/predict" element={<MediPath />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Role routes placeholder */}
<Route path="/reception" element={<ProtectedRoute requiredRole="reception"><Reception /></ProtectedRoute>} />
            <Route path="/lab" element={<ProtectedRoute requiredRole="lab"><Lab /></ProtectedRoute>} />
            <Route path="/consultant" element={<ProtectedRoute requiredRole="consultant"><Consultant /></ProtectedRoute>} />
            <Route path="/pharmacy" element={<ProtectedRoute requiredRole="pharmacy"><Pharmacy /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          {/* Toaster commented - install react-hot-toast if needed */}

        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

