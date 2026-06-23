import { useOnboarding } from '../context/OnboardingContext';

export default function CompletionScreen() {
  const { sessionData } = useOnboarding();
  const { clientName, agency, template } = sessionData;

  const firstName = clientName ? clientName.split(' ')[0] : 'there';

  const Item = ({ label }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
      <div style={{
        width:'24px', height:'24px', borderRadius:'50%',
        background:'var(--success-light)', color:'var(--success)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', flexShrink:0
      }}>✓</div>
      <span style={{ fontSize:'15px', color:'var(--text-primary)', fontWeight:'500' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', maxWidth: '480px', margin: '40px auto' }}>
      <div style={{
        width: '80px', height: '80px', background: 'var(--success-light)',
        border: '4px solid var(--success-border)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '40px', margin: '0 auto 24px auto',
        boxShadow: '0 0 0 10px rgba(22, 163, 74, 0.05)'
      }}>🎉</div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>You're all set, {firstName}!</h1>
      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        We have everything we need to begin working on your project.
      </p>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'left',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          Completion Summary
        </h3>
        {template?.requireIntake !== false && <Item label="Brand information received" />}
        {template?.requireFileUpload !== false && <Item label="Files uploaded" />}
        {template?.requireContract !== false && <Item label="Contract signed" />}
        {template?.requirePayment !== false && <Item label="Deposit paid" />}
        {template?.requireBooking !== false && <Item label="Kickoff call booked" />}
      </div>
      
      <div style={{ color:'var(--text-muted)', fontSize:'14px' }}>
        Questions? Contact us at <strong>{agency?.email || 'your agency'}</strong>
      </div>
    </div>
  );
}
