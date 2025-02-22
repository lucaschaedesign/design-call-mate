
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isAuthenticated, initiateGoogleAuth } from "@/lib/googleAuth";
import { VideoIcon } from "@/components/icons/VideoIcon";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  meeting_date: string;
  meeting_time: string;
  status: string;
  business_name?: string;
  project_type?: string;
  project_size?: string;
  industry?: string;
  budget?: string;
  timeline?: string;
  message?: string;
  meeting_link?: string | null;
}

interface SecretResponse {
  secret: string | null;
}

interface SecretParams {
  name: string;
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('calls');
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [loadingTranscripts, setLoadingTranscripts] = useState<Record<string, boolean>>({});
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    checkCalendarAuth();
    fetchBookings();
  }, []);

  const checkCalendarAuth = () => {
    const isCalendarAuth = isAuthenticated();
    setCalendarConnected(isCalendarAuth);
  };

  async function fetchBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("meeting_date", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  }

  const handleCalendarReconnect = () => {
    try {
      initiateGoogleAuth();
    } catch (error) {
      console.error('Failed to reconnect calendar:', error);
      toast.error('Failed to reconnect to Google Calendar');
    }
  };

  const fetchTranscript = async (bookingId: string) => {
    setLoadingTranscripts(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      const API_KEY = 'sk_49c62954bcb37646b9658ffa06c4794a32416af7b34090c4';
      const AGENT_ID = 'Niup5RvSzU7eQ7F9X4MW';
      const CONVERSATION_ID = '3OOuCvfy8iIrJTc4Qu7L';

      // First, fetch conversations
      const conversationsResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}`,
        {
          headers: {
            'xi-api-key': API_KEY,
          },
        }
      );

      if (!conversationsResponse.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const conversationsData = await conversationsResponse.json();
      
      // Then fetch the specific conversation details
      const conversationResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${CONVERSATION_ID}`,
        {
          headers: {
            'xi-api-key': API_KEY,
          },
        }
      );

      if (!conversationResponse.ok) {
        throw new Error('Failed to fetch conversation details');
      }

      const conversationData = await conversationResponse.json();
      console.log('Conversation Data:', conversationData);
      
      // Format the conversation into a readable transcript
      let transcriptText = conversationData.transcript  // Access the transcript array
        .filter((message: any) => message.message !== null) // Filter out null messages
        .map((message: any) => {
          const role = message.role === 'agent' ? 'Agent' : 'Client';
          return `${role}: ${message.message}`;
        })
        .join('\n\n');

      // Optional: Add the summary at the end if you want it
      if (conversationData.analysis?.transcript_summary) {
        transcriptText += '\n\n--- Summary ---\n' + conversationData.analysis.transcript_summary;
      }

      setTranscripts(prev => ({
        ...prev,
        [bookingId]: transcriptText
      }));

      toast.success('Transcript loaded successfully');
    } catch (error) {
      console.error('Error fetching transcript:', error);
      toast.error('Failed to load transcript');
    } finally {
      setLoadingTranscripts(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const getCallStatus = (booking: Booking) => {
    const now = new Date();
    const meetingDate = new Date(`${booking.meeting_date}T${booking.meeting_time}`);
    const meetingEnd = new Date(meetingDate.getTime() + 30 * 60000); // 30 minutes duration

    if (now < meetingDate) {
      return { label: "Not Started", color: "text-gray-500" };
    } else if (now >= meetingDate && now <= meetingEnd) {
      return { label: "Now in Call", color: "text-red-500" };
    } else {
      return { label: "Done", color: "text-green-500" };
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'boards':
        return <KanbanBoard />;
      
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Calendar Integration</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Google Calendar Status</p>
                    <p className={`text-sm font-medium ${calendarConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {calendarConnected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  {!calendarConnected && (
                    <Button onClick={handleCalendarReconnect} variant="outline">
                      Reconnect Calendar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      default: // 'calls'
        return (
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Calls</h2>
              
              {loading ? (
                <div>Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <Card className="p-6">
                  <p className="text-center text-gray-500">No bookings found</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const status = getCallStatus(booking);
                    const isExpanded = expandedBooking === booking.id;
                    const isLoadingTranscript = loadingTranscripts[booking.id];
                    const transcript = transcripts[booking.id];

                    return (
                      <Card key={booking.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium">{booking.client_name}</h3>
                              <p className="text-sm text-gray-500">{booking.client_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(new Date(booking.meeting_date), "MMM dd")}
                              </div>
                              <div className="text-gray-500">
                                {booking.meeting_time} (30 min)
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${status.color}`}>
                              {status.label}
                            </div>
                            <button
                              onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? "collapse" : "view detail"}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t">
                            <Tabs defaultValue="details">
                              <TabsList>
                                <TabsTrigger value="details">Booking Details</TabsTrigger>
                                <TabsTrigger value="transcript">Call Transcript</TabsTrigger>
                              </TabsList>
                              <TabsContent value="details" className="mt-4">
                                <div className="space-y-4">
                                  {booking.business_name && (
                                    <div>
                                      <h4 className="text-sm font-medium">Business Name</h4>
                                      <p className="text-sm text-gray-600">{booking.business_name}</p>
                                    </div>
                                  )}
                                  {booking.industry && (
                                    <div>
                                      <h4 className="text-sm font-medium">Industry</h4>
                                      <p className="text-sm text-gray-600">{booking.industry}</p>
                                    </div>
                                  )}
                                  {booking.project_type && (
                                    <div>
                                      <h4 className="text-sm font-medium">Project Type</h4>
                                      <p className="text-sm text-gray-600">{booking.project_type}</p>
                                    </div>
                                  )}
                                  {booking.message && (
                                    <div>
                                      <h4 className="text-sm font-medium">Additional Information</h4>
                                      <p className="text-sm text-gray-600">{booking.message}</p>
                                    </div>
                                  )}
                                  {booking.meeting_link && (
                                    <div className="flex items-center gap-2">
                                      <a
                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2" 
                                        href={booking.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <VideoIcon className="w-4 h-4" />
                                        Join Meeting
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="transcript" className="mt-4">
                                {transcript ? (
                                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                    {transcript}
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-4">
                                      {isLoadingTranscript 
                                        ? "Loading transcript..."
                                        : "Call transcript and summary will be added after the call."}
                                    </p>
                                    {!isLoadingTranscript && !transcript && (
                                      <Button
                                        onClick={() => fetchTranscript(booking.id)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        Get transcript
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6">
      <div className="flex gap-6 max-w-[1800px] mx-auto">
        <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1">
          <Card className="p-6 shadow-sm bg-white/70 backdrop-blur-sm border-white/20">
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
}
