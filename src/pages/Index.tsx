
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { BookingData } from "@/lib/chat";
import { BookingForm } from "@/components/BookingForm";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, initiateGoogleAuth } from "@/lib/googleAuth";
import { toast } from "sonner";

const Index = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>();
  const [calendarConnected, setCalendarConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkCalendarAuth();
  }, []);

  const checkCalendarAuth = () => {
    const isCalendarAuth = isAuthenticated();
    setCalendarConnected(isCalendarAuth);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleCalendarReconnect = () => {
    try {
      initiateGoogleAuth();
    } catch (error) {
      console.error('Failed to reconnect calendar:', error);
      toast.error('Failed to reconnect to Google Calendar');
    }
  };

  const handleChatComplete = (data: BookingData) => {
    setBookingData(data);
    setShowBookingForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-booking-50 to-booking-100">
      <div className="container py-12">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-bold text-booking-900 mb-4">Book a Discovery Call</h1>
          <p className="text-booking-600 max-w-2xl mx-auto mb-8">
            Let's discuss your project needs and how we can help bring your vision to life.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button onClick={handleGoToDashboard} size="lg">
              Go to Dashboard
            </Button>
            {!calendarConnected && (
              <Button 
                onClick={handleCalendarReconnect} 
                variant="outline" 
                size="lg"
                className="bg-white"
              >
                Reconnect Calendar
              </Button>
            )}
          </div>
        </div>
        
        {showBookingForm ? (
          <BookingForm 
            selectedDate={bookingData?.meetingDate}
            selectedTime={bookingData?.meetingTime}
            selectedDuration={30}
            bookingData={bookingData}
          />
        ) : (
          <ChatInterface onComplete={handleChatComplete} />
        )}
      </div>
    </div>
  );
};

export default Index;
