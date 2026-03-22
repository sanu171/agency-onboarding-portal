import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', logoUrl: '', brandColor: '#2563eb' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setFormData({ 
        name: data.agencyName || '', 
        logoUrl: data.logoUrl || '', 
        brandColor: data.brandColor || '#2563eb' 
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ name: formData.name, logoUrl: formData.logoUrl, brandColor: formData.brandColor })
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Agency Brand Settings</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
          <input 
            type="text" 
            required 
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input 
            type="url" 
            placeholder="https://example.com/logo.png"
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.logoUrl}
            onChange={e => setFormData({...formData, logoUrl: e.target.value})}
          />
          <p className="text-xs text-gray-500 mt-1">Provide a direct link to a hosted image. This logo will appear on the Client Portal.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color (Hex)</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer"
              value={formData.brandColor}
              onChange={e => setFormData({...formData, brandColor: e.target.value})}
            />
            <input 
              type="text" 
              className="w-32 border border-gray-300 rounded-md p-2 font-mono text-center"
              value={formData.brandColor}
              onChange={e => setFormData({...formData, brandColor: e.target.value})}
              placeholder="#2563eb"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <div className="mt-12 bg-gray-50 p-6 rounded border border-dashed">
        <h3 className="font-semibold text-gray-800 mb-4">Client Portal Preview</h3>
        <div 
          className="bg-white border shadow-sm rounded-md p-4 flex items-center gap-4"
          style={{ borderBottomWidth: '4px', borderBottomColor: formData.brandColor || '#2563eb' }}
        >
          {formData.logoUrl ? (
            <img src={formData.logoUrl} alt="Logo" className="h-8 object-contain" />
          ) : (
            <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-bold">
              {formData.name.charAt(0) || '?'}
            </div>
          )}
          <span className="font-bold text-lg text-gray-800">{formData.name || 'Agency Name'} Onboarding</span>
        </div>
      </div>
    </div>
  );
}
