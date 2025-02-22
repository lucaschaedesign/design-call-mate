
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { initiateGoogleAuth, handleAuthCallback, isAuthenticated, clearAuth } from "@/lib/googleAuth";
import { ChatInterface } from "@/components/ChatInterface";
import { BookingData } from "@/lib/chat";
import { BookingForm } from "@/components/BookingForm";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleAuthError = () => {
    clearAuth();
    setShowBookingForm(false);
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
          <div className="flex justify-center gap-4">
            <Button onClick={handleGoogleSignIn} size="lg">
              Sign in with Google
            </Button>
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
