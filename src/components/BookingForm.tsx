
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, MessageSquare } from "lucide-react";
import { createCalendarEvent, calculateEndTime, formatStartTime } from "@/lib/calendar";
import { useToast } from "@/components/ui/use-toast";

interface BookingFormProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedDuration: number;
}

export function BookingForm({ selectedDate, selectedTime, selectedDuration }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your call",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const startTime = formatStartTime(selectedDate, selectedTime);
      const endTime = calculateEndTime(selectedDate, selectedTime, selectedDuration);

      const response = await createCalendarEvent({
        summary: `Discovery Call with ${formData.name}`,
        description: formData.message || 'Initial discovery call to discuss project needs.',
        startTime,
        endTime,
        attendees: [formData.email, 'your.email@yourdomain.com'], // Replace this with your actual email
      });

      console.log('Calendar event created:', response); // Debug log

      toast({
        title: "Success!",
        description: "Your discovery call has been scheduled. Check your email for the calendar invite.",
      });

      // Reset form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error scheduling your call. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 mt-8 shadow-lg animate-fade-up">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-booking-600" />
            <h2 className="text-xl font-semibold text-booking-800">Your Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-booking-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-booking-400 mt-2" />
              <Textarea
                id="message"
                placeholder="Share anything that will help prepare for our call..."
                className="min-h-[100px]"
                value={formData.message}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full md:w-auto" 
          size="lg"
          disabled={isSubmitting || !selectedDate || !selectedTime}
        >
          {isSubmitting ? "Scheduling..." : "Schedule Discovery Call"}
        </Button>
      </form>
    </Card>
  );
}
