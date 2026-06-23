import { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function BookingCalendar() {
  const { sessionData, updateStep } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTomorrow());

  const slots = [
    { id: 1, time: "09:00 AM", hours: 9, mins: 0 },
    { id: 2, time: "11:00 AM", hours: 11, mins: 0 },
    { id: 3, time: "02:00 PM", hours: 14, mins: 0 },
    { id: 4, time: "04:30 PM", hours: 16, mins: 30 },
  ];

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    
    try {
      const d = new Date(selectedDate);
      d.setHours(selectedSlot.hours, selectedSlot.mins, 0, 0);
      const scheduledCallAt = d.toISOString();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/onboarding/${sessionData.token}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledCallAt })
      });
      const data = await res.json();
      
      if (res.ok) {
        updateStep(data.nextStep);
      } else {
        alert(data.message || data.Message || 'Failed to book meeting');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 5: Book a Kickoff Call</h2>
      <p className="text-gray-600 mb-8">Select a time that works best for you to chat with the {sessionData.agency?.name} team.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col h-full shadow-sm">
            <div className="flex flex-col items-center flex-1 justify-center mb-8">
              <CalendarIcon size={48} className="text-blue-500 mb-4" />
              <p className="text-sm text-gray-500 font-medium">Duration: 30 minutes</p>
            </div>
            
            <div className="mt-auto border-t border-gray-100 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select a date</label>
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'inherit',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  background: '#F8FAFC',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>

        
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 mb-2">Available times</h3>
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', border: `1px solid ${selectedSlot?.id === slot.id ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                background: selectedSlot?.id === slot.id ? 'var(--brand-light)' : 'var(--bg-card)',
                color: selectedSlot?.id === slot.id ? 'var(--brand-dark)' : 'var(--text-primary)',
                fontWeight: selectedSlot?.id === slot.id ? '600' : '500',
                transition: 'all 0.15s',
                cursor: 'pointer'
              }}
            >
              <Clock size={16} />
              {slot.time}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-8 border-t pt-6">
        <button
          onClick={handleBook}
          disabled={loading || !selectedSlot}
          className={`btn-primary ${loading ? 'btn-loading' : ''}`}
          style={{ padding:'12px 28px', fontSize:'15px' }}
        >
          {loading ? 'Booking...' : 'Confirm Meeting →'}
        </button>
      </div>
    </div>
  );
}
