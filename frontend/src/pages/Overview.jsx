import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, CheckCircle, ChevronRight, FileText, Upload, PenTool, CreditCard, Calendar } from 'lucide-react';

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ templateId: '', clientName: '', clientEmail: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const res = await fetch('http://localhost:5000/api/onboarding/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify(formData)
    });
    setLoading(false);
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Client Overview</h2>
        <button 
          onClick={() => { setIsModalOpen(true); setGeneratedLink(''); }}
          className="btn-primary"
        >
          <Plus size={18} /> New Client
        </button>
      </div>

      <div className="flex gap-6 mb-8">
        <div className="stat-card">
          <div className="label">Total Clients</div>
          <div className="value">{sessions.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">In Progress</div>
          <div className="value">{sessions.filter(s => s.currentStep !== 'complete').length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Complete</div>
          <div className="value">{sessions.filter(s => s.currentStep === 'complete').length}</div>
        </div>
      </div>

      <div>
        {sessions.length === 0 ? (
          <div className="empty-state bg-white border border-gray-200 rounded-xl max-w-2xl mx-auto">
            <div className="icon">📋</div>
            <h3>No clients yet</h3>
            <p>Generate your first magic link to start onboarding a client.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary mx-auto mt-4">
              <Plus size={18} /> New Client
            </button>
          </div>
        ) : (
          <div>
            {sessions.map((s) => (
              <div 
                key={s.id} 
                className="client-card"
                onClick={() => navigate(`/dashboard/client/${s.id}`)}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="client-name">{s.clientName}</div>
                    {s.currentStep === 'complete' ? (
                      <span className="badge badge-complete">COMPLETE</span>
                    ) : (
                      <span className="badge badge-in-progress">WAITING: {s.currentStep.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="client-email">{s.clientEmail}</div>
                  <div className="client-meta">
                    <span className="flex items-center gap-1">📋 {s.templateName}</span>
                    <span className="flex items-center gap-1">⏱️ Expires {new Date(s.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Generate Magic Link</h2>
            
            {generatedLink ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-green-800 font-semibold mb-2">Link Created Successfully!</p>
                <div className="flex items-center gap-2 bg-white border rounded p-2 mb-4">
                  <input type="text" readOnly value={generatedLink} className="flex-1 bg-transparent outline-none text-sm text-gray-600" />
                  <button onClick={handleCopy} className="text-gray-500 hover:text-blue-600">
                    {copied ? <CheckCircle className="text-green-500" size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">Close</button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4 text-left">
                <div>
                  <label>Template</label>
                  <select required value={formData.templateId} onChange={e => setFormData({...formData, templateId: parseInt(e.target.value)})}>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label>Client Name</label>
                  <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="e.g. John Smith" />
                </div>
                <div>
                  <label>Client Email</label>
                  <input required type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={templates.length === 0 || loading} className={`btn-primary ${loading ? 'btn-loading' : ''} disabled:opacity-50`}>
                    {loading ? 'Generating...' : 'Generate Link'}
                  </button>
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
