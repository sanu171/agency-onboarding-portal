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
        className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <UploadCloud size={48} className="mb-4 text-blue-500" />
        <p className="text-lg font-medium mb-2">Drag and drop files here</p>
        <p className="text-sm mb-4">or</p>
        <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded font-medium hover:bg-blue-200">
          Browse Files
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
      
      <div className="flex justify-end gap-4 mt-8">
        <button onClick={handleSkip} className="text-gray-600 font-medium px-6 py-2 rounded hover:bg-gray-100">
          Skip for now
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}
