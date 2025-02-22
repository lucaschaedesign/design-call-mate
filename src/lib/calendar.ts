
export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

export async function createCalendarEvent(event: CalendarEvent) {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('google_access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        attendees: event.attendees.map(email => ({ email })),
        sendUpdates: 'all',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create calendar event');
    }

    return await response.json();
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
