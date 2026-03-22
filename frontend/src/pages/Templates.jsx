import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    const res = await fetch('http://localhost:5000/api/templates', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (res.ok) {
      setTemplates(await res.json());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:5000/api/templates/${editingId}`
      : 'http://localhost:5000/api/templates';
      
    const res = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}` 
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingId(null);
      fetchTemplates();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`http://localhost:5000/api/templates/${id}`, {
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

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {templates.length === 0 && <li className="p-6 text-center text-gray-500">No templates found. Create one to get started!</li>}
          {templates.map((tpl) => (
            <li key={tpl.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{tpl.name}</h3>
                <p className="text-sm text-gray-500 mt-1 flex gap-4">
                  <span>Intake: {tpl.requireIntake ? '✅' : '❌'}</span>
                  <span>Files: {tpl.requireFileUpload ? '✅' : '❌'}</span>
                  <span>Contract: {tpl.requireContract ? '✅' : '❌'}</span>
                  <span>Payment: {tpl.requirePayment ? '✅' : '❌'}</span>
                  <span>Booking: {tpl.requireBooking ? '✅' : '❌'}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(tpl)} className="text-blue-600 hover:text-blue-900"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(tpl.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Template' : 'Create Template'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Template Name</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded p-2" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.requireIntake} onChange={e => setFormData({...formData, requireIntake: e.target.checked})} />
                  Require Intake
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.requireFileUpload} onChange={e => setFormData({...formData, requireFileUpload: e.target.checked})} />
                  Require Files
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.requireContract} onChange={e => setFormData({...formData, requireContract: e.target.checked})} />
                  Require Contract
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.requirePayment} onChange={e => setFormData({...formData, requirePayment: e.target.checked})} />
                  Require Payment
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.requireBooking} onChange={e => setFormData({...formData, requireBooking: e.target.checked})} />
                  Require Booking
                </label>
              </div>

              {formData.requirePayment && (
                <div>
                  <label className="block text-sm font-medium">Payment Amount ($)</label>
                  <input type="number" min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded p-2" 
                    value={formData.paymentAmount || 0} onChange={e => setFormData({...formData, paymentAmount: parseFloat(e.target.value)})} />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
