import { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ clientSecret, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md shadow-sm bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } } } }} />
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <button disabled={!stripe || loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition shadow">
        <CreditCard size={20} />
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default function PaymentForm() {
  const { sessionData, updateStep, agency } = useOnboarding();
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/onboarding/${sessionData.token}/payment/intent`, { method: 'POST' })
      .then(r => r.json())
      .then(d => setClientSecret(d.clientSecret));
  }, [sessionData.token]);

  const handleSuccess = async (paymentIntentId) => {
    const res = await fetch(`http://localhost:5000/api/onboarding/${sessionData.token}/payment/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId })
    });
    if (res.ok) {
      const { nextStep } = await res.json();
      updateStep(nextStep);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Step 4: Deposit</h2>
      <p className="text-gray-600 text-center mb-8 pb-4 border-b">
        Please submit your project deposit of <strong className="text-gray-900">${sessionData.template?.paymentAmount?.toFixed(2)}</strong>.
      </p>

      {clientSecret === 'mock_secret_for_local_dev' ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-amber-800 text-center shadow-inner">
          <p className="font-bold text-lg mb-2">Developer Mode</p>
          <p className="text-sm mb-4">Stripe Test Keys are missing on the backend. You can bypass this step solely for testing workflows locally.</p>
          <button 
            onClick={() => handleSuccess("pi_mock_bypass")} 
            className="w-full bg-amber-500 text-white font-bold py-3 rounded hover:bg-amber-600 transition"
          >
            Bypass Payment (Local Dev)
          </button>
        </div>
      ) : clientSecret ? (
        <div>
          <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-500">
            <span>Payable To:</span>
            <span>{agency?.name || 'Agency'}</span>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} amount={sessionData.template?.paymentAmount || 0} onSuccess={handleSuccess} />
          </Elements>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading secure checkout...</p>
        </div>
      )}
    </div>
  );
}
