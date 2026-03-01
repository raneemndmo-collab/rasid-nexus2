export enum EventType { MEETING = 'meeting', TASK = 'task', REMINDER = 'reminder', HOLIDAY = 'holiday', CUSTOM = 'custom' }
export enum EventStatus { CONFIRMED = 'confirmed', TENTATIVE = 'tentative', CANCELLED = 'cancelled' }

export interface CalendarEvent {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  eventType: EventType;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  recurrenceRule?: string;
  location?: string;
  organizerId: string;
  attendees: { userId: string; status: string }[];
  status: EventStatus;
  reminderMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}
