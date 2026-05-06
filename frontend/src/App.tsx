import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Temporary placeholders for Phase 7 & 8
const DashboardPlaceholder = () => <div className="p-4"><h1 className="text-2xl font-bold">Dashboard</h1><p>Coming in Phase 8</p></div>;
const LeadsPlaceholder = () => <div className="p-4"><h1 className="text-2xl font-bold">Leads</h1><p>Coming in Phase 7</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPlaceholder />} />
              <Route path="/leads" element={<LeadsPlaceholder />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
