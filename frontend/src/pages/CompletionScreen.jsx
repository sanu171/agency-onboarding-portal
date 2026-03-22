import { useOnboarding } from '../context/OnboardingContext';
import { PartyPopper, CheckCircle } from 'lucide-react';

export default function CompletionScreen() {
  const { sessionData } = useOnboarding();

  return (
    <div className="p-10 flex flex-col items-center justify-center text-center min-h-[500px]">
      <div className="bg-green-100 text-green-600 p-6 rounded-full mb-6 relative">
        <PartyPopper size={48} />
        <CheckCircle size={24} className="absolute bottom-0 right-0 bg-white rounded-full" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-4">You're All Set!</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Thank you for completing the onboarding process. We have received all your information and the {sessionData.agency?.name} team will be in touch shortly.
      </p>
      
      {sessionData.template?.requireBooking && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md w-full mb-8">
          <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
          <p className="text-blue-700 text-sm">You will receive an email confirmation with your meeting details.</p>
        </div>
      )}
      
      <button 
        onClick={() => window.close()} 
        className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        Close Window
      </button>
    </div>
  );
}
