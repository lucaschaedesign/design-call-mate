
export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

import { initiateGoogleAuth } from './googleAuth';
import { toast } from 'sonner';

export async function createCalendarEvent(event: CalendarEvent) {
  try {
    // Check if there's an access token in localStorage
    const accessToken = localStorage.getItem('google_access_token');
    const tokenExpiration = localStorage.getItem('token_expiration');
    
    // If no token or token is expired, trigger reauthentication
    if (!accessToken || !tokenExpiration || Date.now() > Number(tokenExpiration)) {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('token_expiration');
      toast.error('Calendar authentication required. Please authenticate with Google Calendar.');
      initiateGoogleAuth(); // This will redirect to Google auth
      return;
    }

    console.log('Starting calendar event creation with:', {
      summary: event.summary,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      attendees: event.attendees
    });

    // Create the request body and log it
    const requestBody = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.attendees.map(email => ({ 
        email,
        responseStatus: 'needsAction',
        optional: false
      })),
      organizer: {
        email: 'hi@lucaschae.com',
        self: true
      },
      sendNotifications: true,
      sendUpdates: 'all',
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 10 }
        ]
      },
      conferenceData: {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    };

    console.log('Request body:', requestBody);
    console.log('Access token present:', !!accessToken);

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all&conferenceDataVersion=1', 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Full API response:', data);
    
    if (!response.ok) {
      console.error('Calendar API Error:', data);
      
      // Handle authentication errors with automatic reauthentication
      if (response.status === 401) {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('token_expiration');
        toast.error('Session expired. Redirecting to Google Calendar authentication...');
        initiateGoogleAuth(); // This will redirect to Google auth
        return;
      }
      
      throw new Error(data.error?.message || 'Failed to create calendar event');
    }

    if (data.status === 'confirmed') {
      console.log('Event created successfully with ID:', data.id);
      console.log('Attendees:', data.attendees);
      console.log('Conference data:', data.conferenceData);
    }

    return data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export function calculateEndTime(date: Date, timeString: string, durationMinutes: number): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const startTime = new Date(date);
  startTime.setHours(hours, minutes, 0);
  
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  return endTime.toISOString();
}

export function formatStartTime(date: Date, timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const startTime = new Date(date);
  startTime.setHours(hours, minutes, 0);
  return startTime.toISOString();
}
