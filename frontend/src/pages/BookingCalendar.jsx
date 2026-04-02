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
      const res = await fetch(`http://localhost:5000/api/onboarding/${sessionData.token}/booking`, {
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white cursor-pointer font-medium"
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
              className={`w-full flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
                selectedSlot?.id === slot.id 
                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium ring-1 ring-blue-500' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
              }`}
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
          className={`btn-primary ${loading ? 'btn-loading' : ''} disabled:opacity-50 px-8`}
        >
          {loading ? 'Booking...' : 'Confirm Meeting'}
        </button>
      </div>
    </div>
  );
}
