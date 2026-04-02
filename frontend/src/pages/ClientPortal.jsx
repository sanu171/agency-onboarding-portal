import { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import IntakeForm from './IntakeForm';
import FileUpload from './FileUpload';
import ContractViewer from './ContractViewer';
import PaymentForm from './PaymentForm';
import BookingCalendar from './BookingCalendar';
import CompletionScreen from './CompletionScreen';

const ProgressBar = ({ currentIdx, steps, brandColor }) => {
  return (
    <div className="progress-container">
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div key={index} className="progress-step">
            <div className={`step-dot ${
              index < currentIdx ? 'completed' :
              index === currentIdx ? 'active' : 'upcoming'
            }`} style={index === currentIdx ? { background: brandColor, borderColor: brandColor, boxShadow: `0 0 0 4px ${brandColor}33` } : {}}>
              {index < currentIdx ? '✓' : index + 1}
            </div>
            <span className="step-label">{step.label}</span>
            {index < steps.length - 1 && (
              <div className={`step-line ${index < currentIdx ? 'completed' : ''}`} />
            )}
          </div>
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
      return (
        <div className="welcome-screen">
          {agency?.logoUrl && <img src={agency.logoUrl} alt="Logo" className="h-16 object-contain mx-auto mb-6" />}
          <h1>Welcome, {clientName.split(' ')[0]}! 👋</h1>
          <p>We're excited to start working with you. This will take about 5–10 minutes. Here's what we'll cover:</p>
          <div className="welcome-checklist">
            {steps.map(s => (
              <div key={s.id} className="welcome-checklist-item">
                <span className="text-green-600 text-lg">✅</span> {s.label}
              </div>
            ))}
          </div>
          <button 
            onClick={startOnboarding} 
            className="btn-primary mx-auto px-8 py-3 text-lg"
            style={{ background: agency?.brandColor || '#2563EB' }}
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
      <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between" style={{ borderBottomColor: agency?.brandColor || '#e5e7eb', borderBottomWidth: '3px' }}>
        <div className="flex items-center gap-4">
          {agency?.logoUrl ? (
            <img src={agency.logoUrl} alt={agency.name} className="h-8 object-contain" />
          ) : (
            <div className="h-8 w-8 rounded flex items-center justify-center text-white font-bold" style={{ background: agency?.brandColor || '#2563EB' }}>
              {agency?.name?.charAt(0) || 'A'}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800">{agency?.name} Onboarding</h1>
        </div>
        <div className="text-gray-600 font-medium text-sm">Hi, {clientName}</div>
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
