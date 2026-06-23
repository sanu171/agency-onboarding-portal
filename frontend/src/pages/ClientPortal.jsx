import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import IntakeForm from './IntakeForm';
import FileUpload from './FileUpload';
import ContractViewer from './ContractViewer';
import PaymentForm from './PaymentForm';
import BookingCalendar from './BookingCalendar';
import CompletionScreen from './CompletionScreen';

const ProgressBar = ({ currentIdx, steps, brandColor }) => {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      padding: '20px 32px',
      marginBottom: '0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', flexShrink:0 }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px',
                transition: 'all 0.3s',
                background: i < currentIdx ? 'var(--success)' :
                            i === currentIdx ? 'var(--brand)' : 'var(--bg-surface)',
                color: i <= currentIdx ? '#fff' : 'var(--text-muted)',
                border: i < currentIdx ? '2px solid var(--success)' :
                        i === currentIdx ? '2px solid var(--brand)' : '2px solid var(--border)',
                boxShadow: i === currentIdx ? '0 0 0 4px rgba(37,99,235,0.12)' : 'none'
              }}>
                {i < currentIdx ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: i === currentIdx ? '600' : '500',
                color: i < currentIdx ? 'var(--success)' :
                       i === currentIdx ? 'var(--brand)' : 'var(--text-muted)',
                whiteSpace: 'nowrap'
              }}>
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                background: i < currentIdx ? 'var(--success)' : 'var(--border)',
                margin: '0 4px',
                marginBottom: '18px',
                transition: 'background 0.3s'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default function ClientPortal() {
  const { sessionData } = useOnboarding();
  const { currentStep, clientName, agency, templateName } = sessionData;
  // If the step is intake, and it's their first time, show welcome. 
  // (We use a local state so they can click 'Start')
  const [showWelcome, setShowWelcome] = useState(currentStep === 'intake');

  // Build dynamic steps array based on what's generally active
  const steps = [
    { id: 'intake', label: 'Brand Info' },
    { id: 'files', label: 'Files' },
    { id: 'contract', label: 'Contract' },
    { id: 'payment', label: 'Payment' },
    { id: 'booking', label: 'Booking' }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  const startOnboarding = () => setShowWelcome(false);

  const renderStep = () => {
    if (showWelcome) {
      const displayName = clientName
        ? clientName.split(' ')[0].charAt(0).toUpperCase() + clientName.split(' ')[0].slice(1).toLowerCase()
        : 'there';

      const stepsInfo = [
        { label: 'Brand information', desc: 'Tell us about your business' },
        { label: 'Upload your files', desc: 'Logos, brand guides, references' },
        { label: 'Sign the agreement', desc: 'Review and e-sign the contract' },
        { label: 'Pay your deposit', desc: 'Secure your project slot' },
        { label: 'Book your kickoff call', desc: 'Pick a time to meet the team' },
      ];

      return (
        <div style={{ maxWidth: '540px', margin: '40px auto', textAlign: 'center' }}>
          {agency?.logoUrl && <img src={agency.logoUrl} alt="Logo" className="h-16 object-contain mx-auto mb-6" />}
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Welcome, {displayName}! 👋</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            We're excited to start working with you. This will take about 5–10 minutes. Here's what we'll cover:
          </p>

          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            {stepsInfo.map((step, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'14px',
                padding:'12px 0',
                borderBottom: i < stepsInfo.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div style={{
                  width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                  background:'var(--bg-surface)', border:'1.5px solid var(--border)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'12px', fontWeight:'700', color:'var(--text-muted)'
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontWeight:'600', fontSize:'14px', color:'var(--text-primary)' }}>{step.label}</div>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={startOnboarding} 
            className="btn-primary"
            style={{ padding: '14px 32px', fontSize: '16px', width: '100%', maxWidth: '300px' }}
          >
            Let's Begin →
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 'intake': return <IntakeForm />;
      case 'files': return <FileUpload />;
      case 'contract': return <ContractViewer />;
      case 'payment': return <PaymentForm />;
      case 'booking': return <BookingCalendar />;
      case 'complete': return <CompletionScreen />;
      default: return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {/* Logo — constrain size so any image looks clean */}
          <div style={{
            width:'36px', height:'36px', borderRadius:'8px',
            overflow:'hidden', flexShrink:0,
            border:'1px solid var(--border)',
            background:'var(--bg-surface)'
          }}>
            <img
              src={agency?.logoUrl || ''}
              alt={agency?.name || 'Agency'}
              style={{ width:'100%', height:'100%', objectFit:'contain' }}
              onError={(e) => {
                // fallback to initials if logo fails to load
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#EFF6FF;color:#2563EB;font-weight:700;font-size:14px">${(agency?.name || 'A').charAt(0).toUpperCase()}</div>`;
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight:'600', fontSize:'14px', color:'var(--text-primary)' }}>
              {agency?.name || 'Agency'} Onboarding
            </div>
            <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Secure client portal</div>
          </div>
        </div>

        {/* Right side — show client name properly, not raw data */}
        <div style={{
          fontSize:'13px', color:'var(--text-secondary)', fontWeight:'500',
          background:'var(--bg-surface)', padding:'6px 14px',
          borderRadius:'20px', border:'1px solid var(--border)'
        }}>
          {/* Capitalize the client name properly */}
          👋 {clientName ? clientName.charAt(0).toUpperCase() + clientName.slice(1).toLowerCase() : 'Client'}
        </div>
      </header>
      <main className="flex-1 w-full mx-auto p-4 md:p-8" style={{ maxWidth: showWelcome ? '600px' : '900px' }}>
        {!showWelcome && currentStep !== 'complete' && (
           <ProgressBar currentIdx={currentIndex} steps={steps} brandColor={agency?.brandColor || '#2563EB'} />
        )}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl min-h-[400px] p-6 lg:p-10 text-gray-800">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
