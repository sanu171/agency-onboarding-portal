import { useOnboarding } from '../context/OnboardingContext';

export default function CompletionScreen() {
  const { sessionData } = useOnboarding();
  const { clientName, agency, template } = sessionData;

  const firstName = clientName ? clientName.split(' ')[0] : 'there';

  return (
    <div className="completion-screen">
      <div className="completion-emoji">🎉</div>
      <h1>You're all set, {firstName}!</h1>
      <p>We have everything we need to begin.</p>
      
      <div className="completion-list">
        {template?.requireIntake !== false && (
          <div className="completion-list-item">
            <span className="check">✅</span> <span>Brand information received</span>
          </div>
        )}
        {template?.requireFileUpload !== false && (
          <div className="completion-list-item">
            <span className="check">✅</span> <span>Files uploaded</span>
          </div>
        )}
        {template?.requireContract !== false && (
          <div className="completion-list-item">
            <span className="check">✅</span> <span>Contract signed</span>
          </div>
        )}
        {template?.requirePayment !== false && (
          <div className="completion-list-item">
            <span className="check">✅</span> <span>Deposit paid</span>
          </div>
        )}
        {template?.requireBooking !== false && (
          <div className="completion-list-item">
            <span className="check">✅</span> <span>Kickoff call booked</span>
          </div>
        )}
      </div>
      
      <div className="completion-contact">
        Questions? Contact us at <strong>{agency?.email || 'your agency'}</strong>
      </div>
    </div>
  );
}
