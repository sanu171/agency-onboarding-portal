import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, CheckCircle, ChevronRight } from 'lucide-react';

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ templateId: '', clientName: '', clientEmail: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${user.token}` };
    const [sessRes, tempRes] = await Promise.all([
      fetch('http://localhost:5000/api/onboarding/sessions', { headers }),
      fetch('http://localhost:5000/api/templates', { headers })
    ]);
    if (sessRes.ok) setSessions(await sessRes.json());
    if (tempRes.ok) {
      const ts = await tempRes.json();
      setTemplates(ts);
      if (ts.length > 0) setFormData(f => ({ ...f, templateId: ts[0].id }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/onboarding/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const data = await res.json();
      setGeneratedLink(data.link);
      fetchData();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Client Overview</h2>
        <button 
          onClick={() => { setIsModalOpen(true); setGeneratedLink(''); }}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> New Client
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sessions.length === 0 && <li className="p-6 text-center text-gray-500">No client sessions yet.</li>}
          {sessions.map((s) => (
            <li 
              key={s.id} 
              onClick={() => navigate(`/dashboard/client/${s.id}`)}
              className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer transition"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">{s.clientName} ({s.clientEmail})</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Template: <span className="font-semibold">{s.templateName}</span> | Status: <span className="uppercase font-semibold text-blue-600">{s.currentStep}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400">
                  Expires: {new Date(s.expiresAt).toLocaleDateString()}
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Generate Magic Link</h3>
            
            {generatedLink ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-green-800 font-semibold mb-2">Link Created Successfully!</p>
                <div className="flex items-center gap-2 bg-white border rounded p-2 mb-4">
                  <input type="text" readOnly value={generatedLink} className="flex-1 bg-transparent outline-none text-sm text-gray-600" />
                  <button onClick={handleCopy} className="text-gray-500 hover:text-blue-600">
                    {copied ? <CheckCircle className="text-green-500" size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Close</button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Template</label>
                  <select required className="mt-1 block w-full border border-gray-300 rounded p-2" 
                    value={formData.templateId} onChange={e => setFormData({...formData, templateId: parseInt(e.target.value)})}>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Client Name</label>
                  <input required type="text" className="mt-1 block w-full border border-gray-300 rounded p-2" 
                    value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium">Client Email</label>
                  <input required type="email" className="mt-1 block w-full border border-gray-300 rounded p-2" 
                    value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={templates.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Generate Link</button>
                </div>
                {templates.length === 0 && <p className="text-red-500 text-sm mt-2">Please create a Template first.</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
