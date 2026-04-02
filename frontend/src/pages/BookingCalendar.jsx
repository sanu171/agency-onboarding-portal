import { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function BookingCalendar() {
  const { sessionData, updateStep } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Mock available slots for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const slots = [
    { id: 1, time: "09:00 AM", date: tomorrow },
    { id: 2, time: "11:00 AM", date: tomorrow },
    { id: 3, time: "02:00 PM", date: tomorrow },
    { id: 4, time: "04:30 PM", date: tomorrow },
  ];

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    
    try {
      const scheduledCallAt = selectedSlot.date.toISOString(); // In real app, merge date + time
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
          <div className="bg-white border rounded-lg p-6 flex flex-col items-center justify-center h-full shadow-sm">
            <CalendarIcon size={48} className="text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{tomorrow.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <p className="text-sm text-gray-500">Duration: 30 minutes</p>
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
          className="bg-blue-600 text-white font-medium px-6 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Confirm Meeting'}
        </button>
      </div>
    </div>
  );
}
