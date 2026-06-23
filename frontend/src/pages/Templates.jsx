import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const TemplateCard = ({ template, onEdit, onDelete }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 24px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    <div>
      <div style={{ fontWeight:'600', fontSize:'16px', marginBottom:'10px' }}>{template.name}</div>
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
        {['Intake', 'Files', 'Contract', 'Payment', 'Booking'].map(step => {
          const propMap = {
            'Intake': 'requireIntake',
            'Files': 'requireFileUpload',
            'Contract': 'requireContract',
            'Payment': 'requirePayment',
            'Booking': 'requireBooking'
          };
          const isReq = template[propMap[step]];
          return (
            <span key={step} style={{
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              background: isReq ? 'var(--success-light)' : '#F1F5F9',
              color: isReq ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${isReq ? 'var(--success-border)' : 'var(--border)'}`
            }}>
              {isReq ? '✓' : '○'} {step}
            </span>
          );
        })}
      </div>
    </div>
    <div style={{ display:'flex', gap:'8px' }}>
      <button onClick={onEdit} className="btn-secondary" style={{ padding:'8px 16px', fontSize:'13px' }}>Edit</button>
      <button onClick={onDelete} style={{
        padding:'8px 16px', fontSize:'13px', background:'var(--danger-light)',
        color:'var(--danger)', border:'1px solid #FECACA', borderRadius:'var(--radius-md)', fontWeight:'600'
      }}>Delete</button>
    </div>
  </div>
);
export default function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    requireIntake: true,
    requireFileUpload: true,
    requireContract: true,
    requirePayment: true,
    requireBooking: true,
    paymentAmount: 0
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await fetch((import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + '/api/templates', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) {
      setTemplates(await res.json());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = editingId 
      ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/templates/${editingId}`
      : (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + '/api/templates';
      
    const res = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}` 
      },
      body: JSON.stringify(formData)
    });

    setLoading(false);
    if (res.ok) {
      setIsModalOpen(false);
      setEditingId(null);
      fetchTemplates();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/templates/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) fetchTemplates();
  };

  const openModal = (template = null) => {
    if (template) {
      setEditingId(template.id);
      setFormData(template);
    } else {
      setEditingId(null);
      setFormData({
        name: '', requireIntake: true, requireFileUpload: true,
        requireContract: true, requirePayment: true, requireBooking: true,
        paymentAmount: 0
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Templates</h2>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> New Template
        </button>
      </div>

      <div>
        {templates.length === 0 && <div className="p-6 text-center text-gray-500">No templates found. Create one to get started!</div>}
        {templates.map((tpl) => (
          <TemplateCard 
            key={tpl.id} 
            template={tpl} 
            onEdit={() => openModal(tpl)} 
            onDelete={() => handleDelete(tpl.id)} 
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Template' : 'Create Template'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label>Template Name</label>
                <input required type="text"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Website Redesign" />
              </div>
              
              <div className="checkbox-group">
                <label className={`checkbox-item ${formData.requireIntake ? 'checked' : ''}`}>
                  <input type="checkbox" className="hidden" checked={formData.requireIntake} onChange={e => setFormData({...formData, requireIntake: e.target.checked})} />
                  Intake Form
                </label>
                <label className={`checkbox-item ${formData.requireFileUpload ? 'checked' : ''}`}>
                  <input type="checkbox" className="hidden" checked={formData.requireFileUpload} onChange={e => setFormData({...formData, requireFileUpload: e.target.checked})} />
                  File Uploads
                </label>
                <label className={`checkbox-item ${formData.requireContract ? 'checked' : ''}`}>
                  <input type="checkbox" className="hidden" checked={formData.requireContract} onChange={e => setFormData({...formData, requireContract: e.target.checked})} />
                  Contract
                </label>
                <label className={`checkbox-item ${formData.requirePayment ? 'checked' : ''}`}>
                  <input type="checkbox" className="hidden" checked={formData.requirePayment} onChange={e => setFormData({...formData, requirePayment: e.target.checked})} />
                  Payment
                </label>
                <label className={`checkbox-item ${formData.requireBooking ? 'checked' : ''}`}>
                  <input type="checkbox" className="hidden" checked={formData.requireBooking} onChange={e => setFormData({...formData, requireBooking: e.target.checked})} />
                  Booking
                </label>
              </div>

              {formData.requirePayment && (
                <div>
                  <label>Payment Amount ($)</label>
                  <input type="number" min="0" step="0.01"
                    value={formData.paymentAmount || 0} onChange={e => setFormData({...formData, paymentAmount: parseFloat(e.target.value)})} />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className={`btn-primary ${loading ? 'btn-loading' : ''}`}>{loading ? 'Saving...' : 'Save Template'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
