
import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Send } from "lucide-react";
import { Message, BookingData, PREDEFINED_OPTIONS } from "@/lib/chat";
import { useToast } from "./ui/use-toast";

export function ChatInterface({
  onComplete
}: {
  onComplete: (data: BookingData) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<BookingData>({});
  
  useEffect(() => {
    // Start the conversation
    handleInitialMessage();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInitialMessage = async () => {
    const initialMessage: Message = {
      role: 'assistant',
      content: "Hi! I'm here to help you schedule a discovery call. First, could you tell me your business name?",
    };
    setMessages([initialMessage]);
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
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          bookingData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      
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

  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    handleSend();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <ScrollArea className="flex-1 p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'assistant' ? '' : 'flex-row-reverse'
            }`}
          >
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8">
                <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-sm font-semibold">
                  AI
                </div>
              </Avatar>
            )}
            
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === 'assistant'
                  ? 'bg-muted'
                  : 'bg-primary text-primary-foreground ml-auto'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {messages[messages.length - 1]?.options && (
          <div className="flex flex-wrap gap-2 mt-2">
            {messages[messages.length - 1].options?.map((option, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-pulse">...</div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
