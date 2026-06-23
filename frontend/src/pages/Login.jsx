import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      login(data);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        setError('Cannot connect to server. Ensure the backend is running.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh', background: '#fff' }} className="md:grid-cols-[420px_1fr]">
      
      {/* LEFT — brand panel */}
      <div className="hidden md:flex flex-col justify-between" style={{
        background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 100%)',
        padding: '48px 40px',
      }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'48px' }}>
            <div style={{
              width:'36px', height:'36px', background:'#2563EB',
              borderRadius:'8px', display:'flex', alignItems:'center',
              justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'16px'
            }}>C</div>
            <span style={{ color:'#fff', fontWeight:'700', fontSize:'18px' }}>Clientflow</span>
          </div>

          <h1 style={{ color:'#fff', fontSize:'28px', fontWeight:'700', lineHeight:'1.3', marginBottom:'16px' }}>
            The professional way to onboard your clients
          </h1>
          <p style={{ color:'#94A3B8', fontSize:'15px', lineHeight:'1.7', marginBottom:'40px' }}>
            Send one link. Your client fills everything — brand info, files, contract, deposit, and kickoff booking — in 15 minutes.
          </p>

          {['No more email back-and-forth', 'Contracts signed & deposits paid automatically', 'Full client dashboard from day one'].map((b,i) => (
            <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'16px' }}>
              <div style={{
                width:'20px', height:'20px', borderRadius:'50%', background:'rgba(37,99,235,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px'
              }}>
                <span style={{ color:'#60A5FA', fontSize:'11px', fontWeight:'700' }}>✓</span>
              </div>
              <span style={{ color:'#CBD5E1', fontSize:'14px', lineHeight:'1.5' }}>{b}</span>
            </div>
          ))}
        </div>

        <p style={{ color:'#475569', fontSize:'12px' }}>
          © 2026 Clientflow. Built for agencies.
        </p>
      </div>

      {/* RIGHT — form panel */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'48px', background:'#F8FAFC'
      }}>
        <div style={{ width:'100%', maxWidth:'400px' }}>
          <h2 style={{ fontSize:'24px', fontWeight:'700', marginBottom:'6px' }}>Welcome back</h2>
          <p style={{ color:'var(--text-secondary)', marginBottom:'32px' }}>Sign in to your agency dashboard</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
            <div>
              <label>Email address</label>
              <input
                type="email"
                required
                placeholder="admin@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full justify-center py-3 text-base ${loading ? 'btn-loading' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop:'24px', textAlign:'center', fontSize:'13px', color:'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--brand)', fontWeight:'600' }}>Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
