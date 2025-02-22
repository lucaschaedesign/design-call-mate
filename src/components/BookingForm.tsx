import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, MessageSquare, Building2, Calendar } from "lucide-react";
import { createCalendarEvent, calculateEndTime, formatStartTime } from "@/lib/calendar";
import { useToast } from "@/components/ui/use-toast";
import { BookingData } from "@/lib/chat";
import { clearAuth } from "@/lib/googleAuth";

interface BookingFormProps {
  selectedDate?: string;
  selectedTime?: string;
  selectedDuration: number;
  bookingData?: BookingData;
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

export function BookingForm({ selectedDate, selectedTime, selectedDuration, bookingData }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [editedBookingData, setEditedBookingData] = useState<BookingData>(bookingData || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleBookingDataChange = (field: keyof BookingData, value: string) => {
    setEditedBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatEventDescription = (formData: FormData, bookingData: BookingData) => {
    const sections = [
      "📝 Project Details",
      `Business Name: ${bookingData.businessName || 'N/A'}`,
      `Industry: ${bookingData.industry || 'N/A'}`,
      `Project Type: ${Array.isArray(bookingData.projectType) ? bookingData.projectType.join(', ') : bookingData.projectType || 'N/A'}`,
      `Project Size: ${bookingData.projectSize || 'N/A'}`,
      `Timeline: ${bookingData.timeline || 'N/A'}`,
      `Budget Range: ${bookingData.budget || 'N/A'}`,
      "",
      "💬 Additional Notes",
      formData.message || 'No additional notes provided.',
      "",
      "This discovery call has been automatically scheduled through our booking system."
    ];

    return sections.join('\n');
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
      const date = new Date(selectedDate);
      const startTime = formatStartTime(date, selectedTime);
      const endTime = calculateEndTime(date, selectedTime, selectedDuration);

      const eventDescription = formatEventDescription(formData, editedBookingData);

      const response = await createCalendarEvent({
        summary: `Discovery Call with ${formData.name} - ${editedBookingData.businessName || 'New Client'}`,
        description: eventDescription,
        startTime,
        endTime,
        attendees: [formData.email]
      });

      console.log('Calendar event created:', response);

      toast({
        title: "Success!",
        description: "Your discovery call has been scheduled. Check your email for the calendar invite.",
      });

      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Booking error:', error);
      
      if (error.message?.includes('authentication') || error.status === 401) {
        clearAuth();
        toast({
          title: "Authentication Error",
          description: "Your Google Calendar access has expired. Please refresh the page to reconnect.",
          variant: "destructive"
        });
        window.location.reload();
        return;
      }

      toast({
        title: "Booking Failed",
        description: "There was an error scheduling your call. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && selectedDate && selectedTime;

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 mt-8 shadow-lg animate-fade-up">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input 
                id="businessName"
                value={editedBookingData.businessName || ''}
                onChange={(e) => handleBookingDataChange('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry"
                value={editedBookingData.industry || ''}
                onChange={(e) => handleBookingDataChange('industry', e.target.value)}
                placeholder="Your industry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectSize">Project Size</Label>
              <Input 
                id="projectSize"
                value={editedBookingData.projectSize || ''}
                onChange={(e) => handleBookingDataChange('projectSize', e.target.value)}
                placeholder="Project size"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input 
                id="timeline"
                value={editedBookingData.timeline || ''}
                onChange={(e) => handleBookingDataChange('timeline', e.target.value)}
                placeholder="Project timeline"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget Range</Label>
              <Input 
                id="budget"
                value={editedBookingData.budget || ''}
                onChange={(e) => handleBookingDataChange('budget', e.target.value)}
                placeholder="Budget range"
              />
            </div>

            {editedBookingData.projectType && (
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Input 
                  id="projectType"
                  value={Array.isArray(editedBookingData.projectType) 
                    ? editedBookingData.projectType.join(', ')
                    : editedBookingData.projectType || ''}
                  onChange={(e) => handleBookingDataChange('projectType', e.target.value)}
                  placeholder="Project type"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Meeting Details</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Notes (Optional)</Label>
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-2" />
              <Textarea
                id="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share anything that will help prepare for our call..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full md:w-auto" 
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "Scheduling..." : "Schedule Discovery Call"}
        </Button>
      </form>
    </Card>
  );
}
