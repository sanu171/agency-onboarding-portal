import { useOnboarding } from '../context/OnboardingContext';
import IntakeForm from './IntakeForm';
import FileUpload from './FileUpload';
import ContractViewer from './ContractViewer';
import PaymentForm from './PaymentForm';
import BookingCalendar from './BookingCalendar';
import CompletionScreen from './CompletionScreen';

export default function ClientPortal() {
  const { sessionData } = useOnboarding();
  const { currentStep, clientName, agency } = sessionData;

  const renderStep = () => {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b p-4 flex items-center justify-between" style={{ borderBottomColor: agency?.brandColor || '#e5e7eb' }}>
        <div className="flex items-center gap-4">
          {agency?.logoUrl ? (
            <img src={agency.logoUrl} alt={agency.name} className="h-8 object-contain" />
          ) : (
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              {agency?.name?.charAt(0)}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800">{agency?.name} Onboarding</h1>
        </div>
        <div className="text-gray-600 font-medium">Hi, {clientName}</div>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        <div className="bg-white shadow rounded-lg min-h-[400px]">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
