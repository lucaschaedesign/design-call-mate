
import { useEffect, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { ChatInterface } from "@/components/ChatInterface";
import { BookingForm } from "@/components/BookingForm";
import { BookingData } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [bookingData, setBookingData] = useState<BookingData>();
  const [showForm, setShowForm] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfHost();
  }, []);

  const checkIfHost = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: hostData } = await supabase
        .from('hosts')
        .select('*')
        .single();
      
      if (hostData) {
        setIsHost(true);
      }
    }
  };

  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  const handleChatComplete = (data: BookingData) => {
    setBookingData(data);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Book a Discovery Call</h1>
        {isHost ? (
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        ) : (
          <Button onClick={handleSignInWithGoogle}>Host Sign In</Button>
        )}
      </div>

      {!showForm ? (
        <ChatInterface onComplete={handleChatComplete} />
      ) : (
        <div className="space-y-8">
          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            selectedTime={selectedTime}
            onTimeSelect={setTimeSelect}
            selectedDuration={selectedDuration}
            onDurationSelect={setSelectedDuration}
          />
          <BookingForm
            selectedDate={selectedDate?.toISOString()}
            selectedTime={selectedTime}
            selectedDuration={selectedDuration}
            bookingData={bookingData}
          />
        </div>
      )}
    </div>
  );
}
