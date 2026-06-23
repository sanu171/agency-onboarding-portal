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

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
    background: isActive ? 'var(--brand-light)' : 'transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.15s',
    marginBottom: '2px'
  });

  const sidebarStyle = {
    width: '240px',
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)',
    height: '100vh',
    position: 'fixed',
    left: 0, top: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px'
  };

  return (
    <div className="min-h-screen">
      <aside style={sidebarStyle} className="sidebar-override">
        <div style={{ padding: '0 8px 24px 8px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          <div style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            maxWidth: '180px',
            fontWeight: '700',
            fontSize: '15px',
            color: 'var(--text-primary)'
          }}>
            {user?.agencyName || 'Agency'}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Agency Portal</p>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {navs.map(n => {
            const Icon = n.icon;
            const isActive = location.pathname === n.path || (n.path === '/dashboard' && location.pathname.startsWith('/dashboard/client/')) || (n.path !== '/dashboard' && location.pathname.startsWith(n.path));
            return (
              <Link key={n.path} to={n.path} style={navItemStyle(isActive)}>
                <Icon size={18} />
                {n.label}
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout} 
            style={{ ...navItemStyle(false), marginTop: 'auto', color: 'var(--danger)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
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
