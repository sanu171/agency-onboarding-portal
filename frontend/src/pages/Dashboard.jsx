import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Templates from './Templates';
import Overview from './Overview';
import ClientDetail from './ClientDetail';
import Settings from './Settings';
import { LayoutDashboard, FileText, Link as LinkIcon, LogOut, Settings as SettingsIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 break-words">{user?.agencyName}</h2>
          <p className="text-sm text-gray-500">Agency Portal</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">
            <LayoutDashboard size={20} />
            Overview
          </Link>
          <Link to="/dashboard/templates" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">
            <FileText size={20} />
            Templates
          </Link>
          <Link to="/dashboard/settings" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded">
            <SettingsIcon size={20} />
            Settings
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded mt-auto">
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/client/:id" element={<ClientDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
