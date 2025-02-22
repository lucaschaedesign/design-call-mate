import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Send, Paperclip, Smile } from "lucide-react";
import { Message, BookingData } from "@/lib/chat";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function ChatInterface({
  onComplete
}: {
  onComplete: (data: BookingData) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<BookingData>({});
  
  useEffect(() => {
    handleInitialMessage();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInitialMessage = async () => {
    const initialMessages: Message[] = [
      {
        role: 'assistant',
        content: "Hey! I'm excited to help you create something amazing! 👋 To get started, could you tell me your business name?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initialMessages);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-response', {
        body: {
          messages: [...messages, userMessage],
          bookingData
        }
      });

      if (error) {
        throw error;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        options: data.options
      }]);

      if (data.bookingData) {
        setBookingData(prev => ({
          ...prev,
          ...data.bookingData
        }));

        if (data.completed) {
          onComplete(data.bookingData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (option: string) => {
    if (option === 'custom') {
      const currentStep = messages[messages.length - 1]?.options?.[0]?.label;
      if (currentStep?.includes('date')) {
        setShowDatePicker(true);
      } else if (currentStep?.includes('time')) {
        setShowTimePicker(true);
      }
      return;
    }
    
    const userMessage: Message = {
      role: 'user',
      content: option,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-response', {
        body: {
          messages: [...messages, userMessage],
          bookingData
        }
      });

      if (error) {
        throw error;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        options: data.options
      }]);

      if (data.bookingData) {
        setBookingData(prev => ({
          ...prev,
          ...data.bookingData
        }));

        if (data.completed) {
          onComplete(data.bookingData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDateSelect = (date: Date) => {
    setShowDatePicker(false);
    handleOptionSelect(date.toISOString().split('T')[0]);
  };

  const handleCustomTimeSelect = (time: string) => {
    setShowTimePicker(false);
    handleOptionSelect(time);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-white shadow-lg rounded-2xl">
      <ScrollArea className="flex-1 p-6 space-y-6" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'assistant' ? '' : 'flex-row-reverse'
            }`}
          >
            <Avatar className={`w-10 h-10 rounded-full border-2 border-white ${
              message.role === 'assistant' ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              <div className={`w-full h-full flex items-center justify-center text-sm font-semibold ${
                message.role === 'assistant' ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {message.role === 'assistant' ? '👩‍💼' : '👤'}
              </div>
            </Avatar>
            
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className={`rounded-2xl p-4 ${
                message.role === 'assistant'
                  ? 'bg-white border border-gray-200'
                  : 'bg-blue-50 ml-auto'
              }`}>
                <p className="text-gray-800">{message.content}</p>
              </div>
              {message.timestamp && (
                <span className="text-xs text-gray-400 px-2">
                  {message.timestamp}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {messages[messages.length - 1]?.options && (
          <div className="flex flex-wrap gap-2 mt-2 px-12">
            {messages[messages.length - 1].options?.map((option, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-50 transition-colors py-2 px-4 rounded-full"
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 px-12">
            <div className="animate-pulse flex gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2"
        >
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Paperclip className="h-5 w-5" />
          </button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Write a message..."
            disabled={isLoading}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          />
          <button type="button" className="text-gray-400 hover:text-gray-600">
            <Smile className="h-5 w-5" />
          </button>
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-full bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={new Date()}
            onSelect={(date) => date && handleCustomDateSelect(date)}
            disabled={(date) =>
              date < new Date() || // Can't select past dates
              date.getDay() === 0 || // Sunday
              date.getDay() === 6    // Saturday
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Popover open={showTimePicker} onOpenChange={setShowTimePicker}>
        <PopoverContent className="w-48">
          <Select onValueChange={handleCustomTimeSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 16 }, (_, i) => {
                const hour = Math.floor(i / 2) + 9; // Start at 9 AM
                const minute = i % 2 === 0 ? "00" : "30";
                const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                return (
                  <SelectItem key={time} value={time}>
                    {hour > 12 ? `${hour - 12}:${minute} PM` : `${hour}:${minute} AM`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </PopoverContent>
      </Popover>
    </Card>
  );
}
