import { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

export default function FileUpload() {
  const { sessionData, updateStep } = useOnboarding();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/onboarding/${sessionData.token}/files`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        updateStep(data.nextStep);
      } else {
        alert(data.message || data.Message || 'Upload failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    // If skipping is allowed
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/onboarding/${sessionData.token}/files/skip`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      updateStep(data.nextStep);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: File Uploads</h2>
      <p className="text-gray-600 mb-6">Please upload any requested documents or assets.</p>
      
      <div 
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: '2px dashed var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          background: 'var(--bg-surface)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--brand)';
          e.currentTarget.style.background = 'var(--brand-light)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.background = 'var(--bg-surface)';
        }}
      >
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>📁</div>
        <div style={{ fontWeight:'600', fontSize:'15px', marginBottom:'6px' }}>Drag and drop your files here</div>
        <div style={{ color:'var(--text-muted)', fontSize:'13px', marginBottom:'20px' }}>
          Logos, brand guides, reference images — PNG, SVG, PDF, JPG up to 50MB
        </div>
        <label className="btn-secondary" style={{ display:'inline-flex', gap:'6px' }}>
          📂 Browse Files
          <input type="file" multiple className="hidden" onChange={handleFileSelect} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Selected Files</h3>
          <ul className="space-y-2">
            {files.map((file, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileIcon className="text-gray-400 flex-shrink-0" size={20} />
                  <span className="truncate text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 p-1">
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'24px' }}>
        <button onClick={handleSkip} style={{
          background:'none', border:'none', color:'var(--text-muted)',
          fontSize:'13px', cursor:'pointer', textDecoration:'underline'
        }}>
          Skip this step
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
          className={`btn-primary ${uploading ? 'btn-loading' : ''}`}
          style={{ padding:'12px 28px' }}
        >
          {uploading ? 'Uploading...' : 'Save & Continue →'}
        </button>
      </div>
    </div>
  );
}
