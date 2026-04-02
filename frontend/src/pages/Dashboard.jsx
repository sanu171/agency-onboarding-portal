import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Templates from './Templates';
import Overview from './Overview';
import ClientDetail from './ClientDetail';
import Settings from './Settings';
import { LayoutDashboard, FileText, LogOut, Settings as SettingsIcon } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navs = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/templates', label: 'Templates', icon: FileText },
    { path: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>{user?.agencyName || 'Agency'}</h2>
          <p>Agency Portal</p>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {navs.map(n => {
            const Icon = n.icon;
            // Exact match for overview, prefix match for others (like /dashboard/client/:id highlights overview)
            const isActive = location.pathname === n.path || (n.path === '/dashboard' && location.pathname.startsWith('/dashboard/client/')) || (n.path !== '/dashboard' && location.pathname.startsWith(n.path));
            return (
              <Link key={n.path} to={n.path} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                {n.label}
              </Link>
            );
          })}
          
          <button onClick={handleLogout} className="sidebar-nav-item sidebar-logout">
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      <main style={{ marginLeft: '240px', padding: '32px' }}>
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
