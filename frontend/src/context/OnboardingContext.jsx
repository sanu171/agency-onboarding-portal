import { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const { token } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSession();
  }, [token]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/onboarding/${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load session');
      setSessionData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStep = (newStep) => {
    setSessionData((prev) => ({ ...prev, currentStep: newStep }));
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Oops!</h1>
      <p className="text-gray-600 text-lg mb-6">{error}</p>
      <p className="text-sm text-gray-400">Please contact your agency for a new link.</p>
    </div>
  );

  return (
    <OnboardingContext.Provider value={{ sessionData, updateStep, refresh: fetchSession }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
