import { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';

export default function IntakeForm() {
  const { sessionData, updateStep } = useOnboarding();
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    targetAudience: '',
    brandPersonality: [],
    brandColors: [{ name: 'Primary', hex: '#000000' }],
    competitors: '',
    projectGoal: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const personalities = ['Professional', 'Playful', 'Minimal', 'Bold', 'Friendly', 'Luxury', 'Tech-focused', 'Traditional'];

  const togglePersonality = (p) => {
    setFormData(prev => ({
      ...prev,
      brandPersonality: prev.brandPersonality.includes(p) 
        ? prev.brandPersonality.filter(x => x !== p) 
        : [...prev.brandPersonality, p]
    }));
  };

  const handleColorChange = (index, value) => {
    const newColors = [...formData.brandColors];
    newColors[index] = { ...newColors[index], hex: value };
    setFormData({ ...formData, brandColors: newColors });
  };

  const addColor = () => {
    setFormData({ ...formData, brandColors: [...formData.brandColors, { name: `'Secondary'`, hex: '#ffffff' }] });
  };

  const removeColor = (index) => {
    const newColors = formData.brandColors.filter((_, i) => i !== index);
    setFormData({ ...formData, brandColors: newColors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/onboarding/${sessionData.token}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataJson: JSON.stringify(formData, null, 2) })
      });
      const data = await res.json();
      if (res.ok) {
        updateStep(data.nextStep);
      } else {
        alert(data.message || data.Message || 'Error submitting form');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Step 1: Brand Intake Information</h2>
      <p className="text-gray-600 mb-8 pb-4 border-b">Complete this form so we can understand your business better.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
            <input 
              required 
              type="text" 
              className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
              value={formData.businessName}
              onChange={e => setFormData({...formData, businessName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
            <input 
              required 
              type="text" 
              className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
              value={formData.industry}
              onChange={e => setFormData({...formData, industry: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
          <textarea 
            rows={2} 
            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., Women 25-45, health-conscious professionals"
            value={formData.targetAudience}
            onChange={e => setFormData({...formData, targetAudience: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Personality</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {personalities.map(p => (
              <label key={p} className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-colors ${formData.brandPersonality.includes(p) ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'}`}>
                <input 
                  type="checkbox" 
                  checked={formData.brandPersonality.includes(p)}
                  onChange={() => togglePersonality(p)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
          <div className="space-y-3 mb-2">
            {formData.brandColors.map((color, i) => (
              <div key={i} className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={color.hex} 
                  onChange={(e) => handleColorChange(i, e.target.value)} 
                  className="w-12 h-10 p-1 rounded border cursor-pointer"
                />
                <input 
                  type="text" 
                  value={color.hex} 
                  onChange={(e) => handleColorChange(i, e.target.value)} 
                  className="w-24 border border-gray-300 rounded p-2 uppercase font-mono text-sm"
                />
                {formData.brandColors.length > 1 && (
                  <button type="button" onClick={() => removeColor(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addColor} className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Add another color</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Competitors</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Who are your main competitors?"
            value={formData.competitors}
            onChange={e => setFormData({...formData, competitors: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Goals *</label>
          <textarea 
            required
            rows={3} 
            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What exactly do you want to achieve with this project? What does success look like?"
            value={formData.projectGoal}
            onChange={e => setFormData({...formData, projectGoal: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline Expectations</label>
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="E.g., Need it live before Christmas, or Flexible"
            value={formData.deadline}
            onChange={e => setFormData({...formData, deadline: e.target.value})}
          />
        </div>

        <div className="pt-6 border-t flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white font-medium px-8 py-3 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
