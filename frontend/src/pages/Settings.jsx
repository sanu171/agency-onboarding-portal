import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Save } from 'lucide-react';

const PRESET_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'];

const LogoUpload = ({ currentLogo, onUpload }) => {
  const [preview, setPreview] = useState(currentLogo);

  useEffect(() => {
    setPreview(currentLogo);
  }, [currentLogo]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      onUpload(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <label className="logo-upload-zone">
      {preview ? (
        <img src={preview} alt="Agency Logo" className="logo-preview mx-auto" />
      ) : (
        <div className="upload-placeholder">
          <span className="block mb-2">📁</span>
          <p>Click to upload logo</p>
          <small>PNG, SVG, JPG — max 2MB</small>
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFile} hidden />
    </label>
  );
};

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', logoUrl: '', brandColor: '#2563eb' });
  const [loading, setLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('welcome');

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
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ name: formData.name, logoUrl: formData.logoUrl, brandColor: formData.brandColor })
      });
      if (res.ok) {
        addToast('Profile updated successfully!', 'success');
      } else {
        addToast('Failed to update profile.', 'error');
      }
    } catch (err) {
      addToast('Network error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Agency Brand Settings</h2>
        
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo</label>
            <LogoUpload 
              currentLogo={formData.logoUrl}
              onUpload={(base64) => setFormData({...formData, logoUrl: base64})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
            <div className="flex items-center gap-3 mb-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({...formData, brandColor: c})}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${formData.brandColor.toLowerCase() === c ? 'border-gray-900 shadow-sm' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
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
              className={`btn-primary ${loading ? 'btn-loading' : ''}`}
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="pl-6 border-l" style={{ minWidth: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live preview</span>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button type="button" onClick={() => setPreviewTab('welcome')} className={`px-3 py-1.5 text-xs font-semibold rounded ${previewTab === 'welcome' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Welcome</button>
            <button type="button" onClick={() => setPreviewTab('form')} className={`px-3 py-1.5 text-xs font-semibold rounded ${previewTab === 'form' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Form step</button>
            <button type="button" onClick={() => setPreviewTab('complete')} className={`px-3 py-1.5 text-xs font-semibold rounded ${previewTab === 'complete' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Complete</button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white w-full">
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderTopWidth: '4px', borderTopStyle: 'solid', borderTopColor: formData.brandColor || '#2563eb' }}>
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="h-6 object-contain max-w-[120px]" />
            ) : (
              <div className="h-6 w-6 bg-gray-100 rounded flex items-center justify-center font-bold text-xs" style={{ color: formData.brandColor || '#2563eb' }}>
                {(formData.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-gray-800 text-sm truncate">{formData.name || 'Agency Name'} Onboarding</span>
          </div>
          
          <div className="p-8 pb-10 bg-[#F8FAFC] min-h-[360px] flex flex-col justify-center">
            {previewTab === 'welcome' && (
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome, Client Name! 👋</h2>
                <p className="text-gray-500 text-sm mb-8">Let's get your project started.</p>
                
                <div className="flex items-center gap-2 mb-8 justify-center">
                  <span className="h-2 w-12 rounded-full" style={{ background: formData.brandColor || '#2563eb' }}></span>
                  <span className="h-2 w-12 rounded-full bg-gray-200"></span>
                  <span className="h-2 w-12 rounded-full bg-gray-200"></span>
                </div>

                <button 
                  type="button"
                  className="w-full py-3 rounded-lg text-white font-semibold text-sm shadow-sm transition-opacity hover:opacity-90"
                  style={{ background: formData.brandColor || '#2563eb' }}
                >
                  Let's Begin →
                </button>
              </div>
            )}

            {previewTab === 'form' && (
              <div className="text-left">
                <div className="flex items-center gap-2 mb-6 justify-center">
                  <span className="h-2 w-12 rounded-full bg-gray-200"></span>
                  <span className="h-2 w-12 rounded-full" style={{ background: formData.brandColor || '#2563eb' }}></span>
                  <span className="h-2 w-12 rounded-full bg-gray-200"></span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Step 2: Brand Intake</h2>
                <div className="space-y-4">
                  <div>
                    <div className="h-3 w-24 bg-gray-300 rounded mb-2"></div>
                    <div className="h-10 bg-white border border-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-gray-300 rounded mb-2"></div>
                    <div className="h-20 bg-white border border-gray-200 rounded"></div>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                    <button 
                      type="button"
                      className="px-6 py-2 rounded-lg text-white font-semibold text-sm shadow-sm transition-opacity hover:opacity-90"
                      style={{ background: formData.brandColor || '#2563eb' }}
                    >
                      Save & Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'complete' && (
              <div className="text-center">
                <div className="text-5xl mb-6 inline-block animate-bounce">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
                <p className="text-gray-500 text-sm mb-6">We have everything we need to begin.</p>
                
                <div className="text-left bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3 mx-auto max-w-sm">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" style={{ background: formData.brandColor || '#2563eb' }}>✓</span> 
                    Brand information received
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" style={{ background: formData.brandColor || '#2563eb' }}>✓</span> 
                    Files uploaded
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" style={{ background: formData.brandColor || '#2563eb' }}>✓</span> 
                    Contract signed
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
