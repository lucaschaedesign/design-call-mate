
import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { BookingForm } from "@/components/BookingForm";
import { BookingData } from "@/lib/chat";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ChatToBook = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>();
  const navigate = useNavigate();

  const handleChatComplete = (data: BookingData) => {
    setBookingData(data);
    setShowBookingForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FFFBEB] to-[#E8FFF8] py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-center mb-8">
            Book Your Discovery Call
          </h1>
          
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
        </Card>
      </div>
    </div>
  );
};

export default ChatToBook;
