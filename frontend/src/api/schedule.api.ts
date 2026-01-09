import axios from 'axios';
import { ScheduleEvent, WorkShift } from '@/src/@types/schedule.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * API service for Schedule/Calendar operations
 */
export const scheduleAPI = {
    /**
     * Lấy danh sách events theo tháng và năm
     */
    getEventsByMonth: async (month: number, year: number): Promise<ScheduleEvent[]> => {
        try {
            const response = await axios.get(`${API_URL}/schedules`, {
                params: { month: month + 1, year } // Backend expects 1-12, JS uses 0-11
            });

            // Convert date strings to Date objects
            return response.data.map((event: any) => ({
                ...event,
                date: new Date(event.event_date),
                createdAt: event.created_at ? new Date(event.created_at) : undefined,
                updatedAt: event.updated_at ? new Date(event.updated_at) : undefined,
            }));
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết một event
     */
    getEventById: async (id: string): Promise<ScheduleEvent> => {
        try {
            const response = await axios.get(`${API_URL}/schedules/${id}`);
            return {
                ...response.data,
                date: new Date(response.data.event_date),
            };
        } catch (error) {
            console.error('Error fetching event:', error);
            throw error;
        }
    },

    /**
     * Tạo event mới
     */
    createEvent: async (event: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScheduleEvent> => {
        try {
            const response = await axios.post(`${API_URL}/schedules`, {
                title: event.title,
                description: event.description,
                event_type: event.type,
                event_date: event.date.toISOString().split('T')[0], // YYYY-MM-DD
                start_time: event.startTime,
                end_time: event.endTime,
                location: event.location,
                status: event.status || 'pending',
            });

            return {
                ...response.data,
                date: new Date(response.data.event_date),
            };
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    /**
     * Cập nhật event
     */
    updateEvent: async (id: string, event: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
        try {
            const payload: any = {};

            if (event.title) payload.title = event.title;
            if (event.description !== undefined) payload.description = event.description;
            if (event.type) payload.event_type = event.type;
            if (event.date) payload.event_date = event.date.toISOString().split('T')[0];
            if (event.startTime !== undefined) payload.start_time = event.startTime;
            if (event.endTime !== undefined) payload.end_time = event.endTime;
            if (event.location !== undefined) payload.location = event.location;
            if (event.status) payload.status = event.status;

            const response = await axios.put(`${API_URL}/schedules/${id}`, payload);

            return {
                ...response.data,
                date: new Date(response.data.event_date),
            };
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    /**
     * Xóa event
     */
    deleteEvent: async (id: string): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/schedules/${id}`);
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách work shifts theo tháng
     */
    getShiftsByMonth: async (month: number, year: number): Promise<WorkShift[]> => {
        try {
            const response = await axios.get(`${API_URL}/shifts`, {
                params: { month: month + 1, year }
            });

            return response.data.map((shift: any) => ({
                ...shift,
                date: new Date(shift.shift_date),
            }));
        } catch (error) {
            console.error('Error fetching shifts:', error);
            throw error;
        }
    },

    /**
     * Tạo work shift mới
     */
    createShift: async (shift: Omit<WorkShift, 'id'>): Promise<WorkShift> => {
        try {
            const response = await axios.post(`${API_URL}/shifts`, {
                staff_id: shift.staffId,
                shift_date: shift.date.toISOString().split('T')[0],
                start_time: shift.startTime,
                end_time: shift.endTime,
                role: shift.role,
                task: shift.task,
                status: shift.status || 'scheduled',
            });

            return {
                ...response.data,
                date: new Date(response.data.shift_date),
            };
        } catch (error) {
            console.error('Error creating shift:', error);
            throw error;
        }
    },

    /**
     * Cập nhật work shift
     */
    updateShift: async (id: string, shift: Partial<WorkShift>): Promise<WorkShift> => {
        try {
            const payload: any = {};

            if (shift.staffId) payload.staff_id = shift.staffId;
            if (shift.date) payload.shift_date = shift.date.toISOString().split('T')[0];
            if (shift.startTime) payload.start_time = shift.startTime;
            if (shift.endTime) payload.end_time = shift.endTime;
            if (shift.role) payload.role = shift.role;
            if (shift.task !== undefined) payload.task = shift.task;
            if (shift.status) payload.status = shift.status;

            const response = await axios.put(`${API_URL}/shifts/${id}`, payload);

            return {
                ...response.data,
                date: new Date(response.data.shift_date),
            };
        } catch (error) {
            console.error('Error updating shift:', error);
            throw error;
        }
    },

    /**
     * Xóa work shift
     */
    deleteShift: async (id: string): Promise<void> => {
        try {
            await axios.delete(`${API_URL}/shifts/${id}`);
        } catch (error) {
            console.error('Error deleting shift:', error);
            throw error;
        }
    },
};

export default scheduleAPI;
