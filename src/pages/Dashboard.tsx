
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
import { Task as KanbanTask } from '@/hooks/useKanban';
import { ElevenLabsClient } from "elevenlabs";

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
  data: string | null;
}

interface SecretParams {
  secret_name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status_id: string;
  due_date: string | null;
  assignee: string | null;
  date_completed: string | null;
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('calls');
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});
  const [loadingTranscripts, setLoadingTranscripts] = useState<Record<string, boolean>>({});
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);

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

      // Create ElevenLabs client
      const client = new ElevenLabsClient({ apiKey: API_KEY });

      // Get all conversations
      const response = await client.conversationalAi.getConversations({
        agent_id: AGENT_ID
      });

      console.log('API Response:', response);

      // Access the conversations array from the response
      const conversations = response.conversations;
      console.log('All conversations:', conversations);

      if (!conversations || conversations.length === 0) {
        throw new Error('No conversations found');
      }

      // Get the latest conversation
      const latestConversation = conversations[0]; // Assuming conversations are sorted by date
      console.log('Latest conversation:', latestConversation);

      // Get the detailed conversation data
      const conversationData = await client.conversationalAi.getConversation(latestConversation.conversation_id);
      console.log('Conversation Data:', conversationData);
      
      // Generate tasks from the transcript
      if (conversationData.transcript) {
        await handleGenerateTasks(conversationData.transcript);
      }
      
      // Format the conversation into a readable transcript
      let transcriptText = conversationData.transcript
        .filter((message: any) => message.message !== null)
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

  const handleGenerateTasks = async (transcript: any[]) => {
    try {
      console.log('Starting task generation with transcript:', transcript);
      
      const OPENAI_API_KEY = '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';

      const conversationText = transcript
        .map(msg => `${msg.role}: ${msg.message}`)
        .join('\n');
      
      console.log('Conversation text prepared:', conversationText);

      // First, get the 'todo' status ID from the KanbanBoard
      const { data: statusesData } = await supabase
        .from('kanban_statuses')
        .select('*')
        .eq('name', 'To Do')
        .single();

      if (!statusesData) {
        throw new Error('Could not find To Do status');
      }

      const todoStatusId = statusesData.id;
      console.log('Todo status ID:', todoStatusId);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a detailed task extractor. Extract AT LEAST 10 specific, actionable tasks from the conversation transcript. Break down large tasks into smaller subtasks. Your response must be ONLY a valid JSON array. Each object must have exactly these fields: title (string), description (string). Make tasks specific and actionable. Do not include any markdown formatting or additional text. Example format: [{\"title\":\"Task 1\",\"description\":\"Description 1\"}]"
            },
            {
              role: "user",
              content: `Extract detailed tasks from this conversation. Remember to break down large tasks into smaller, manageable subtasks:\n${conversationText}`
            }
          ],
          temperature: 0.7, // Add some creativity
          max_tokens: 2000  // Allow for longer response
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        throw new Error('Failed to generate tasks');
      }

      const data = await response.json();
      console.log('OpenAI response:', data);
      
      let generatedTasks;
      try {
        const content = data.choices[0].message.content.trim();
        const cleanContent = content.replace(/```json\n?|\n?```/g, '');
        generatedTasks = JSON.parse(cleanContent);
        
        if (!Array.isArray(generatedTasks)) {
          throw new Error('Response is not an array');
        }
        
        console.log('Generated tasks:', generatedTasks);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.log('Raw content:', data.choices[0].message.content);
        throw new Error('Invalid task format returned from OpenAI');
      }

      // Insert tasks into the database
      const { data: insertedTasks, error: insertError } = await supabase
        .from('tasks')
        .insert(
          generatedTasks.map(task => ({
            title: task.title,
            description: task.description,
            status_id: todoStatusId,
            assignee: null,
            due_date: null,
            date_completed: null
          }))
        )
        .select();

      if (insertError) {
        console.error('Error inserting tasks:', insertError);
        throw new Error('Failed to save tasks');
      }

      console.log('Inserted tasks:', insertedTasks);

      // Update tasks state with the newly inserted tasks
      setTasks(prevTasks => {
        const newTasks = [...prevTasks, ...insertedTasks];
        console.log('Updated tasks state:', newTasks);
        return newTasks;
      });

      toast.success('Tasks generated successfully');

    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error('Failed to generate tasks');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'boards':
        return <KanbanBoard tasks={tasks} setTasks={setTasks} />;
      
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
              <h1 className="text-4xl font-bold text-gray-900 mb-8">Upcoming Calls</h1>
              
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

                    return (
                      <div 
                        key={booking.id} 
                        className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  {booking.client_name}
                                </h3>
                                <p className="text-gray-500 mt-1">{booking.client_email}</p>
                              </div>
                              <div className="text-gray-500 font-mono">
                                {booking.business_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <div>
                                <div className="text-base font-medium text-gray-900">
                                  {format(new Date(booking.meeting_date), "MMM dd")}
                                </div>
                                <div className="text-gray-500 flex items-center gap-2">
                                  {booking.meeting_time}
                                  <span className="text-gray-400">(15 min)</span>
                                </div>
                              </div>
                              <div>
                                <span 
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    status.label === "Done" 
                                      ? "bg-green-50 text-green-700" 
                                      : status.label === "Now in Call"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                    status.label === "Done" 
                                      ? "bg-green-600" 
                                      : status.label === "Now in Call"
                                      ? "bg-red-600"
                                      : "bg-gray-500"
                                  }`}></span>
                                  {status.label}
                                </span>
                              </div>
                              <button
                                onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                              >
                                {isExpanded ? "collapse" : "view detail"}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                              <Tabs defaultValue="details" className="w-full">
                                <TabsList className="mb-4">
                                  <TabsTrigger value="details">Booking Details</TabsTrigger>
                                  <TabsTrigger value="transcript">Call Transcript</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details">
                                  <div className="grid grid-cols-2 gap-6">
                                    {booking.business_name && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-600 mb-1">Business Name</h4>
                                        <p className="text-gray-900">{booking.business_name}</p>
                                      </div>
                                    )}
                                    {booking.industry && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-600 mb-1">Industry</h4>
                                        <p className="text-gray-900">{booking.industry}</p>
                                      </div>
                                    )}
                                    {booking.project_type && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-600 mb-1">Project Type</h4>
                                        <p className="text-gray-900">{booking.project_type}</p>
                                      </div>
                                    )}
                                    {booking.message && (
                                      <div className="col-span-2">
                                        <h4 className="text-sm font-medium text-gray-600 mb-1">Additional Information</h4>
                                        <p className="text-gray-900">{booking.message}</p>
                                      </div>
                                    )}
                                  </div>
                                  {booking.meeting_link && (
                                    <div className="mt-6">
                                      <a
                                        href={booking.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                      >
                                        <VideoIcon className="w-4 h-4" />
                                        Join Meeting
                                      </a>
                                    </div>
                                  )}
                                </TabsContent>
                                <TabsContent value="transcript">
                                  {transcripts[booking.id] ? (
                                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {transcripts[booking.id]}
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-4">
                                        {loadingTranscripts[booking.id] 
                                          ? "Loading transcript..."
                                          : "Call transcript and summary will be added after the call."}
                                      </p>
                                      {!loadingTranscripts[booking.id] && (
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
                        </div>
                      </div>
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
