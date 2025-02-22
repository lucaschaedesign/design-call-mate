
import { BookingCalendar } from "@/components/BookingCalendar";
import { BookingForm } from "@/components/BookingForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-booking-50 to-booking-100">
      <div className="container py-12">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-bold text-booking-900 mb-4">Book a Discovery Call</h1>
          <p className="text-booking-600 max-w-2xl mx-auto">
            Schedule a personalized consultation with our design team. We'll discuss your project needs and how we can help bring your vision to life.
          </p>
        </div>
        
        <BookingCalendar />
        <BookingForm />
      </div>
    </div>
  );
};

export default Index;
