
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { initiateGoogleAuth, handleAuthCallback, isAuthenticated, clearAuth } from "@/lib/googleAuth";
import { ChatInterface } from "@/components/ChatInterface";
import { BookingData } from "@/lib/chat";
import { BookingForm } from "@/components/BookingForm";

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>();

  const checkAuthentication = () => {
    const isAuth = isAuthenticated();
    setAuthenticated(isAuth);
    return isAuth;
  };

  useEffect(() => {
    const authSuccess = handleAuthCallback();
    if (authSuccess) {
      setAuthenticated(true);
    } else {
      checkAuthentication();
    }

    // Listen for storage changes (in case auth is cleared)
    const handleStorageChange = () => {
      checkAuthentication();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAuthError = () => {
    clearAuth();
    setAuthenticated(false);
    setShowBookingForm(false);
  };

  const handleChatComplete = (data: BookingData) => {
    if (!checkAuthentication()) {
      initiateGoogleAuth();
      return;
    }
    setBookingData(data);
    setShowBookingForm(true);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-booking-50 to-booking-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-booking-900 mb-4">Book a Discovery Call</h1>
          <p className="text-booking-600 max-w-2xl mx-auto mb-8">
            To schedule calls, we need access to your Google Calendar.
          </p>
          <Button size="lg" onClick={initiateGoogleAuth}>
            Connect with Google Calendar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-booking-50 to-booking-100">
      <div className="container py-12">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-bold text-booking-900 mb-4">Book a Discovery Call</h1>
          <p className="text-booking-600 max-w-2xl mx-auto">
            Let's discuss your project needs and how we can help bring your vision to life.
          </p>
        </div>
        
        {!showBookingForm ? (
          <ChatInterface onComplete={handleChatComplete} />
        ) : (
          <BookingForm 
            selectedDate={bookingData?.meetingDate}
            selectedTime={bookingData?.meetingTime}
            selectedDuration={30}
            bookingData={bookingData}
          />
        )}
      </div>
    </div>
  );
}

export default Index;
