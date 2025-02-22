
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

const timeSlots = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

const durations = [
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
];

interface BookingCalendarProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedDuration: number;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onDurationSelect: (duration: number) => void;
}

export function BookingCalendar({
  selectedDate,
  selectedTime,
  selectedDuration,
  onDateSelect,
  onTimeSelect,
  onDurationSelect
}: BookingCalendarProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-booking-600" />
            <h2 className="text-xl font-semibold text-booking-800">Select Date</h2>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="rounded-md border shadow-sm"
          />
        </Card>

        <div className="space-y-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-booking-600" />
              <h2 className="text-xl font-semibold text-booking-800">Select Time</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="w-full"
                  onClick={() => onTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-booking-800 mb-4">Duration</h2>
            <div className="grid grid-cols-3 gap-2">
              {durations.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value ? "default" : "outline"}
                  className="w-full"
                  onClick={() => onDurationSelect(duration.value)}
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
