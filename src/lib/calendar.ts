
export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

export async function createCalendarEvent(event: CalendarEvent) {
  try {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) {
      throw new Error('No access token found. Please authenticate with Google Calendar.');
    }

    console.log('Creating calendar event with token:', accessToken.substring(0, 10) + '...');
    console.log('Event details:', {
      summary: event.summary,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      attendees: event.attendees
    });

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

    console.log('Sending request with body:', requestBody);

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', 
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
    console.log('Response data:', data);

    if (!response.ok) {
      // If we get a 401 (Unauthorized), clear the token and throw an error
      if (response.status === 401) {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('token_expiration');
        throw new Error('Calendar authentication expired. Please reconnect your calendar.');
      }
      throw new Error(data.error?.message || 'Failed to create calendar event');
    }

    return data;
  } catch (error) {
    console.error('Calendar event creation error:', error);
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
