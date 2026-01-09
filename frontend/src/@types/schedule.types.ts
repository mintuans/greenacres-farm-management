/**
 * Types for Schedule/Calendar events
 */

export type EventType = 'staff' | 'task' | 'harvest' | 'issue' | 'maintenance';

export interface ScheduleEvent {
    id: string;
    title: string;
    description?: string;
    type: EventType;
    date: Date;
    startTime?: string; // Format: "HH:mm"
    endTime?: string;   // Format: "HH:mm"
    assignedTo?: string[]; // Staff IDs
    location?: string;
    status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface WorkShift {
    id: string;
    staffId: string;
    staffName: string;
    date: Date;
    startTime: string;
    endTime: string;
    role: 'field-worker' | 'machine-operator' | 'supervisor' | 'other';
    task?: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
}

export interface CalendarFilter {
    role: 'all' | 'field' | 'machine' | 'supervisor';
    eventTypes: EventType[];
    dateRange?: {
        start: Date;
        end: Date;
    };
}
