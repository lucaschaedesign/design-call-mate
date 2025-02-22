
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, MessageSquare } from "lucide-react";

export function BookingForm() {
  return (
    <Card className="w-full max-w-4xl mx-auto p-6 mt-8 shadow-lg animate-fade-up">
      <form className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-booking-600" />
            <h2 className="text-xl font-semibold text-booking-800">Your Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-booking-400" />
                <Input id="email" type="email" placeholder="john@example.com" />
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
              />
            </div>
          </div>
        </div>

        <Button className="w-full md:w-auto" size="lg">
          Schedule Discovery Call
        </Button>
      </form>
    </Card>
  );
}
