import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, CheckCircle, Clock, Bell } from 'lucide-react';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('brand');

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/onboarding/sessions/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setClient(await res.json());
      } else {
        console.error("Failed to fetch client detail. Status:", res.status);
        setClient({ isError: true, status: res.status });
      }
    } catch (e) {
      console.error(e);
      setClient({ isError: true });
    }
  };

  const handleSendReminder = async () => {
    if (!window.confirm(`Send an email reminder to ${client.clientEmail}?`)) return;
    
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/onboarding/sessions/${id}/remind`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    if (res.ok) {
      alert(`Reminder completely sent to ${client.clientEmail}!`);
    } else {
      alert('Failed to send reminder.');
    }
  };

  const downloadZipViaFetch = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/onboarding/sessions/${id}/files/zip`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    if (!res.ok) return alert('Failed to download zip');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${client.clientName.replace(/\s+/g, '_')}_Files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!client) return <div className="p-8">Loading...</div>;
  if (client.isError) return <div className="p-8 text-red-500 font-bold border rounded m-4 bg-red-50">Error fetching client detail. Check backend terminal for 500 / Serialization errors.</div>;

  const tabs = [
    { id: 'brand', label: 'Brand Intake' },
    { id: 'files', label: 'Files' },
    { id: 'contract', label: 'Contract' },
    { id: 'payment', label: 'Payment' },
    { id: 'booking', label: 'Kickoff Call' },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900 bg-white border p-2 rounded-full shadow-sm hover:shadow">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            {client.clientName}
            {client.currentStep !== 'complete' && (
              <button 
                onClick={handleSendReminder}
                className="text-white bg-blue-600 hover:bg-blue-700 font-medium text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition shadow-sm"
              >
                <Bell size={14} /> Send Reminder
              </button>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{client.clientEmail} • Status: <span className="uppercase text-blue-600 font-semibold">{client.currentStep}</span></p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <div className="flex border-b overflow-x-auto bg-gray-50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === t.id ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[400px]">
          {activeTab === 'brand' && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Intake Form Responses</h3>
              {client.intakeForm ? (
                <div className="bg-gray-50 p-6 rounded border whitespace-pre-wrap font-mono text-sm text-gray-700 shadow-inner">
                  {client.intakeForm.submittedDataJson}
                </div>
              ) : (
                <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">Intake form not submitted yet.</p>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Uploaded Files</h3>
                {client.uploadedFiles?.length > 0 && (
                  <button onClick={downloadZipViaFetch} className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
                    <Download size={16} /> Download All (ZIP)
                  </button>
                )}
              </div>
              
              {client.uploadedFiles?.length > 0 ? (
                <ul className="divide-y border rounded shadow-sm">
                  {client.uploadedFiles.map(f => (
                    <li key={f.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <span className="font-medium text-gray-700 font-mono text-sm">{f.fileName}</span>
                      <a href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${f.filePath}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">View Raw</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">No files uploaded yet.</p>
              )}
            </div>
          )}

          {activeTab === 'contract' && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Signed Contract</h3>
              {client.contractSignature ? (
                <div className="bg-green-50 border border-green-200 p-8 rounded text-center max-w-lg shadow-sm">
                  <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
                  <p className="font-bold text-lg text-green-800 mb-1">Contract Signed</p>
                  <div className="bg-white border rounded p-4 mt-4 text-left">
                    <p className="text-sm text-gray-600 mb-2">Signature applied by:</p>
                    <p className="font-mono text-lg text-gray-800 border-b border-gray-200 inline-block pb-1 pr-8">{client.contractSignature.signatureDataUrl}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <strong>IP Address:</strong><br />{client.contractSignature.ipAddress}
                      </div>
                      <div>
                        <strong>Timestamp:</strong><br />{new Date(client.contractSignature.signedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">Contract not signed yet.</p>
              )}
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Payment Receipt</h3>
              {client.payment ? (
                <div className="bg-white border shadow-sm p-6 rounded max-w-lg">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <span className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Amount Paid</span>
                    <span className="text-3xl font-bold text-gray-900">${client.payment.amount.toFixed(2)}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Status</span>
                      <span className="uppercase bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">{client.payment.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Date</span>
                      <span className="text-gray-900 font-medium">{new Date(client.payment.paidAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{client.payment.stripePaymentIntentId}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">No payment record.</p>
              )}
            </div>
          )}

          {activeTab === 'booking' && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Kickoff Call</h3>
              {client.booking ? (
                <div className="bg-blue-50 border border-blue-200 p-8 rounded max-w-lg text-center shadow-sm">
                  <Clock className="mx-auto text-blue-500 mb-3" size={40} />
                  <p className="font-bold text-xl text-blue-900 mb-1">Call Scheduled</p>
                  <p className="text-gray-600 mb-6 font-medium">
                    {new Date(client.booking.scheduledCallAt).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="bg-white p-3 rounded border text-sm text-left">
                    <span className="text-gray-500 block mb-1 text-xs uppercase font-semibold">Meeting Link (To Be Generated)</span>
                    <a href={client.booking.meetingLink} className="text-blue-600 hover:underline font-mono" target="_blank" rel="noreferrer">
                      {client.booking.meetingLink || "Pending creation"}
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded border border-dashed">Kickoff call not booked yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
