import { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PenTool } from 'lucide-react';

export default function ContractViewer() {
  const { sessionData, updateStep } = useOnboarding();
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);

  const { template } = sessionData;
  const contractText = template?.contractText || 
    "This is a standard service agreement. By typing your name below, you agree to the terms and conditions set forth by the Agency.";

  const handleSign = async (e) => {
    e.preventDefault();
    if (!signature.trim()) return alert("Please type your signature to agree.");

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/onboarding/${sessionData.token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureData: signature })
      });
      const data = await res.json();
      if (res.ok) {
        updateStep(data.nextStep);
      } else {
        alert(data.message || 'Failed to sign contract');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Review & Sign Contract</h2>
      <p className="text-gray-600 mb-6">Please review the agreement below carefully before signing.</p>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 h-64 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 shadow-inner">
        {contractText}
      </div>

      <form onSubmit={handleSign} className="border-t pt-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Electronic Signature (Type your full name)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PenTool size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              required
              className="pl-10 block w-full border border-gray-300 rounded p-3 focus:ring-blue-500 focus:border-blue-500 font-serif text-lg text-gray-800"
              placeholder="e.g. John Doe"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          By clicking "Sign & Continue", you acknowledge that this electronic signature is fully binding and holds the same legal 
          validity as a physical signature.
        </p>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !signature.trim()}
            className="bg-blue-600 text-white font-medium px-6 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
